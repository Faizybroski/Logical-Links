"use client";

import { Truck, type LucideIcon } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KpiDataPoint {
  value: number;
}

export interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  growth?: string;
  trend?: "up" | "down";
  subtitle?: string;
  chartColor?: string;
  valueColor?: string;
  data?: KpiDataPoint[];
  isLoading?: boolean;
  className?: string;
}

// ─── Custom recharts tooltip ──────────────────────────────────────────────────

function SparkTooltip({
  active,
  payload,
}: TooltipProps<number, string> & {
  payload?: Array<{ value?: number | string }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-md">
      {payload[0].value}
    </div>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

export function KpiCard({
  title,
  value,
  icon: Icon,
  growth,
  trend,
  subtitle = "vs last 30 days",
  chartColor = "#C89B3C",
  valueColor,
  data,
  isLoading = false,
  className,
}: KpiCardProps) {
  const isUp = trend !== "down";
  const gradientId = `kpi-grad-${title.replace(/\s+/g, "-").toLowerCase()}`;

  if (isLoading) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-[22px] border border-card-border bg-card",
          "px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-5",
          "shadow-sm",
          className,
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 rounded-full bg-foreground/8" />
          <div className="h-9 w-16 rounded-lg bg-foreground/8" />
          <div className="h-2 w-20 rounded-full bg-foreground/8" />
          <div className="mt-5 h-14 w-full rounded-lg bg-foreground/8" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[22px] border border-card-border bg-card",
        "px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-5",
        "shadow-sm transition-all duration-300",
        "hover:-translate-y-0.75 hover:shadow-md",
        className,
      )}
    >
      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `${chartColor}1a` }}
      />

      {/* Header row */}
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-[12px] font-medium tracking-wide text-muted sm:text-[13px]">
            {title}
          </p>

          <div className="mt-2 flex flex-wrap items-end gap-1.5 sm:mt-3 sm:gap-2.5">
            <span
              className={cn(
                "text-3xl font-semibold leading-none tracking-tight sm:text-[2.25rem]",
                !valueColor && "text-foreground",
              )}
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                ...(valueColor ? { color: valueColor } : {}),
              }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>

            {growth && (
              <span
                className={cn(
                  "mb-0.5 text-xs font-bold tracking-wide",
                  isUp ? "text-success" : "text-danger",
                )}
              >
                {isUp ? "↑" : "↓"} {growth}
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-muted sm:mt-1.5">{subtitle}</p>
        </div>

        {/* Icon badge */}
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-13 sm:rounded-2xl"
          style={{
            background: `${chartColor}0d`,
            border: `1px solid ${chartColor}22`,
            color: chartColor,
            boxShadow: `0 2px 8px ${chartColor}18`,
          }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" size={20} />
        </div>
      </div>

      {/* Sparkline */}
      {data && data.length > 0 && (
        <div className="relative mt-5 h-14 w-full min-w-0">
          <ResponsiveContainer width="100%" height={56}>
            <AreaChart
              data={data}
              margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <Tooltip content={<SparkTooltip />} cursor={false} />

              <Area
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: chartColor,
                  stroke: "var(--card)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
