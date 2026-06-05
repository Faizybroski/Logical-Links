"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type SortDir = "asc" | "desc" | null;

export interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export function useTableFilters<T extends Record<string, string>>(
  defaults: T,
) {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const pathname    = usePathname();

  // Build current filter state from URL, falling back to defaults
  const filters = useMemo(() => {
    const result = { ...defaults } as Record<string, string>;
    for (const key of Object.keys(defaults)) {
      const val = searchParams.get(key);
      if (val !== null && val !== "") result[key] = val;
    }
    return result as T;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === defaults[key as string]) {
        params.delete(key as string);
      } else {
        params.set(key as string, value);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, searchParams, pathname, defaults],
  );

  const setFilters = useCallback(
    (updates: Partial<Record<string, string>>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === defaults[key]) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, searchParams, pathname, defaults],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  // Count of non-default active filters (excludes 'page', 'sortBy', 'sortDir', 'search')
  const activeCount = useMemo(() => {
    const EXCLUDED = new Set(["page", "sortBy", "sortDir", "search"]);
    let count = 0;
    for (const key of Object.keys(defaults)) {
      if (EXCLUDED.has(key)) continue;
      const val = searchParams.get(key);
      if (val !== null && val !== "" && val !== defaults[key]) count++;
    }
    return count;
  }, [searchParams, defaults]);

  return { filters, setFilter, setFilters, clearAll, activeCount };
}
