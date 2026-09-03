"use client";

import { Award, Gift, ArrowUpCircle, ArrowDownCircle, Cake } from "lucide-react";
import {
  useCustomerRewardsCreditSummary,
  useCustomerRewardsCreditHistory,
} from "@/hooks/use-rewards-credit";
import type { RewardsCreditHistoryEntry } from "@/types/api.types";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

const ENTRY_META: Record<RewardsCreditHistoryEntry["type"], { icon: typeof ArrowUpCircle; label: string; tone: string }> = {
  earn:           { icon: ArrowUpCircle,   label: "Points earned",   tone: "text-green-600" },
  redeem:         { icon: ArrowDownCircle, label: "Points redeemed", tone: "text-danger" },
  birthday_bonus: { icon: Cake,            label: "Birthday bonus",  tone: "text-primary" },
};

// Read-only rewards balance + ledger for a residential customer. Used on the
// admin residential customer detail page.
export function CustomerRewardsPanel({ profileId }: { profileId: string }) {
  const { data: summaryRes, isLoading: summaryLoading } = useCustomerRewardsCreditSummary(profileId);
  const { data: historyRes, isLoading: historyLoading } = useCustomerRewardsCreditHistory(profileId);

  const points  = summaryRes?.data.points ?? 0;
  const credit  = summaryRes?.data.creditAvailable ?? 0;
  const history = historyRes?.data ?? [];

  return (
    <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-card-border px-6 py-4">
        <Award className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">Rewards</h2>
      </div>

      {summaryLoading ? (
        <div className="h-20 animate-pulse bg-card-border/40" />
      ) : (
        <div className="grid grid-cols-2 divide-x divide-card-border">
          <div className="p-6 text-center">
            <p className="text-2xl font-bold tabular-nums text-foreground">{points.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted">Points Available</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-2xl font-bold tabular-nums text-foreground">${credit.toFixed(2)}</p>
            <p className="mt-1 text-xs text-muted">Delivery Credit Available</p>
          </div>
        </div>
      )}

      <div className="border-t border-card-border px-6 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Points History</p>
      </div>
      {historyLoading ? (
        <div className="flex items-center justify-center p-8 text-sm text-muted">Loading…</div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <Gift className="h-7 w-7 text-muted-light" />
          <p className="text-sm text-muted">No rewards activity yet.</p>
        </div>
      ) : (
        <div className="max-h-96 divide-y divide-card-border overflow-y-auto">
          {history.map((entry) => {
            const meta = ENTRY_META[entry.type];
            const Icon = meta.icon;
            return (
              <div key={entry.ledger_id} className="flex items-center justify-between gap-4 px-6 py-3">
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${meta.tone}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.note ?? meta.label}</p>
                    <p className="text-xs text-muted">{fmtDate(entry.created_at)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${meta.tone}`}>
                  {entry.points > 0 ? "+" : ""}{entry.points.toLocaleString()} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
