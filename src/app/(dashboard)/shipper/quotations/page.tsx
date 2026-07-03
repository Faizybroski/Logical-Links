"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, CheckCircle2, Send, Clock } from "lucide-react";
import { KpiCard } from "@/components/loads/kpi-card";
import { QuotationsList } from "@/components/documents/documents-list";
import { TableFilters } from "@/components/ui/table-filters";
import type { FilterDef } from "@/components/ui/table-filters";
import { useTableFilters } from "@/hooks/use-table-filters";
import type { SortDir } from "@/hooks/use-table-filters";
import { useQuotations, useDuplicateQuotation, useDeleteQuotation } from "@/hooks/use-quotations";
import { QUOTATION_STATUS_LABELS } from "@/types/api.types";
import type { QuotationStatus } from "@/types/api.types";
import { CreateQuotationSheet } from "@/components/documents/sheets/create-quotation-sheet";
import { QuotationDetailsSheet } from "@/components/documents/sheets/quotation-details-sheet";
import { EditQuotationSheet } from "@/components/documents/sheets/edit-quotation-sheet";

const FILTER_DEFAULTS = {
  search:         "",
  status:         "",
  issueDateFrom:  "",
  issueDateTo:    "",
  expiryDateFrom: "",
  expiryDateTo:   "",
  totalMin:       "",
  totalMax:       "",
  hasPdf:         "",
  sortBy:         "",
  sortDir:        "",
  page:           "1",
};

const STATUS_OPTIONS = Object.entries(QUOTATION_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }));

const FILTER_DEFS: FilterDef[] = [
  { type: "select",       key: "status",  label: "Status",      options: STATUS_OPTIONS },
  { type: "dateRange",    label: "Issue Date",   fromKey: "issueDateFrom",  toKey: "issueDateTo" },
  { type: "dateRange",    label: "Expiry Date",  fromKey: "expiryDateFrom", toKey: "expiryDateTo" },
  { type: "numericRange", label: "Total",        minKey: "totalMin",        maxKey: "totalMax", prefix: "$" },
  { type: "boolean",      key: "hasPdf",  label: "PDF",         trueLabel: "Has PDF", falseLabel: "No PDF" },
];

export default function ShipperQuotationsPage() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Sheet params
  const createParam  = searchParams.get("create");
  const detailsParam = searchParams.get("details");
  const editParam    = searchParams.get("edit");
  const loadIdParam  = searchParams.get("loadId");

  const createOpen  = createParam === "true";
  const detailsOpen = !!detailsParam;
  const editOpen    = !!editParam;

  const [lastDetailsId, setLastDetailsId] = useState<string | null>(detailsParam);
  const [lastEditId,    setLastEditId]    = useState<string | null>(editParam);
  useEffect(() => { if (detailsParam) setLastDetailsId(detailsParam); }, [detailsParam]);
  useEffect(() => { if (editParam)    setLastEditId(editParam); },    [editParam]);

  function buildSheetUrl(key: "create" | "details" | "edit", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("create"); params.delete("details"); params.delete("edit"); params.delete("loadId");
    params.set(key, value);
    return `${pathname}?${params.toString()}`;
  }
  function closeSheetUrl() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("create"); params.delete("details"); params.delete("edit"); params.delete("loadId");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const openCreate  = () => router.push(buildSheetUrl("create", "true"));
  const openDetails = (id: string) => router.push(buildSheetUrl("details", id));
  const openEdit    = (id: string) => router.push(buildSheetUrl("edit", id));
  const closeSheet  = () => router.push(closeSheetUrl());

  // Filters
  const { filters, setFilter, setFilters, clearAll, activeCount } =
    useTableFilters(FILTER_DEFAULTS);

  const page    = parseInt(filters.page || "1", 10);
  const sortBy  = filters.sortBy  || undefined;
  const sortDir = (filters.sortDir as SortDir) || null;

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(timer.current);
  }, [filters.search]);

  const query = useMemo(() => ({
    page, limit: 20,
    ...(debouncedSearch        && { search:         debouncedSearch }),
    ...(filters.status         && { status:         filters.status as QuotationStatus }),
    ...(filters.issueDateFrom  && { issueDateFrom:  filters.issueDateFrom }),
    ...(filters.issueDateTo    && { issueDateTo:    filters.issueDateTo }),
    ...(filters.expiryDateFrom && { expiryDateFrom: filters.expiryDateFrom }),
    ...(filters.expiryDateTo   && { expiryDateTo:   filters.expiryDateTo }),
    ...(filters.totalMin       && { totalMin: Number(filters.totalMin) }),
    ...(filters.totalMax       && { totalMax: Number(filters.totalMax) }),
    ...(filters.hasPdf         && { hasPdf: filters.hasPdf as "true" | "false" }),
    ...(sortBy                 && { sortBy: sortBy as any }),
    ...(sortDir                && { sortDir }),
  }), [filters, debouncedSearch, page, sortBy, sortDir]);

  const { data: res, isLoading } = useQuotations(query);
  const quotations = res?.data ?? [];
  const totalCount = (res as any)?.meta?.total ?? 0;

  const duplicateMut = useDuplicateQuotation();
  const deleteMut    = useDeleteQuotation();

  const stats = {
    total:    totalCount,
    draft:    quotations.filter((q) => q.status === "draft").length,
    sent:     quotations.filter((q) => q.status === "sent").length,
    accepted: quotations.filter((q) => q.status === "accepted").length,
  };

  function handleSort(key: string, dir: SortDir) {
    setFilters({ sortBy: key && dir ? key : "", sortDir: dir ?? "", page: "1" });
  }

  const filterChips = useMemo(() => {
    const chips = [];
    if (filters.status)
      chips.push({ key: "status", label: "Status", value: QUOTATION_STATUS_LABELS[filters.status as QuotationStatus] ?? filters.status, onRemove: () => setFilter("status", "") });
    if (filters.issueDateFrom || filters.issueDateTo)
      chips.push({ key: "issueDate", label: "Issue Date", value: `${filters.issueDateFrom || "…"} – ${filters.issueDateTo || "…"}`, onRemove: () => setFilters({ issueDateFrom: "", issueDateTo: "" }) });
    if (filters.expiryDateFrom || filters.expiryDateTo)
      chips.push({ key: "expiryDate", label: "Expiry Date", value: `${filters.expiryDateFrom || "…"} – ${filters.expiryDateTo || "…"}`, onRemove: () => setFilters({ expiryDateFrom: "", expiryDateTo: "" }) });
    if (filters.totalMin || filters.totalMax)
      chips.push({ key: "total", label: "Total", value: `$${filters.totalMin || "0"} – $${filters.totalMax || "∞"}`, onRemove: () => setFilters({ totalMin: "", totalMax: "" }) });
    if (filters.hasPdf)
      chips.push({ key: "hasPdf", label: "PDF", value: filters.hasPdf === "true" ? "Has PDF" : "No PDF", onRemove: () => setFilter("hasPdf", "") });
    return chips;
  }, [filters, setFilter, setFilters]);

  async function handleDuplicate(id: string) {
    await duplicateMut.mutateAsync(id);
    toast.success("Quotation duplicated");
  }
  async function handleDelete(id: string) {
    await deleteMut.mutateAsync(id);
    toast.success("Quotation deleted");
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-2">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Shipper Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">My Quotations</h1>
          <p className="mt-2 text-sm text-muted">View and manage your freight quotations.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total"    value={stats.total}    icon={FileText}     chartColor="#C89B3C" isLoading={isLoading} />
          <KpiCard title="Draft"    value={stats.draft}    icon={Clock}        chartColor="#6B7280" isLoading={isLoading} />
          <KpiCard title="Sent"     value={stats.sent}     icon={Send}         chartColor="#3B82F6" isLoading={isLoading} />
          <KpiCard title="Accepted" value={stats.accepted} icon={CheckCircle2} chartColor="#22C55E" isLoading={isLoading} />
        </div>

        <QuotationsList
          quotations={quotations}
          basePath="/shipper/quotations"
          isLoading={isLoading}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onView={openDetails}
          onEdit={openEdit}
          onCreateClick={openCreate}
          totalCount={totalCount}
          page={page}
          onPageChange={(pg) => setFilter("page", String(pg))}
          searchValue={filters.search}
          onSearchChange={(v) => setFilter("search", v)}
          filterChips={filterChips}
          sortBy={sortBy ?? ""}
          sortDir={sortDir}
          onSort={handleSort}
          headerActions={
            <TableFilters
              defs={FILTER_DEFS}
              getValue={(key) => filters[key as keyof typeof FILTER_DEFAULTS] ?? ""}
              onChange={(key, val) => setFilter(key as keyof typeof FILTER_DEFAULTS, val)}
              onClearAll={clearAll}
              activeCount={activeCount}
              chips={filterChips}
            />
          }
        />
      </div>

      <CreateQuotationSheet
        open={createOpen}
        onClose={closeSheet}
        loadId={loadIdParam}
      />
      <QuotationDetailsSheet
        open={detailsOpen}
        onClose={closeSheet}
        quotationId={lastDetailsId ?? ""}
        onEditClick={openEdit}
      />
      <EditQuotationSheet
        open={editOpen}
        onClose={closeSheet}
        quotationId={lastEditId ?? ""}
      />
    </div>
  );
}
