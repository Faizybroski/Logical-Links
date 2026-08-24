"use client";

import Link from "next/link";
import { ArrowRight, Award, Gift } from "lucide-react";
import { useRewardsCreditSummary } from "@/hooks/use-rewards-credit";

// The residential "Get a Quote"/dashboard KPI card for the Rewards Member
// program — points balance + the delivery credit it's worth, with a link
// to the full details page. Corporate customers never see this; they have
// a separate tiers program instead.
export function RewardsMemberCard() {
  const { data, isLoading } = useRewardsCreditSummary();
  const points = data?.data.points ?? 0;
  const credit = data?.data.creditAvailable ?? 0;

  return (
    <Link
      href="/residential/rewards"
      className="group flex flex-col justify-between gap-4 rounded-2xl border border-card-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Membership Status</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Award className="h-4 w-4 text-primary" />
            Rewards Member
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Gift className="h-4 w-4" />
        </div>
      </div>

      {isLoading ? (
        <div className="h-12 animate-pulse rounded-lg bg-card-border" />
      ) : (
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{points.toLocaleString()} Points</p>
          <p className="mt-0.5 text-sm text-muted">${credit.toFixed(2)} Delivery Credit Available</p>
        </div>
      )}

      <span className="flex items-center gap-1 text-sm font-medium text-primary">
        View Details
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
