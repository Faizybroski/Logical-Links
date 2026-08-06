import type { Tier } from "@/types/api.types";

export interface TierProgress {
  current: Tier;
  next: Tier | null;
  deliveredIntoTier: number;
  deliveriesToNext: number | null;
  progressPct: number;
}

// Tiers must already be sorted by rank ascending (as returned by GET /api/v1/tiers).
export function getTierProgress(delivered: number, tiers: Tier[]): TierProgress | null {
  if (tiers.length === 0) return null;

  let current = tiers[0];
  for (const tier of tiers) {
    if (delivered >= tier.min_deliveries) current = tier;
  }

  const next = tiers.find((t) => t.rank > current.rank) ?? null;
  const deliveredIntoTier = delivered - current.min_deliveries;

  if (!next) {
    return { current, next: null, deliveredIntoTier, deliveriesToNext: null, progressPct: 100 };
  }

  const span = next.min_deliveries - current.min_deliveries;
  const progressPct = span > 0 ? Math.min(100, Math.round((deliveredIntoTier / span) * 100)) : 100;

  return {
    current,
    next,
    deliveredIntoTier,
    deliveriesToNext: Math.max(0, next.min_deliveries - delivered),
    progressPct,
  };
}
