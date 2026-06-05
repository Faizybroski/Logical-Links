"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onBlur?: () => void;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  onBlur,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : options;

  React.useEffect(() => {
    if (open) {
      setSearch("");
      const idx = value ? options.findIndex((o) => o.value === value) : -1;
      setFocusedIndex(idx);
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      onBlur?.();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option]");
      items[focusedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  function handleSelect(optValue: string) {
    onValueChange(optValue);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && focusedIndex >= 0 && filtered[focusedIndex]) {
      e.preventDefault();
      handleSelect(filtered[focusedIndex].value);
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-1.5 rounded-2xl border border-card-border bg-background px-3 text-sm transition-[color,box-shadow]",
            "hover:border-primary/40",
            "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
            open && "border-primary ring-4 ring-primary/10",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 truncate text-left",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? (
              <>
                {selected.icon && (
                  <span className="shrink-0">{selected.icon}</span>
                )}
                <span className="truncate">{selected.label}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          avoidCollisions
          collisionPadding={12}
          style={{ width: "var(--radix-popover-trigger-width)" }}
          className={cn(
            "z-[200] overflow-hidden rounded-xl border border-card-border bg-card shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search */}
          <div className="border-b border-card-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFocusedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Options */}
          <div ref={listRef} className="max-h-[min(14rem,var(--radix-popover-content-available-height,14rem))] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted">
                {emptyText}
              </div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  data-option
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-left transition-colors",
                    "hover:bg-primary/5",
                    i === focusedIndex && "bg-primary/5",
                    value === opt.value && "text-primary",
                  )}
                >
                  {opt.icon && (
                    <span className="shrink-0">{opt.icon}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className={cn("block truncate", value === opt.value && "font-medium")}>
                      {opt.label}
                    </span>
                    {opt.description && (
                      <span className="block truncate text-xs text-muted">
                        {opt.description}
                      </span>
                    )}
                  </div>
                  {value === opt.value && (
                    <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
