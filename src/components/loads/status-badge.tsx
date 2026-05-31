"use client";

import { ShipmentStatus, SHIPMENT_STATUS_LABELS, SHIPMENT_STATUS_COLORS } from "@/types/api.types";

type Props = {
  status: ShipmentStatus;
};

export function StatusBadge({ status }: Props) {
  const label = SHIPMENT_STATUS_LABELS[status] ?? status;
  const color = SHIPMENT_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
