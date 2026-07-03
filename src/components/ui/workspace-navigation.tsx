"use client";

import { cn } from "@/lib/utils";

export interface WorkspaceNavItem {
  key: string;
  label: string;
  count?: number;
  countLoading?: boolean;
}

interface WorkspaceNavigationProps {
  title: string;
  items: WorkspaceNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function WorkspaceNavigation({
  title,
  items,
  activeKey,
  onSelect,
}: WorkspaceNavigationProps) {
  return (
    <aside className="hidden lg:block w-[220px] xl:w-[240px] shrink-0">
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 bg-primary">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] ">
            {title}
          </p>
        </div>

        {/* Nav items */}
        <nav className="p-2 space-y-0.5">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150",
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "text-foreground/70 hover:bg-primary/20 hover:text-foreground"
                )}
              >
                <span className="truncate">{item.label}</span>

                {item.countLoading ? (
                  <span className="h-4 w-6 rounded bg-muted animate-pulse shrink-0" />
                ) : item.count !== undefined ? (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full text-[11px] font-medium px-1.5 min-w-[22px] h-5 shrink-0 tabular-nums",
                      isActive
                        ? "bg-white text-primary"
                        : "hidden"
                    )}
                  >
                    {item.count > 9999 ? "9999+" : item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
