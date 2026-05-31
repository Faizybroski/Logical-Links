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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shipment,
  ShipmentStatus,
  SHIPMENT_STATUS_LABELS,
} from "@/types/api.types";

const STATUS_TRANSITIONS_MAP: Record<ShipmentStatus, ShipmentStatus[]> = {
  pending:          ["confirmed",        "cancelled"],
  confirmed:        ["assigned",         "cancelled"],
  assigned:         ["picked_up",        "cancelled"],
  picked_up:        ["in_transit",       "cancelled"],
  in_transit:       ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered",        "cancelled"],
  delivered:        [],
  cancelled:        [],
};

interface Props {
  shipment: Shipment;
  open: boolean;
  onClose: () => void;
  onConfirm: (status: ShipmentStatus, reason?: string) => void;
  loading?: boolean;
}

export function StatusChangeDialog({ shipment, open, onClose, onConfirm, loading }: Props) {
  const allowed = STATUS_TRANSITIONS_MAP[shipment.status] ?? [];

  // All valid transitions are available to any authorised user.
  // Access is enforced at the API layer (account_id / created_by ownership check).
  const options = allowed;

  const [selected, setSelected] = useState<ShipmentStatus | "">("");
  const [reason, setReason] = useState("");

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected, reason || undefined);
  }

  function handleClose() {
    setSelected("");
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
          <DialogTitle className="text-lg font-semibold text-foreground">Change Status</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Load {shipment.load_number} — current status:{" "}
            <span className="font-medium text-foreground">
              {SHIPMENT_STATUS_LABELS[shipment.status]}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-7 py-6">
          {options.length === 0 ? (
            <p className="text-sm text-muted">
              This shipment is in a terminal state and cannot be updated further.
            </p>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  New Status
                </label>
                <Select value={selected} onValueChange={(v) => setSelected(v as ShipmentStatus)}>
                  <SelectTrigger className="h-11 w-full rounded-[10px] border-card-border bg-background text-sm focus:ring-primary/40">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent className="border-card-border bg-card">
                    {options.map((s) => (
                      <SelectItem key={s} value={s} className="text-sm">
                        {SHIPMENT_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              disabled={!selected || loading || options.length === 0}
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
