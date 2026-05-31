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
  /** Card label shown above the value */
  title: string;
  /** Primary metric — number or pre-formatted string (e.g. "98.6%") */
  value: number | string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Growth percentage string, e.g. "12.5%" — omit to hide growth badge */
  growth?: string;
  /** "up" renders green ↑, "down" renders red ↓ */
  trend?: "up" | "down";
  /** Supporting label below the value, e.g. "vs last 30 days" */
  subtitle?: string;
  /** Tailwind arbitrary hex or a CSS color string for the chart & icon accent */
  chartColor?: string;
  /** Sparkline data — array of { value: number } objects; omit to hide chart */
  data?: KpiDataPoint[];
  /** Show loading skeleton instead of content */
  isLoading?: boolean;
  /** Extra classes on the root card element */
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
    <div className="rounded-xl border border-[#EAE7E1] bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-md">
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
          "group relative overflow-hidden rounded-[22px] border border-[#EAE7E1] bg-white",
          "px-6 pt-6 pb-5",
          "shadow-[0_2px_8px_rgba(0,0,0,0.05)]",
          className,
        )}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 rounded-full bg-neutral-100" />
          <div className="h-9 w-16 rounded-lg bg-neutral-100" />
          <div className="h-2 w-20 rounded-full bg-neutral-100" />
          <div className="mt-5 h-14 w-full rounded-lg bg-neutral-100" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Base
        "group relative overflow-hidden rounded-[22px] border border-[#EAE7E1] bg-white",
        // Spacing
        "px-6 pt-6 pb-5",
        // Shadow + lift transition
        "shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300",
        "hover:-translate-y-0.75 hover:shadow-[0_20px_40px_rgba(0,0,0,0.10)]",
        className,
      )}
    >
      {/* ── Ambient glow blob ── */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-36 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `${chartColor}1a` }}
      />

      {/* ── Header row ── */}
      <div className="relative flex items-start justify-between">
        {/* Left: label + value + trend */}
        <div className="flex flex-col">
          <p className="text-[13px] font-medium tracking-wide text-neutral-400">
            {title}
          </p>

          <div className="mt-3 flex items-end gap-2.5">
            <span
              className="text-[2.25rem] font-semibold leading-none tracking-tight text-neutral-900"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>

            {growth && (
              <span
                className={cn(
                  "mb-0.5 text-xs font-bold tracking-wide",
                  isUp ? "text-emerald-500" : "text-red-500",
                )}
              >
                {isUp ? "↑" : "↓"} {growth}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-[11px] text-neutral-400">{subtitle}</p>
        </div>

        {/* Right: icon badge */}
        <div
          className="flex size-13 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `${chartColor}0d`,
            border: `1px solid ${chartColor}22`,
            color: chartColor,
            boxShadow: `0 2px 8px ${chartColor}18`,
          }}
        >
          <Icon className="h-6 w-6" size={22} />
        </div>
      </div>

      {/* ── Sparkline ── */}
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
                  stroke: "#fff",
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
