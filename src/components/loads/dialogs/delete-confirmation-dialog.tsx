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
import { Trash2 } from "lucide-react";
import type { Shipment } from "@/types/api.types";
import { StatusBadge } from "@/components/loads/status-badge";

export function DeleteConfirmDialog({
  shipment,
  open,
  onClose,
  onConfirm,
  loading,
}: {
  shipment: Shipment;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  function handleConfirm() {
    if (!reason.trim()) {
      setError("Deletion reason is required");
      return;
    }
    onConfirm(reason.trim());
  }

  function handleClose() {
    setReason("");
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <DialogTitle className="text-xl font-semibold text-foreground">Delete Load</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="px-7 py-6 space-y-4">
          <div className="flex gap-3 rounded-[10px] border border-danger/20 bg-danger/5 px-4 py-4">
            <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="text-sm font-semibold text-danger">
                Delete <span className="font-bold">{shipment.load_number}</span>?
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                Status: <StatusBadge status={shipment.status} />
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Reason for deletion <span className="text-danger">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              placeholder="Why is this shipment being deleted?"
              className="min-h-20 resize-none rounded-[10px] border-card-border bg-background text-sm"
            />
            {error && <p className="mt-1 text-xs text-danger">{error}</p>}
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
              className="rounded-[10px] bg-danger px-6 text-white hover:bg-danger/85"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {loading ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
