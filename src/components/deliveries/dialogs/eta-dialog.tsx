"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isoToDateInputValue } from "@/lib/utils/format-date";
import type { Delivery } from "@/types/api.types";

interface Props {
  delivery: Delivery;
  open:     boolean;
  onClose:  () => void;
  onConfirm: (estimatedDeliveryDate: string | null) => void;
  loading?: boolean;
}

// Standalone ETA setter — any internal (Logical Links) user, not gated
// behind full delivery-edit access. Same pattern as Status/Assign: a small
// dialog off the details sheet header, not a trip through the edit form.
export function EtaDialog({ delivery, open, onClose, onConfirm, loading }: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue(isoToDateInputValue(delivery.estimated_delivery_date));
  }, [open, delivery.estimated_delivery_date]);

  function handleConfirm() {
    onConfirm(value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">Set ETA</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Delivery {delivery.load_number} — the ops estimate shown to the customer, separate from their requested delivery date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-7 py-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Estimated Delivery Date
            </label>
            <Input
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-10 rounded-[10px] border-card-border bg-background text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-[10px] border-card-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-[10px] bg-primary px-6 text-sidebar hover:bg-primary/85"
            >
              {loading ? "Saving…" : "Save ETA"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
