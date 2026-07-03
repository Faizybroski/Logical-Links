import { ShieldCheck, Truck } from "lucide-react";
import type { Shipment } from "@/types/api.types";

/** Derive the creator's display name from the shipment's joined profile. */
export function getCreatorName(shipment: Shipment): string {
  const p = shipment.profiles;
  if (!p) return "Unknown";
  if (p.full_name) return p.full_name;
  return p.role === "admin" ? "Admin User" : "Company User";
}

type Size = "sm" | "md";

interface CreatorBadgeProps {
  shipment: Shipment;
  size?: Size;
  showName?: boolean;
}

/**
 * Displays a colour-coded role chip (Super Admin / Shipping Company) with an optional creator name.
 *
 * Admin   → blue shield  — "Super Admin"
 * Shipper → violet truck — "Shipping Company"
 * null    → grey fallback (pre-migration rows treated as admin-managed)
 */
export function CreatorBadge({ shipment, size = "md", showName = false }: CreatorBadgeProps) {
  const role        = shipment.created_by_role ?? shipment.profiles?.role ?? null;
  const isShipper   = role === "shipper";
  const creatorName = showName ? getCreatorName(shipment) : null;

  const iconSize  = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize  = size === "sm" ? "text-[10px]" : "text-xs";
  const padSize   = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5";

  if (isShipper) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 font-medium text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300 ${padSize} ${textSize}`}>
        <Truck className={`shrink-0 ${iconSize}`} />
        {showName ? `Company: ${creatorName}` : "Shipping Company"}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-primary-dark bg-primary-light/50 font-medium text-primary-dark dark:border-primary-700 dark:bg-primary-light dark:text-primary-90 ${padSize} ${textSize}`}>
      <ShieldCheck className={`shrink-0 ${iconSize}`} />
      {showName ? `Admin: ${creatorName}` : "Super Admin"}
    </span>
  );
}
