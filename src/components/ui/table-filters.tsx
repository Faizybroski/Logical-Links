"use client";

import * as React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterChip } from "@/hooks/use-table-filters";

// ── Filter definition types ────────────────────────────────────────────────────

export type FilterDef =
  | {
      type: "select";
      key: string;
      label: string;
      options: { value: string; label: string }[];
    }
  | {
      type: "text";
      key: string;
      label: string;
      placeholder?: string;
    }
  | {
      type: "dateRange";
      label: string;
      fromKey: string;
      toKey: string;
    }
  | {
      type: "numericRange";
      label: string;
      minKey: string;
      maxKey: string;
      prefix?: string;
    }
  | {
      type: "boolean";
      key: string;
      label: string;
      trueLabel?: string;
      falseLabel?: string;
    };

// ── Filter panel item renderers ────────────────────────────────────────────────

function FilterItem({
  def,
  value,
  getValue,
  onChange,
}: {
  def: FilterDef;
  value?: string;
  getValue: (key: string) => string;
  onChange: (key: string, val: string) => void;
}) {
  if (def.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted">{def.label}</Label>
        <Select
          value={getValue(def.key) || "__all__"}
          onValueChange={(v) => onChange(def.key, v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 rounded-lg border-card-border text-sm">
            <SelectValue placeholder={`All ${def.label}`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-card-border bg-card">
            <SelectItem value="__all__">All</SelectItem>
            {def.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (def.type === "text") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted">{def.label}</Label>
        <Input
          value={getValue(def.key)}
          onChange={(e) => onChange(def.key, e.target.value)}
          placeholder={def.placeholder ?? `Filter by ${def.label}…`}
          className="h-8 rounded-lg border-card-border text-sm"
        />
      </div>
    );
  }

  if (def.type === "dateRange") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted">{def.label}</Label>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={getValue(def.fromKey)}
            onChange={(e) => onChange(def.fromKey, e.target.value)}
            className="h-8 flex-1 rounded-lg border-card-border text-sm"
          />
          <span className="text-xs text-muted">–</span>
          <Input
            type="date"
            value={getValue(def.toKey)}
            onChange={(e) => onChange(def.toKey, e.target.value)}
            className="h-8 flex-1 rounded-lg border-card-border text-sm"
          />
        </div>
      </div>
    );
  }

  if (def.type === "numericRange") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted">{def.label}</Label>
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            {def.prefix && (
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                {def.prefix}
              </span>
            )}
            <Input
              type="number"
              min={0}
              value={getValue(def.minKey)}
              onChange={(e) => onChange(def.minKey, e.target.value)}
              placeholder="Min"
              className={cn(
                "h-8 rounded-lg border-card-border text-sm",
                def.prefix && "pl-6",
              )}
            />
          </div>
          <span className="text-xs text-muted">–</span>
          <div className="relative flex-1">
            {def.prefix && (
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                {def.prefix}
              </span>
            )}
            <Input
              type="number"
              min={0}
              value={getValue(def.maxKey)}
              onChange={(e) => onChange(def.maxKey, e.target.value)}
              placeholder="Max"
              className={cn(
                "h-8 rounded-lg border-card-border text-sm",
                def.prefix && "pl-6",
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  if (def.type === "boolean") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted">{def.label}</Label>
        <Select
          value={getValue(def.key) || "__all__"}
          onValueChange={(v) => onChange(def.key, v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 rounded-lg border-card-border text-sm">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-card-border bg-card">
            <SelectItem value="__all__">Any</SelectItem>
            <SelectItem value="true">{def.trueLabel ?? "Yes"}</SelectItem>
            <SelectItem value="false">{def.falseLabel ?? "No"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return null;
}

// ── Main TableFilters component ────────────────────────────────────────────────

interface TableFiltersProps {
  defs: FilterDef[];
  getValue: (key: string) => string;
  onChange: (key: string, val: string) => void;
  onClearAll: () => void;
  activeCount: number;
  chips: FilterChip[];
}

export function TableFilters({
  defs,
  getValue,
  onChange,
  onClearAll,
  activeCount,
  chips,
}: TableFiltersProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* ── Filter button ── */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 rounded-xl border-card-border px-3 text-sm",
              activeCount > 0
                ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                : "bg-background text-foreground hover:bg-primary/5",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-sidebar">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-card-border bg-card p-4 shadow-lg"
        >
          <div className="flex items-center justify-between pb-3">
            <p className="text-sm font-semibold text-foreground">Filters</p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="space-y-4">
            {defs.map((def, i) => (
              <FilterItem
                key={i}
                def={def}
                getValue={getValue}
                onChange={onChange}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* ── Active filter chips ── */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              <span className="text-muted-light">{chip.label}:</span>
              {chip.value}
              <button
                type="button"
                onClick={chip.onRemove}
                className="ml-0.5 rounded-full p-px hover:bg-primary/20"
                aria-label={`Remove ${chip.label} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          {chips.length > 1 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-medium text-muted hover:text-primary"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
