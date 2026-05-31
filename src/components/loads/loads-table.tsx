"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type TableOptions,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  title?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  pageSize?: number;
  headerActions?: React.ReactNode;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  tableOptions?: Partial<TableOptions<TData>>;
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

const SKELETON_WIDTHS = [
  "w-1/3", "w-2/3", "w-5/12", "w-3/5", "w-5/12", "w-2/3", "w-1/3", "w-1/2",
] as const;

function SkeletonRows({ cols, rows }: { cols: number; rows: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <TableRow key={ri} className="border-t border-card-border">
          {Array.from({ length: cols }).map((_, ci) => (
            <TableCell key={ci} className="px-5 py-4">
              <div
                className={`h-4 animate-pulse rounded-md bg-card-border ${
                  SKELETON_WIDTHS[(ri + ci) % SKELETON_WIDTHS.length]
                }`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  title = "Table",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  onRowClick,
  pageSize = 10,
  headerActions,
  emptyState,
  isLoading = false,
  className,
  tableOptions,
}: DataTableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    ...tableOptions,
  });

  const pageIndex  = table.getState().pagination.pageIndex;
  const pageCount  = Math.max(1, table.getPageCount());
  const totalRows  = table.getCoreRowModel().rows.length;
  const rangeStart = isLoading ? 0 : pageIndex * pageSize + 1;
  const rangeEnd   = isLoading ? 0 : Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm",
        className,
      )}
    >
      {/* ── Card header ── */}
      <div className="flex flex-col gap-3 border-b border-card-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>

        <div className="flex flex-wrap items-center gap-2">
          {onSearchChange && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
              <Input
                value={searchValue ?? ""}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  table.setPageIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="h-9 w-full min-w-[180px] rounded-xl border-card-border bg-background pl-9 text-sm sm:w-56 focus-visible:ring-primary/30"
              />
            </div>
          )}
          {headerActions}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-primary">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-0 hover:bg-primary">
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar"
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <SkeletonRows cols={columns.length} rows={Math.min(pageSize, 6)} />
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  {emptyState ?? (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-medium text-muted">No results found</p>
                      <p className="text-xs text-muted-light">Try adjusting your search or filters</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "border-t border-card-border transition-colors",
                    onRowClick && "cursor-pointer hover:bg-primary/5",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-5 py-4 text-sm text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-col items-start gap-3 border-t border-card-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          {isLoading ? (
            <span className="inline-block h-3.5 w-32 animate-pulse rounded bg-card-border" />
          ) : totalRows === 0 ? (
            "No records"
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">{rangeStart}–{rangeEnd}</span>
              {" "}of{" "}
              <span className="font-medium text-foreground">{totalRows}</span>
            </>
          )}
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
            className="h-8 gap-1 rounded-xl border-card-border px-3 text-xs text-foreground hover:bg-primary/5 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
              let page = i;
              if (pageCount > 5) {
                const mid = Math.min(Math.max(pageIndex, 2), pageCount - 3);
                page = mid - 2 + i;
              }
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => table.setPageIndex(page)}
                  disabled={isLoading}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    page === pageIndex
                      ? "bg-primary text-sidebar"
                      : "text-muted hover:bg-card-border",
                  )}
                >
                  {page + 1}
                </button>
              );
            })}
          </div>

          <Button
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
            className="h-8 gap-1 rounded-xl bg-primary px-3 text-xs text-sidebar hover:bg-primary/85 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
