"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { WorkspaceNavigation } from "@/components/ui/workspace-navigation";
import type { WorkspaceNavItem } from "@/components/ui/workspace-navigation";

import { CreateLoadSheet } from "@/components/loads/sheets/create-load-sheet";
import { EditLoadSheet } from "@/components/loads/sheets/edit-load-sheet";
import { LoadDetailsSheet } from "@/components/loads/sheets/load-details-sheet";

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
  ListShipmentsQuery,
} from "@/types/api.types";
import { SHIPMENT_STATUS_LABELS as STATUS_LABELS } from "@/types/api.types";

// ── Workspace views ────────────────────────────────────────────────────────────

type WorkspaceViewKey = "all" | "active" | "scheduled" | "in_progress" | "completed" | "exceptions";

const WORKSPACE_VIEWS: { key: WorkspaceViewKey; label: string; statuses: string | null }[] = [
  { key: "all",         label: "All Deliveries", statuses: null },
  { key: "active",      label: "Active",       statuses: "pending,confirmed,assigned" },
  { key: "scheduled",   label: "Scheduled",    statuses: "confirmed" },
  { key: "in_progress", label: "In Progress",  statuses: "picked_up,in_transit,out_for_delivery" },
  { key: "completed",   label: "Completed",    statuses: "delivered" },
  { key: "exceptions",  label: "Exceptions",   statuses: "cancelled" },
];

// ── Filter defaults ────────────────────────────────────────────────────────────

const FILTER_DEFAULTS = {
  search:        "",
  status:        "",
  shipmentType:  "",
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

export default function LoadsPage() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const user        = useAuthStore((s) => s.user);
  const isAdmin     = user?.role === "admin";

  const basePath    = pathname.startsWith("/admin") ? "/admin/loads" : "/shipper/loads";
  const docBasePath = pathname.startsWith("/admin") ? "/admin" : "/shipper";

  // ── Sheet URL params ───────────────────────────────────────────────────────
  const createParam  = searchParams.get("create");
  const detailsParam = searchParams.get("details");
  const editParam    = searchParams.get("edit");

  const createOpen = createParam === "true";
  const detailsOpen = !!detailsParam;
  const editOpen    = !!editParam;

  // Keep last known IDs so the sheet content stays visible during close animation
  const [lastDetailsId, setLastDetailsId] = useState<string | null>(detailsParam);
  const [lastEditId,    setLastEditId]    = useState<string | null>(editParam);

  useEffect(() => { if (detailsParam) setLastDetailsId(detailsParam); }, [detailsParam]);
  useEffect(() => { if (editParam)    setLastEditId(editParam); },    [editParam]);

  // ── Workspace view (from URL param) ───────────────────────────────────────
  const viewParam    = (searchParams.get("view") ?? "all") as WorkspaceViewKey;
  const activeView   = WORKSPACE_VIEWS.find((v) => v.key === viewParam) ?? WORKSPACE_VIEWS[0];
  const viewStatuses = activeView.statuses;

  function setWorkspaceView(key: WorkspaceViewKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") params.delete("view");
    else params.set("view", key);
    // Reset to page 1 when switching views
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  // ── Sheet navigation helpers ───────────────────────────────────────────────
  function buildSheetUrl(key: "create" | "details" | "edit", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("create");
    params.delete("details");
    params.delete("edit");
    params.set(key, value);
    return `${pathname}?${params.toString()}`;
  }

  function closeSheetUrl() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("create");
    params.delete("details");
    params.delete("edit");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const openCreate  = () => router.push(buildSheetUrl("create", "true"));
  const openDetails = (id: string) => router.push(buildSheetUrl("details", id));
  const openEdit    = (id: string) => router.push(buildSheetUrl("edit", id));
  const closeSheet  = () => router.push(closeSheetUrl());

  // ── Dialog state (table row actions) ──────────────────────────────────────
  const [deletingLoad,  setDeletingLoad]  = useState<Shipment | null>(null);
  const [statusLoad,    setStatusLoad]    = useState<Shipment | null>(null);
  const [assigningLoad, setAssigningLoad] = useState<Shipment | null>(null);

  // ── URL filter state ───────────────────────────────────────────────────────
  const { filters, setFilter, setFilters, clearAll, activeCount } =
    useTableFilters(FILTER_DEFAULTS);

  const page    = parseInt(filters.page || "1", 10);
  const sortBy  = filters.sortBy  || undefined;
  const sortDir = (filters.sortDir as SortDir) || null;

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  // Shared account scoping for non-admin users
  const accountScope: Partial<ListShipmentsQuery> = !isAdmin
    ? { accountId: user?.accountId ?? undefined }
    : {};

  // ── Data ───────────────────────────────────────────────────────────────────
  const shipmentsQuery = useMemo(() => ({
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    // Workspace view overrides the status filter; if "all" use the table filter
    ...(viewStatuses
      ? { statuses: viewStatuses }
      : filters.status && { status: filters.status }),
    ...(filters.shipmentType  && { shipmentType: filters.shipmentType as "freight" | "last_mile" }),
    ...(filters.accountId     && isAdmin && { accountId: filters.accountId }),
    ...(filters.dateFrom      && { dateFrom: filters.dateFrom }),
    ...(filters.dateTo        && { dateTo:   filters.dateTo }),
    ...(filters.updatedFrom   && { updatedFrom: filters.updatedFrom }),
    ...(filters.updatedTo     && { updatedTo:   filters.updatedTo }),
    ...(sortBy                && { sortBy: sortBy as any }),
    ...(sortDir               && { sortDir }),
    ...accountScope,
  }), [filters, debouncedSearch, page, sortBy, sortDir, isAdmin, user?.accountId, viewStatuses]);

  const { data: shipmentsRes, isLoading } = useShipments(shipmentsQuery);
  const { data: companiesRes } = useAccounts({ limit: 100 }, { enabled: isAdmin });

  const shipments  = shipmentsRes?.data ?? [];
  const totalCount = (shipmentsRes as any)?.meta?.total ?? 0;
  const companies  = companiesRes?.data ?? [];

  // ── Workspace nav counts (lightweight queries — limit 1, read meta.total) ─
  const countActive      = useShipments({ statuses: "pending,confirmed,assigned",              limit: 1, ...accountScope });
  const countScheduled   = useShipments({ statuses: "confirmed",                               limit: 1, ...accountScope });
  const countInProgress  = useShipments({ statuses: "picked_up,in_transit,out_for_delivery",  limit: 1, ...accountScope });
  const countCompleted   = useShipments({ statuses: "delivered",                               limit: 1, ...accountScope });
  const countExceptions  = useShipments({ statuses: "cancelled",                               limit: 1, ...accountScope });

  const navItems: WorkspaceNavItem[] = WORKSPACE_VIEWS.map((v) => {
    if (v.key === "all") return { key: v.key, label: v.label };
    const countMap: Record<string, { data: any; isLoading: boolean }> = {
      active:      countActive,
      scheduled:   countScheduled,
      in_progress: countInProgress,
      completed:   countCompleted,
      exceptions:  countExceptions,
    };
    const q = countMap[v.key];
    return {
      key:          v.key,
      label:        v.label,
      count:        q.isLoading ? undefined : ((q.data as any)?.meta?.total ?? 0),
      countLoading: q.isLoading,
    };
  });

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
  // Shipping companies never edit/delete the whole delivery — only status,
  // location, and employee assignment (handled elsewhere).
  const canEdit   = (s: Shipment) => isAdmin && !["delivered", "cancelled"].includes(s.status);
  const canDelete = (s: Shipment) => isAdmin && ["pending", "confirmed"].includes(s.status);
  const canAssign = (s: Shipment) => isAdmin && s.status === "confirmed";

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
        onEdit:            (s) => openEdit(s.shipment_id),
        onDelete:          (s) => setDeletingLoad(s),
        onAssign:          (s) => setAssigningLoad(s),
        onStatusChange:    (s) => setStatusLoad(s),
        onCreateQuotation: isAdmin ? (s) => router.push(`${docBasePath}/quotations/create?loadId=${s.shipment_id}`) : undefined,
        onCreateInvoice:   isAdmin ? (s) => router.push(`${docBasePath}/invoices/create?loadId=${s.shipment_id}`) : undefined,
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
    // Only show status chip when workspace view is "all" (otherwise the view controls it)
    if (filters.status && !viewStatuses)
      chips.push({ key: "status", label: "Status", value: STATUS_LABELS[filters.status as keyof typeof STATUS_LABELS] ?? filters.status, onRemove: () => setFilter("status", "") });
    if (filters.shipmentType)
      chips.push({ key: "shipmentType", label: "Type", value: filters.shipmentType === "freight" ? "Freight" : "Last Mile", onRemove: () => setFilter("shipmentType", "") });
    if (filters.accountId && isAdmin)
      chips.push({ key: "accountId", label: "Company", value: companyName(filters.accountId), onRemove: () => setFilter("accountId", "") });
    if (filters.dateFrom || filters.dateTo)
      chips.push({ key: "date", label: "Created", value: `${filters.dateFrom || "…"} – ${filters.dateTo || "…"}`, onRemove: () => setFilters({ dateFrom: "", dateTo: "" }) });
    if (filters.updatedFrom || filters.updatedTo)
      chips.push({ key: "updated", label: "Updated", value: `${filters.updatedFrom || "…"} – ${filters.updatedTo || "…"}`, onRemove: () => setFilters({ updatedFrom: "", updatedTo: "" }) });
    return chips;
  }, [filters, isAdmin, companyName, setFilter, setFilters, viewStatuses]);

  // ── Filter defs ────────────────────────────────────────────────────────────
  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: c.account_id, label: c.account_name })),
    [companies],
  );

  const filterDefs: FilterDef[] = useMemo(() => [
    // Hide status filter when a workspace view is active (the view controls it)
    ...(!viewStatuses ? [{ type: "select" as const, key: "status", label: "Status", options: STATUS_OPTIONS }] : []),
    { type: "select",    key: "shipmentType", label: "Type",         options: TYPE_OPTIONS },
    ...(isAdmin ? [
      { type: "select" as const, key: "accountId", label: "Company", options: companyOptions },
    ] : []),
    { type: "dateRange", label: "Created Date", fromKey: "dateFrom",    toKey: "dateTo" },
    { type: "dateRange", label: "Updated Date", fromKey: "updatedFrom", toKey: "updatedTo" },
  ], [isAdmin, companyOptions, viewStatuses]);

  // ── Handlers (table-level dialogs) ────────────────────────────────────────
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
              Deliveries
            </h1>
            <p className="mt-2 text-sm text-muted">
              Manage delivery operations and shipment workflows.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-sidebar hover:bg-primary/85"
            >
              <Plus className="h-4 w-4" />
              Create Load
            </Button>
          )}
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
              ? "Viewing as System Admin — full access to all deliveries"
              : user?.companyRole === "employee"
                ? "Viewing as Employee — your assigned deliveries"
                : "Viewing as Company Admin — your company's deliveries"}
          </span>
        </div>

        {/* KPI cards */}
        <KpiGrid stats={stats} />

        {/* Deliveries workspace: left nav + table */}
        <div className="flex items-start gap-5">
          <WorkspaceNavigation
            title="Deliveries"
            items={navItems}
            activeKey={viewParam}
            onSelect={(key) => setWorkspaceView(key as WorkspaceViewKey)}
          />

          {/* Center: table */}
          <div className="flex-1 min-w-0">
            <DataTable<Shipment>
              title="Deliveries"
              columns={columns}
              data={shipments}
              isLoading={isLoading}
              searchValue={filters.search}
              onSearchChange={(v) => setFilter("search", v)}
              searchPlaceholder="Search deliveries, creator name…"
              onRowClick={(s) => openDetails(s.shipment_id)}
              pageSize={20}
              totalCount={totalCount}
              page={page}
              onPageChange={(pg) => setFilter("page", String(pg))}
              filterChips={filterChips}
              emptyState={<span className="text-muted">No deliveries found.</span>}
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
        </div>
      </div>

      {/* Table-level dialogs */}
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

      {/* Sheets — driven by URL params */}
      <CreateLoadSheet
        open={createOpen}
        onClose={closeSheet}
      />
      <LoadDetailsSheet
        open={detailsOpen}
        onClose={closeSheet}
        loadId={lastDetailsId ?? ""}
        onEditClick={openEdit}
      />
      <EditLoadSheet
        open={editOpen}
        onClose={closeSheet}
        loadId={lastEditId ?? ""}
      />
    </div>
  );
}
