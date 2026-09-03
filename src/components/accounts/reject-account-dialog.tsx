"use client";

import { useState } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRejectAccount } from "@/hooks/use-accounts";

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
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  async function submit() {
    if (reason.trim().length < 3) {
      toast.error("Please give a reason for the rejection");
      return;
    }
    try {
      await rejectMut.mutateAsync({ reason: reason.trim(), note: note.trim() || undefined });
      toast.success(`${accountName} rejected`);
      setReason("");
      setNote("");
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
            Portal access is revoked immediately. The request and all its data are
            kept for 90 days so the decision can be reversed, then permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Reason <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Business information could not be verified"
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted">Shown to other admins on the review decision.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Internal note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Optional context for the team"
              className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
            {rejectMut.isPending ? "Rejecting…" : "Reject request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
