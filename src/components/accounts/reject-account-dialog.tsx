"use client";

import { useState } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRejectAccount } from "@/hooks/use-accounts";

// Fixed rejection reasons — mirrors REJECTION_REASON_META on the backend. Each
// reason generates a canned internal note and a canned customer email; only
// "Other" asks the admin to write the note themselves.
export const REJECTION_REASONS = [
  {
    value: "incomplete_information",
    label: "Incomplete / Insufficient Information",
    note: "Information is missing, incomplete, or there isn't enough information to approve the account.",
  },
  {
    value: "business_verification_failed",
    label: "Business Verification Unsuccessful",
    note: "The business information could not be verified.",
  },
  {
    value: "services_not_available",
    label: "Services or Coverage Not Available",
    note: "The requested services, delivery area, or requirements aren't currently supported.",
  },
  {
    value: "requirements_not_met",
    label: "Account Requirements Not Met",
    note: "The business doesn't meet the criteria for a corporate account.",
  },
  {
    value: "commercial_terms_unsuitable",
    label: "Commercial Terms Not Suitable",
    note: "Requested pricing, payment terms, volume, or other commercial requirements can't be accommodated.",
  },
  {
    value: "other",
    label: "Other",
    note: "Anything unusual that doesn't fit the standard reasons. Admin must provide a note.",
  },
] as const;

type ReasonValue = (typeof REJECTION_REASONS)[number]["value"];

export function RejectAccountDialog({
  accountId,
  accountName,
  open,
  onOpenChange,
  onRejected,
}: {
  accountId: string;
  accountName: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRejected?: () => void;
}) {
  const rejectMut = useRejectAccount(accountId);
  const [reason, setReason] = useState<ReasonValue | "">("");
  const [note, setNote] = useState("");

  const selected = REJECTION_REASONS.find((r) => r.value === reason);
  const isOther = reason === "other";

  function reset() {
    setReason("");
    setNote("");
  }

  async function submit() {
    if (!selected) {
      toast.error("Choose a rejection reason");
      return;
    }
    if (isOther && note.trim().length < 3) {
      toast.error("Add an internal note explaining the rejection");
      return;
    }
    try {
      await rejectMut.mutateAsync({
        reason: selected.value,
        note: isOther ? note.trim() : undefined,
      });
      toast.success(`${accountName} rejected`);
      reset();
      onOpenChange(false);
      onRejected?.();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Reject {accountName}
          </DialogTitle>
          <DialogDescription>
            The applicant is emailed a decision notice for the reason you choose.
            Portal access is revoked immediately. The application and associated
            data are retained for 90 days in case the decision needs to be
            revised, then permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value as ReasonValue | "")}
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>
                Select a reason…
              </option>
              {REJECTION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {selected && !isOther && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Internal note</label>
              <p className="rounded-xl border border-card-border bg-muted/10 px-3 py-2.5 text-sm text-foreground">
                {selected.note}
              </p>
              <p className="text-xs text-muted">
                Generated automatically for this reason and saved to the review decision.
              </p>
            </div>
          )}

          {isOther && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Internal note <span className="text-red-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Explain why this application is being rejected"
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted">Saved to the review decision. Not shown to the customer.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={rejectMut.isPending}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={rejectMut.isPending}
            className="bg-red-600 text-white hover:bg-red-600/90"
          >
            {rejectMut.isPending ? "Rejecting…" : "Reject application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
