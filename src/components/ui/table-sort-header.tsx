"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortDir } from "@/hooks/use-table-filters";

interface TableSortHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string;
  currentDir: SortDir;
  onSort: (key: string, dir: SortDir) => void;
  className?: string;
}

export function TableSortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  className,
}: TableSortHeaderProps) {
  const isActive = currentSort === sortKey;

  function handleClick() {
    if (!isActive || currentDir === null) {
      onSort(sortKey, "asc");
    } else if (currentDir === "asc") {
      onSort(sortKey, "desc");
    } else {
      onSort(sortKey, null);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-1 whitespace-nowrap text-left text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar transition-opacity hover:opacity-75",
        className,
      )}
    >
      {label}
      <span className="ml-0.5 shrink-0">
        {isActive && currentDir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : isActive && currentDir === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-80" />
        )}
      </span>
    </button>
  );
}
