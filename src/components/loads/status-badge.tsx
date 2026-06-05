"use client";

import { ShipmentStatus, SHIPMENT_STATUS_LABELS, SHIPMENT_STATUS_COLORS } from "@/types/api.types";

function prettifySlug(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const label = SHIPMENT_STATUS_LABELS[status as ShipmentStatus] ?? prettifySlug(status);
  const color =
    SHIPMENT_STATUS_COLORS[status as ShipmentStatus] ??
    "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
