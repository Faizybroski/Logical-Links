"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Archive } from "lucide-react";
import type { Delivery } from "@/types/api.types";
import { StatusBadge } from "@/components/deliveries/status-badge";

export function ArchiveConfirmDialog({
  delivery,
  open,
  onClose,
  onConfirm,
  loading,
}: {
  delivery: Delivery;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}) {
  const [reason, setReason] = useState("");

  function handleConfirm() {
    onConfirm(reason.trim());
  }

  function handleClose() {
    setReason("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <DialogTitle className="text-xl font-semibold text-foreground">Archive Delivery</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Moves this delivery out of the working views into Archived Deliveries. It isn't deleted — you can unarchive it any time.
          </DialogDescription>
        </DialogHeader>

        <div className="px-7 py-6 space-y-4">
          <div className="flex gap-3 rounded-[10px] border border-card-border bg-background px-4 py-4">
            <Archive className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Archive <span className="font-bold">{delivery.load_number}</span>?
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                Status: <StatusBadge status={delivery.status} />
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Note (optional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this delivery being archived?"
              className="min-h-20 resize-none rounded-[10px] border-card-border bg-background text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="rounded-[10px] border-card-border text-foreground hover:bg-background"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-[10px] bg-primary px-6 text-white hover:bg-primary/85"
            >
              <Archive className="mr-2 h-4 w-4" />
              {loading ? "Archiving..." : "Yes, Archive"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
