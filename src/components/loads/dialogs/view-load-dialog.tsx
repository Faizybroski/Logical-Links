"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Truck, Pencil, Package, Tag, Calendar, DollarSign, Weight } from "lucide-react";
import type { Shipment } from "@/types/api.types";
import { StatusBadge } from "@/components/loads/status-badge";
import { formatDate } from "@/lib/utils/format-date";
import { DetailTile } from "@/components/loads/detail-title";

export function ViewLoadDialog({
  shipment,
  open,
  onClose,
  canEdit,
  onEdit,
}: {
  shipment: Shipment;
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
  onEdit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl border border-card-border bg-card p-0 shadow-2xl">
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Shipment Details
              </p>
              <DialogTitle className="mt-1 text-3xl font-bold text-foreground">
                {shipment.load_number}
              </DialogTitle>
              <div className="mt-1.5">
                <StatusBadge status={shipment.status} />
              </div>
            </div>
            {canEdit && (
              <Button
                size="sm"
                onClick={onEdit}
                className="mt-8 shrink-0 gap-1.5 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Route strip */}
        <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl border border-card-border bg-background px-5 py-4">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Origin</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">
              {shipment.origin_city}, {shipment.origin_state}
            </p>
            <p className="text-xs text-muted">{shipment.origin_address}</p>
          </div>
          <div className="flex flex-1 items-center gap-1">
            <div className="h-px flex-1 bg-card-border" />
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </div>
            <div className="h-px flex-1 bg-card-border" />
          </div>
          <div className="flex-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Destination</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">
              {shipment.destination_city}, {shipment.destination_state}
            </p>
            <p className="text-xs text-muted">{shipment.destination_address}</p>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-7 pt-4">
          <DetailTile
            icon={<Package className="h-4 w-4" />}
            label="Shipper"
            value={shipment.accounts?.account_name ?? "Unassigned"}
          />
          <DetailTile
            icon={<Tag className="h-4 w-4" />}
            label="Type"
            value={shipment.shipment_type.replace("_", " ")}
          />
          {shipment.weight_kg != null && (
            <DetailTile
              icon={<Weight className="h-4 w-4" />}
              label="Weight"
              value={`${shipment.weight_kg} kg`}
            />
          )}
          {shipment.quoted_price != null && (
            <DetailTile
              icon={<DollarSign className="h-4 w-4" />}
              label="Quoted Price"
              value={`${shipment.currency} ${shipment.quoted_price.toFixed(2)}`}
            />
          )}
          <DetailTile
            icon={<Calendar className="h-4 w-4" />}
            label="Created"
            value={formatDate(shipment.created_at)}
          />
          {shipment.reference_number && (
            <DetailTile
              icon={<Tag className="h-4 w-4" />}
              label="Reference"
              value={shipment.reference_number}
            />
          )}
        </div>

        {shipment.cargo_description && (
          <div className="border-t border-card-border px-7 pb-6 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Cargo</p>
            <p className="mt-1 text-sm text-foreground">{shipment.cargo_description}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
