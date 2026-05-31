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
import type { Shipment, AssignShipmentDto, UserProfile } from "@/types/api.types";

interface Props {
  shipment: Shipment;
  shippers: UserProfile[];
  open: boolean;
  onClose: () => void;
  onConfirm: (dto: AssignShipmentDto) => void;
  loading?: boolean;
}

export function AssignDialog({ shipment, shippers, open, onClose, onConfirm, loading }: Props) {
  const [userId, setUserId] = useState<string>("");
  const [error, setError]   = useState("");

  function handleClose() {
    setUserId("");
    setError("");
    onClose();
  }

  function handleConfirm() {
    if (!userId) {
      setError("Please select a shipper");
      return;
    }
    onConfirm({ userId });
  }

  // Only show approved, active shippers
  const eligibleShippers = shippers.filter((s) => s.isApproved);

  // If the load is already assigned to an account, find the matching shipper
  const lockedShipper = shipment.account_id
    ? shippers.find((s) => s.accountId === shipment.account_id)
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Assign to Shipper
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Load {shipment.load_number} — select the shipper to assign this load to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-7 py-6">
          {lockedShipper ? (
            <div className="rounded-[10px] border border-card-border bg-background px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Assigned Shipper (shipper-created — cannot change)
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {lockedShipper.fullName ?? lockedShipper.email}
              </p>
              {lockedShipper.email && (
                <p className="text-xs text-muted">{lockedShipper.email}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Shipper
              </label>
              <Select value={userId} onValueChange={(v) => { setUserId(v); setError(""); }}>
                <SelectTrigger className="h-11 w-full rounded-[10px] border-card-border bg-background text-sm focus:ring-primary/40">
                  <SelectValue placeholder="Select a shipper" />
                </SelectTrigger>
                <SelectContent className="border-card-border bg-card">
                  {eligibleShippers.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted">No approved shippers available</div>
                  ) : (
                    eligibleShippers.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-sm">
                        <span className="font-medium">{s.fullName ?? s.email}</span>
                        <span className="ml-2 text-xs text-muted">{s.email}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {error && <p className="mt-1 text-xs text-danger">{error}</p>}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="rounded-[10px] border-card-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading || !!lockedShipper}
              className="rounded-[10px] bg-primary px-6 text-sidebar hover:bg-primary/85"
            >
              {loading ? "Assigning..." : "Assign Shipper"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
