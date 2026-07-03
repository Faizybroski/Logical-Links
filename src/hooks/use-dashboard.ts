import { useQuery } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { ShipmentStatus } from "@/types/api.types";

export interface TrendPoint {
  date:  string  // YYYY-MM-DD
  count: number
}

export interface DashboardStats {
  byStatus:          Record<ShipmentStatus, number>
  total:             number
  activeLoads:       number
  trend:             TrendPoint[]
  prevPeriodTotal:   number
  // Admin-only (undefined for shippers)
  totalShippers?:    number
  pendingApprovals?: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn:  () => api.get<ApiResponse<DashboardStats>>("/api/v1/dashboard/stats"),
    staleTime: 60_000, // 1 minute — dashboard data doesn't need instant freshness
  });
}

// ── Derived helpers (called by dashboard pages) ────────────────────────────

/** Convert trend TrendPoint[] to KpiCard sparkline format */
export function trendToSparkline(trend: TrendPoint[]): Array<{ value: number }> {
  return trend.map((t) => ({ value: t.count }));
}

/**
 * Compute growth percentage comparing the second half of the trend
 * (most recent 15 days) against the first half (previous 15 days).
 */
export function trendGrowth(trend: TrendPoint[]): { pct: string; direction: "up" | "down" } {
  if (trend.length < 2) return { pct: "0%", direction: "up" };
  const mid   = Math.floor(trend.length / 2);
  const prev  = trend.slice(0, mid).reduce((s, t) => s + t.count, 0);
  const curr  = trend.slice(mid).reduce((s, t) => s + t.count, 0);
  if (prev === 0 && curr === 0) return { pct: "0%", direction: "up" };
  if (prev === 0) return { pct: "100%", direction: "up" };
  const pct = ((curr - prev) / prev) * 100;
  return {
    pct:       `${Math.abs(pct).toFixed(1)}%`,
    direction: pct >= 0 ? "up" : "down",
  };
}

/**
 * Compute growth comparing current 30-day total against the previous 30-day total.
 */
export function periodGrowth(
  currentTotal: number,
  prevPeriodTotal: number,
): { pct: string; direction: "up" | "down" } {
  if (prevPeriodTotal === 0 && currentTotal === 0) return { pct: "0%", direction: "up" };
  if (prevPeriodTotal === 0) return { pct: "100%", direction: "up" };
  const pct = ((currentTotal - prevPeriodTotal) / prevPeriodTotal) * 100;
  return {
    pct:       `${Math.abs(pct).toFixed(1)}%`,
    direction: pct >= 0 ? "up" : "down",
  };
}
