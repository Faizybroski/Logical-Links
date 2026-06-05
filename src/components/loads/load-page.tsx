"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Plus, ShieldAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DataTable } from "@/components/loads/loads-table";
import KpiGrid from "@/components/loads/kpi-grid";
import { getLoadColumns } from "@/components/loads/columns";
import { DeleteConfirmDialog } from "@/components/loads/dialogs/delete-confirmation-dialog";
import { StatusChangeDialog } from "@/components/loads/dialogs/status-change-dialog";
import { AssignDialog } from "@/components/loads/dialogs/assign-dialog";
import { TableFilters } from "@/components/ui/table-filters";
import type { FilterDef } from "@/components/ui/table-filters";

import { useAuthStore } from "@/store/auth.store";
import {
  useShipments,
  useDeleteShipment,
  useUpdateShipmentStatus,
  useAssignShipment,
} from "@/hooks/use-shipments";
import { useAccounts } from "@/hooks/use-accounts";
import { useTableFilters } from "@/hooks/use-table-filters";
import type { SortDir } from "@/hooks/use-table-filters";
import type {
  Shipment,
  ShipmentStatus,
  AssignShipmentDto,
} from "@/types/api.types";
import { SHIPMENT_STATUS_LABELS as STATUS_LABELS } from "@/types/api.types";

// ── Filter defaults ────────────────────────────────────────────────────────────

const FILTER_DEFAULTS = {
  search:        "",
  status:        "",
  shipmentType:  "",
  createdByRole: "",
  accountId:     "",
  dateFrom:      "",
  dateTo:        "",
  updatedFrom:   "",
  updatedTo:     "",
  sortBy:        "",
  sortDir:       "",
  page:          "1",
};

// ── Status options ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TYPE_OPTIONS = [
  { value: "freight",   label: "Freight" },
  { value: "last_mile", label: "Last Mile" },
];

const CREATOR_OPTIONS = [
  { value: "admin",   label: "Super Admin" },
  { value: "shipper", label: "Shipping Company" },
];

export default function LoadsPage() {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = user?.role === "admin";

  const basePath = pathname.startsWith("/admin") ? "/admin/loads" : "/shipper/loads";
  const docBasePath = pathname.startsWith("/admin") ? "/admin" : "/shipper";

  const [deletingLoad,  setDeletingLoad]  = useState<Shipment | null>(null);
  const [statusLoad,    setStatusLoad]    = useState<Shipment | null>(null);
  const [assigningLoad, setAssigningLoad] = useState<Shipment | null>(null);

  // ── URL filter state ───────────────────────────────────────────────────────
  const { filters, setFilter, setFilters, clearAll, activeCount } =
    useTableFilters(FILTER_DEFAULTS);

  const page    = parseInt(filters.page || "1", 10);
  const sortBy  = filters.sortBy  || undefined;
  const sortDir = (filters.sortDir as SortDir) || null;

  // Debounce search to avoid hammering the backend
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const shipmentsQuery = useMemo(() => ({
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filters.status        && { status: filters.status }),
    ...(filters.shipmentType  && { shipmentType: filters.shipmentType as "freight" | "last_mile" }),
    ...(filters.createdByRole && isAdmin && { createdByRole: filters.createdByRole as "admin" | "shipper" }),
    ...(filters.accountId     && isAdmin && { accountId: filters.accountId }),
    ...(filters.dateFrom      && { dateFrom: filters.dateFrom }),
    ...(filters.dateTo        && { dateTo:   filters.dateTo }),
    ...(filters.updatedFrom   && { updatedFrom: filters.updatedFrom }),
    ...(filters.updatedTo     && { updatedTo:   filters.updatedTo }),
    ...(sortBy                && { sortBy: sortBy as any }),
    ...(sortDir               && { sortDir }),
    ...(!isAdmin && { accountId: user?.accountId ?? undefined }),
  }), [filters, debouncedSearch, page, sortBy, sortDir, isAdmin, user?.accountId]);

  const { data: shipmentsRes, isLoading } = useShipments(shipmentsQuery);
  const { data: companiesRes } = useAccounts({ limit: 100 }, { enabled: isAdmin });

  const shipments  = shipmentsRes?.data ?? [];
  const totalCount = (shipmentsRes as any)?.meta?.total ?? 0;
  const companies  = companiesRes?.data ?? [];

  // ── Mutations ──────────────────────────────────────────────────────────────
  const deleteMut = useDeleteShipment();
  const statusMut = useUpdateShipmentStatus(statusLoad?.shipment_id ?? "");
  const assignMut = useAssignShipment(assigningLoad?.shipment_id ?? "");

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total:      totalCount,
      transit:    shipments.filter((s) => s.status === "in_transit").length,
      delivered:  shipments.filter((s) => s.status === "delivered").length,
      exceptions: shipments.filter((s) => s.status === "cancelled").length,
    }),
    [shipments, totalCount],
  );

  // ── Permissions ────────────────────────────────────────────────────────────
  const canEdit   = (s: Shipment) => !["delivered", "cancelled"].includes(s.status);
  const canDelete = (s: Shipment) => isAdmin && ["pending", "confirmed"].includes(s.status);
  const canAssign = (s: Shipment) =>
    isAdmin && s.status === "confirmed" && s.created_by_role !== "shipper";

  // ── Sort handler ───────────────────────────────────────────────────────────
  function handleSort(key: string, dir: SortDir) {
    setFilters({ sortBy: key && dir ? key : "", sortDir: dir ?? "", page: "1" });
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getLoadColumns({
        isAdmin,
        basePath,
        docBasePath,
        canEdit,
        canDelete,
        canAssign,
        sortBy:  sortBy ?? "",
        sortDir,
        onSort:  handleSort,
        onDelete:          (s) => setDeletingLoad(s),
        onAssign:          (s) => setAssigningLoad(s),
        onStatusChange:    (s) => setStatusLoad(s),
        onCreateQuotation: (s) => router.push(`${docBasePath}/quotations/create?loadId=${s.shipment_id}`),
        onCreateInvoice:   (s) => router.push(`${docBasePath}/invoices/create?loadId=${s.shipment_id}`),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, basePath, docBasePath, sortBy, sortDir],
  );

  // ── Filter chips ───────────────────────────────────────────────────────────
  const companyName = useCallback(
    (id: string) => companies.find((c) => c.account_id === id)?.account_name ?? id,
    [companies],
  );

  const filterChips = useMemo(() => {
    const chips = [];
    if (filters.status)
      chips.push({ key: "status", label: "Status", value: STATUS_LABELS[filters.status as keyof typeof STATUS_LABELS] ?? filters.status, onRemove: () => setFilter("status", "") });
    if (filters.shipmentType)
      chips.push({ key: "shipmentType", label: "Type", value: filters.shipmentType === "freight" ? "Freight" : "Last Mile", onRemove: () => setFilter("shipmentType", "") });
    if (filters.createdByRole && isAdmin)
      chips.push({ key: "createdByRole", label: "Created By", value: filters.createdByRole === "admin" ? "Super Admin" : "Shipping Company", onRemove: () => setFilter("createdByRole", "") });
    if (filters.accountId && isAdmin)
      chips.push({ key: "accountId", label: "Company", value: companyName(filters.accountId), onRemove: () => setFilter("accountId", "") });
    if (filters.dateFrom || filters.dateTo)
      chips.push({ key: "date", label: "Created", value: `${filters.dateFrom || "…"} – ${filters.dateTo || "…"}`, onRemove: () => setFilters({ dateFrom: "", dateTo: "" }) });
    if (filters.updatedFrom || filters.updatedTo)
      chips.push({ key: "updated", label: "Updated", value: `${filters.updatedFrom || "…"} – ${filters.updatedTo || "…"}`, onRemove: () => setFilters({ updatedFrom: "", updatedTo: "" }) });
    return chips;
  }, [filters, isAdmin, companyName, setFilter, setFilters]);

  // ── Filter defs ────────────────────────────────────────────────────────────
  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: c.account_id, label: c.account_name })),
    [companies],
  );

  const filterDefs: FilterDef[] = useMemo(() => [
    { type: "select",    key: "status",       label: "Status",       options: STATUS_OPTIONS },
    { type: "select",    key: "shipmentType", label: "Type",         options: TYPE_OPTIONS },
    ...(isAdmin ? [
      { type: "select" as const, key: "createdByRole", label: "Created By",   options: CREATOR_OPTIONS },
      { type: "select" as const, key: "accountId",     label: "Company",      options: companyOptions },
    ] : []),
    { type: "dateRange", label: "Created Date", fromKey: "dateFrom",    toKey: "dateTo" },
    { type: "dateRange", label: "Updated Date", fromKey: "updatedFrom", toKey: "updatedTo" },
  ], [isAdmin, companyOptions]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleDelete(reason: string) {
    if (!deletingLoad) return;
    try {
      await deleteMut.mutateAsync({ id: deletingLoad.shipment_id, reason });
      toast.success(`Load ${deletingLoad.load_number} deleted`);
      setDeletingLoad(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleStatusChange(status: ShipmentStatus, reason?: string) {
    if (!statusLoad) return;
    try {
      await statusMut.mutateAsync({ status, reason });
      toast.success("Status updated successfully");
      setStatusLoad(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleAssign(dto: AssignShipmentDto) {
    if (!assigningLoad) return;
    try {
      await assignMut.mutateAsync(dto);
      toast.success("Load assigned successfully");
      setAssigningLoad(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Operations
            </p>
            <h1 className="mt-2 text-4xl font-bold text-foreground">
              Manage Loads
            </h1>
            <p className="mt-2 text-sm text-muted">
              Manage load operations and shipment workflows.
            </p>
          </div>
          <Button
            asChild
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-sidebar hover:bg-primary/85"
          >
            <Link href={`${basePath}/create`}>
              <Plus className="h-4 w-4" />
              Create Load
            </Link>
          </Button>
        </div>

        {/* Role banner */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            isAdmin
              ? "border-info/20 bg-info/5 text-blue-700"
              : "border-warning/20 bg-warning/5 text-yellow-700"
          }`}
        >
          {isAdmin ? (
            <ShieldAlert className="h-4 w-4 shrink-0" />
          ) : (
            <User className="h-4 w-4 shrink-0" />
          )}
          <span className="font-medium">
            {isAdmin
              ? "Viewing as System Admin — full access to all loads"
              : user?.companyRole === "employee"
                ? "Viewing as Employee — your assigned loads"
                : "Viewing as Company Admin — your company's shipments"}
          </span>
        </div>

        {/* KPI cards */}
        <KpiGrid stats={stats} />

        {/* Table */}
        <DataTable<Shipment>
          title="Loads Management"
          columns={columns}
          data={shipments}
          isLoading={isLoading}
          searchValue={filters.search}
          onSearchChange={(v) => setFilter("search", v)}
          searchPlaceholder="Search loads, creator name…"
          onRowClick={(s) => router.push(`${basePath}/${s.shipment_id}`)}
          pageSize={20}
          totalCount={totalCount}
          page={page}
          onPageChange={(pg) => setFilter("page", String(pg))}
          filterChips={filterChips}
          emptyState={<span className="text-muted">No loads found.</span>}
          headerActions={
            <TableFilters
              defs={filterDefs}
              getValue={(key) => filters[key as keyof typeof filters] ?? ""}
              onChange={(key, val) => setFilter(key as keyof typeof FILTER_DEFAULTS, val)}
              onClearAll={clearAll}
              activeCount={activeCount}
              chips={filterChips}
            />
          }
        />
      </div>

      {deletingLoad && (
        <DeleteConfirmDialog
          shipment={deletingLoad}
          open={!!deletingLoad}
          onClose={() => setDeletingLoad(null)}
          onConfirm={handleDelete}
          loading={deleteMut.isPending}
        />
      )}

      {statusLoad && (
        <StatusChangeDialog
          shipment={statusLoad}
          open={!!statusLoad}
          onClose={() => setStatusLoad(null)}
          onConfirm={handleStatusChange}
          loading={statusMut.isPending}
        />
      )}

      {assigningLoad && (
        <AssignDialog
          shipment={assigningLoad}
          companies={companies}
          open={!!assigningLoad}
          onClose={() => setAssigningLoad(null)}
          onConfirm={handleAssign}
          loading={assignMut.isPending}
        />
      )}
    </div>
  );
}
