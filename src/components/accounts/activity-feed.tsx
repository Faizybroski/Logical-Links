"use client";

import {
  Clock, CheckCircle2, XCircle, RotateCcw, FileText, UserPlus,
  ShieldCheck, Sparkles, PencilLine, type LucideIcon,
} from "lucide-react";
import type { AccountActivity } from "@/types/api.types";

const ICONS: Record<AccountActivity["event_type"], LucideIcon> = {
  submitted:      FileText,
  reviewed:       ShieldCheck,
  approved:       CheckCircle2,
  rejected:       XCircle,
  reconsidered:   RotateCcw,
  restored:       RotateCcw,
  admin_added:    UserPlus,
  terms_accepted: CheckCircle2,
  tier_changed:   Sparkles,
  account_updated:PencilLine,
  note_added:     PencilLine,
};

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { month: "short", day: "numeric" });
}

export function ActivityFeed({
  title = "Recent Activity",
  items,
  isLoading = false,
  emptyText = "No activity yet",
  max,
}: {
  title?: string;
  items: AccountActivity[];
  isLoading?: boolean;
  emptyText?: string;
  max?: number;
}) {
  const rows = max ? items.slice(0, max) : items;

  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {items.length > 0 && (
          <span className="text-xs text-muted">{items.length}</span>
        )}
      </div>
      <div className="p-2">
        {isLoading ? (
          <p className="px-4 py-6 text-sm text-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-6 text-sm italic text-muted">{emptyText}</p>
        ) : (
          <ul className="divide-y divide-card-border/60">
            {rows.map((a) => {
              const Icon = ICONS[a.event_type] ?? Clock;
              return (
                <li key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{a.description}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {shortDate(a.created_at)}
                      {a.actor_label ? ` · ${a.actor_label}` : ""}
                      {a.internal ? " · internal" : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
