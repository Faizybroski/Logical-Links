"use client";

import { Check, ChevronDown, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CORPORATE_PIPELINE_STATUSES,
  CORPORATE_PIPELINE_STATUS_META,
  CORPORATE_PORTAL_ACCESS_STATUSES,
  type CorporatePipelineStatus,
} from "@/types/api.types";
import { PipelineStatusBadge } from "@/components/accounts/pipeline-status-badge";

export function PipelineStatusSelect({
  value,
  onChange,
  loading = false,
  disabled = false,
}: {
  value: CorporatePipelineStatus;
  onChange: (next: CorporatePipelineStatus) => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PipelineStatusBadge status={value} />
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" /> : <ChevronDown className="h-3.5 w-3.5 text-muted" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 rounded-xl border border-card-border bg-card shadow-lg">
        <DropdownMenuLabel className="text-xs font-semibold text-muted">Pipeline stage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CORPORATE_PIPELINE_STATUSES.map((s) => {
          const meta = CORPORATE_PIPELINE_STATUS_META[s];
          const grantsAccess = CORPORATE_PORTAL_ACCESS_STATUSES.includes(s);
          return (
            <DropdownMenuItem
              key={s}
              className="cursor-pointer items-start gap-2 rounded-lg py-2"
              onClick={() => s !== value && onChange(s)}
            >
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {meta.label}
                  {grantsAccess && (
                    <span className="rounded bg-green-50 px-1 text-[10px] font-semibold text-green-700">portal access</span>
                  )}
                </span>
                <span className="block text-xs text-muted">{meta.description}</span>
              </span>
              {s === value && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
