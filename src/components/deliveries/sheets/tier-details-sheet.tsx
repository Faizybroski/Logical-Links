"use client";

import { Award, Check, Clock3, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getTierProgress } from "@/lib/tiers";
import type { Tier } from "@/types/api.types";

interface TierDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  delivered: number;
  tiers: Tier[];
  isLoading?: boolean;
}

export function TierDetailsSheet({ open, onClose, delivered, tiers, isLoading }: TierDetailsSheetProps) {
  const progress = tiers.length > 0 ? getTierProgress(delivered, tiers) : null;

  return (
    <Sheet open={open} onClose={onClose} size="lg">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-card-border px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                Partner Tier
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Based on your company&apos;s lifetime completed deliveries.
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {isLoading || !progress ? (
            <div className="animate-pulse space-y-3">
              <div className="h-24 w-full rounded-2xl bg-card-border" />
              <div className="h-40 w-full rounded-2xl bg-card-border" />
            </div>
          ) : (
            <>
              {/* Progress card */}
              <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
                <p className="text-xs font-medium tracking-wide text-muted">
                  Current Tier
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {progress.current.name}
                </p>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-foreground/8">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress.progressPct}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-muted">
                  {delivered.toLocaleString()} deliveries completed
                  {progress.next
                    ? ` — ${progress.deliveriesToNext?.toLocaleString()} more to reach ${progress.next.name}`
                    : " — highest tier reached"}
                </p>
              </div>

              {/* Benefits per tier */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-card-border bg-card">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={progress.current.tier_id}
                >
                  {tiers.map((tier) => (
                    <AccordionItem key={tier.tier_id} value={tier.tier_id} className="px-5">
                      <AccordionTrigger>
                        <span className="flex flex-1 items-center justify-between gap-2 pr-2">
                          <span className="flex items-center gap-2">
                            {tier.rank <= progress.current.rank && (
                              <Check className="h-4 w-4 text-success" />
                            )}
                            <span
                              className={
                                tier.tier_id === progress.current.tier_id
                                  ? "font-semibold text-primary"
                                  : "text-foreground"
                              }
                            >
                              {tier.name}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs font-normal text-muted">
                            {tier.min_deliveries.toLocaleString()} deliveries required
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {tier.cumulativeBenefits.map((benefit, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted"
                            >
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                          <Clock3 className="h-3.5 w-3.5" />
                          Quote turnaround: {tier.quote_turnaround}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}
