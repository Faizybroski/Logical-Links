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
import { StatusCombobox } from "@/components/loads/status-combobox";
import { Shipment, SHIPMENT_STATUS_LABELS } from "@/types/api.types";
import type { Status } from "@/types/api.types";

// Terminal states from which no transition is allowed
const TERMINAL_STATUSES = new Set(["delivered", "cancelled"]);

interface Props {
  shipment: Shipment;
  open:     boolean;
  onClose:  () => void;
  onConfirm: (status: string, reason?: string) => void;
  loading?: boolean;
}

export function StatusChangeDialog({ shipment, open, onClose, onConfirm, loading }: Props) {
  const isTerminal = TERMINAL_STATUSES.has(shipment.status);

  const [selected, setSelected] = useState<string>("");
  const [reason, setReason]     = useState("");

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected, reason || undefined);
  }

  function handleClose() {
    setSelected("");
    setReason("");
    onClose();
  }

  const currentLabel =
    SHIPMENT_STATUS_LABELS[shipment.status as keyof typeof SHIPMENT_STATUS_LABELS] ??
    shipment.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">Change Status</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Load {shipment.load_number} — current status:{" "}
            <span className="font-medium text-foreground">{currentLabel}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-7 py-6">
          {isTerminal ? (
            <p className="text-sm text-muted">
              This shipment is in a terminal state and cannot be updated further.
            </p>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  New Status
                </label>
                <StatusCombobox
                  value={selected || null}
                  onChange={(slug: string, _status: Status) => setSelected(slug)}
                />
              </div>

              {selected === "cancelled" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Cancellation Reason
                  </label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this shipment being cancelled?"
                    className="min-h-[80px] resize-none rounded-[10px] border-card-border bg-background text-sm"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="rounded-[10px] border-card-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selected || loading || isTerminal}
              className="rounded-[10px] bg-primary px-6 text-sidebar hover:bg-primary/85"
            >
              {loading ? "Saving..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
