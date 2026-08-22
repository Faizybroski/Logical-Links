"use client";

import { DeliveryStatus, DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from "@/types/api.types";

function prettifySlug(slug: string): string {
  return slug
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const label = DELIVERY_STATUS_LABELS[status as DeliveryStatus] ?? prettifySlug(status);
  const color =
    DELIVERY_STATUS_COLORS[status as DeliveryStatus] ??
    "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
