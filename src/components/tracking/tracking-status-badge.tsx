"use client";

import { cn } from "@/lib/utils/cn";
import { TRACKING_STATUS_LABELS, TRACKING_STATUS_COLORS, type TrackingStatus } from "@/types/api.types";

interface Props {
  status: TrackingStatus;
  size?:  "sm" | "md";
}

export function TrackingStatusBadge({ status, size = "md" }: Props) {
  const label = TRACKING_STATUS_LABELS[status] ?? status;
  const color = TRACKING_STATUS_COLORS[status] ?? "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        color,
      )}
    >
      {label}
    </span>
  );
}
