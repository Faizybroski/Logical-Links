"use client";

import { Award, Gift, ArrowUpCircle, ArrowDownCircle, Cake } from "lucide-react";
import { useRewardsCreditSummary, useRewardsCreditHistory } from "@/hooks/use-rewards-credit";
import { useRewardsRules } from "@/hooks/use-rewards";
import { formatRewardsRuleDescription } from "@/lib/utils/format-rewards-rule";
import type { RewardsCreditHistoryEntry } from "@/types/api.types";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CA", { day: "2-digit", month: "short", year: "numeric" });
}

const ENTRY_META: Record<RewardsCreditHistoryEntry["type"], { icon: typeof ArrowUpCircle; label: string; tone: string }> = {
  earn:           { icon: ArrowUpCircle,  label: "Points earned",  tone: "text-green-600" },
  redeem:         { icon: ArrowDownCircle, label: "Points redeemed", tone: "text-danger" },
  birthday_bonus: { icon: Cake,           label: "Birthday bonus", tone: "text-primary" },
};

export default function ResidentialRewardsPage() {
  const { data: summaryRes, isLoading: summaryLoading } = useRewardsCreditSummary();
  const { data: historyRes, isLoading: historyLoading } = useRewardsCreditHistory();
  const { data: rulesRes } = useRewardsRules();

  const points  = summaryRes?.data.points ?? 0;
  const credit  = summaryRes?.data.creditAvailable ?? 0;
  const history = historyRes?.data ?? [];
  const rules   = rulesRes?.data ?? [];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Rewards Member</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Your Rewards</h1>
          <p className="mt-2 text-sm text-muted">
            Book a delivery, earn points, and use them toward a future delivery.
          </p>
        </div>

        {/* Balance card */}
        <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-card-border px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Membership Status</h2>
              <p className="text-xs text-muted">Rewards Member</p>
            </div>
          </div>
          {summaryLoading ? (
            <div className="h-20 animate-pulse bg-card-border/50" />
          ) : (
            <div className="grid grid-cols-2 divide-x divide-card-border">
              <div className="p-6 text-center">
                <p className="text-3xl font-bold tabular-nums text-foreground">{points.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted">Points Available</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-3xl font-bold tabular-nums text-foreground">${credit.toFixed(2)}</p>
                <p className="mt-1 text-xs text-muted">Delivery Credit Available</p>
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        {rules.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
            <div className="border-b border-card-border px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">How It Works</h2>
            </div>
            <div className="divide-y divide-card-border">
              {rules.map((rule) => (
                <div key={rule.rule_id} className="flex items-start gap-3 px-6 py-4">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Gift className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{rule.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{formatRewardsRuleDescription(rule)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="border-b border-card-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Points History</h2>
          </div>
          {historyLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted">Loading…</div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center">
              <Gift className="h-8 w-8 text-muted-light" />
              <p className="text-sm font-medium text-muted">No activity yet</p>
              <p className="text-xs text-muted-light">Complete a delivery to start earning points.</p>
            </div>
          ) : (
            <div className="divide-y divide-card-border">
              {history.map((entry) => {
                const meta = ENTRY_META[entry.type];
                const Icon = meta.icon;
                return (
                  <div key={entry.ledger_id} className="flex items-center justify-between gap-4 px-6 py-3.5">
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
      </div>
    </div>
  );
}
