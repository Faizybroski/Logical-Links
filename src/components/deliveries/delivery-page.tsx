"use client";

import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, User } from "lucide-react";

import { DataTable } from "@/components/deliveries/deliveries-table";
import KpiGrid from "@/components/deliveries/kpi-grid";
import { getDeliveryColumns } from "@/components/deliveries/columns";
import { DeleteConfirmDialog } from "@/components/deliveries/dialogs/delete-confirmation-dialog";
import { StatusChangeDialog } from "@/components/deliveries/dialogs/status-change-dialog";
import { AssignDialog } from "@/components/deliveries/dialogs/assign-dialog";
import { TableFilters } from "@/components/ui/table-filters";
import type { FilterDef } from "@/components/ui/table-filters";
import { WorkspaceNavigation } from "@/components/ui/workspace-navigation";
import type { WorkspaceNavItem } from "@/components/ui/workspace-navigation";

import { CreateDeliverySheet } from "@/components/deliveries/sheets/create-delivery-sheet";
import { EditDeliverySheet } from "@/components/deliveries/sheets/edit-delivery-sheet";
import { DeliveryDetailsSheet } from "@/components/deliveries/sheets/delivery-details-sheet";

import { useAuthStore } from "@/store/auth.store";
import { usePermission } from "@/hooks/use-permission";
import {
  useDeliveries,
  useDeleteDelivery,
  useUpdateDeliveryStatus,
  useAssignEmployees,
} from "@/hooks/use-deliveries";
import { useAccounts } from "@/hooks/use-accounts";
import { useAdminEmployees } from "@/hooks/use-admin-employees";
import { useTableFilters } from "@/hooks/use-table-filters";
import type { SortDir } from "@/hooks/use-table-filters";
import type {
  Delivery,
  DeliveryStatus,
  AssignEmployeesDto,
  ListDeliveriesQuery,
} from "@/types/api.types";
import { DELIVERY_STATUS_LABELS as STATUS_LABELS } from "@/types/api.types";

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
  deliveryType:  "",
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

export default function DeliveriesPage() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const user        = useAuthStore((s) => s.user);
  const isAdmin     = user?.role === "admin";

  const canEditPerm       = usePermission("deliveries.edit");
  const canDeletePerm     = usePermission("deliveries.delete");
  const canAssignPerm     = usePermission("deliveries.assign");
  const canUpdateStatusPerm = usePermission("deliveries.update_status");
  const canCreateQuotation = usePermission("quotations.create");
  const canCreateInvoice   = usePermission("invoices.create");

  const isResidential = user?.role === "residential";
  const basePath    = pathname.startsWith("/admin") ? "/admin/deliveries" : isResidential ? "/residential/deliveries" : "/corporate/deliveries";
  const docBasePath = pathname.startsWith("/admin") ? "/admin" : isResidential ? "/residential" : "/corporate";

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

  const openDetails = (id: string) => router.push(buildSheetUrl("details", id));
  const openEdit    = (id: string) => router.push(buildSheetUrl("edit", id));
  const closeSheet  = () => router.push(closeSheetUrl());

  // ── Dialog state (table row actions) ──────────────────────────────────────
  const [deletingDelivery,  setDeletingDelivery]  = useState<Delivery | null>(null);
  const [statusDelivery,    setStatusDelivery]    = useState<Delivery | null>(null);
  const [assigningDelivery, setAssigningDelivery] = useState<Delivery | null>(null);

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
  const accountScope: Partial<ListDeliveriesQuery> = !isAdmin
    ? { accountId: user?.accountId ?? undefined }
    : {};

  // ── Data ───────────────────────────────────────────────────────────────────
  const deliveriesQuery = useMemo(() => ({
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    // Workspace view overrides the status filter; if "all" use the table filter
    ...(viewStatuses
      ? { statuses: viewStatuses }
      : filters.status && { status: filters.status }),
    ...(filters.deliveryType  && { deliveryType: filters.deliveryType as "freight" | "last_mile" }),
    ...(filters.accountId     && isAdmin && { accountId: filters.accountId }),
    ...(filters.dateFrom      && { dateFrom: filters.dateFrom }),
    ...(filters.dateTo        && { dateTo:   filters.dateTo }),
    ...(filters.updatedFrom   && { updatedFrom: filters.updatedFrom }),
    ...(filters.updatedTo     && { updatedTo:   filters.updatedTo }),
    ...(sortBy                && { sortBy: sortBy as any }),
    ...(sortDir               && { sortDir }),
    ...accountScope,
  }), [filters, debouncedSearch, page, sortBy, sortDir, isAdmin, user?.accountId, viewStatuses]);

  const { data: deliveriesRes, isLoading } = useDeliveries(deliveriesQuery);
  const { data: companiesRes } = useAccounts({ limit: 100 }, { enabled: isAdmin });
  const { data: employeesRes } = useAdminEmployees({ limit: 200 }, { enabled: isAdmin });

  const deliveries  = deliveriesRes?.data ?? [];
  const totalCount = (deliveriesRes as any)?.meta?.total ?? 0;
  const companies  = companiesRes?.data ?? [];
  const employees  = employeesRes?.data ?? [];

  // ── Workspace nav counts (lightweight queries — limit 1, read meta.total) ─
  const countActive      = useDeliveries({ statuses: "pending,confirmed,assigned",              limit: 1, ...accountScope });
  const countScheduled   = useDeliveries({ statuses: "confirmed",                               limit: 1, ...accountScope });
  const countInProgress  = useDeliveries({ statuses: "picked_up,in_transit,out_for_delivery",  limit: 1, ...accountScope });
  const countCompleted   = useDeliveries({ statuses: "delivered",                               limit: 1, ...accountScope });
  const countExceptions  = useDeliveries({ statuses: "cancelled",                               limit: 1, ...accountScope });

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
  const deleteMut = useDeleteDelivery();
  const statusMut = useUpdateDeliveryStatus(statusDelivery?.shipment_id ?? "");
  const assignMut = useAssignEmployees(assigningDelivery?.shipment_id ?? "");

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total:      totalCount,
      transit:    deliveries.filter((s) => s.status === "in_transit").length,
      delivered:  deliveries.filter((s) => s.status === "delivered").length,
      exceptions: deliveries.filter((s) => s.status === "cancelled").length,
    }),
    [deliveries, totalCount],
  );

  // ── Permissions ────────────────────────────────────────────────────────────
  // Delivery status/history is admin-only — customers (residential and
  // corporate) can view it but never mutate it themselves.
  const canEdit   = (s: Delivery) => isAdmin && canEditPerm   && !["delivered", "cancelled"].includes(s.status);
  const canDelete = (s: Delivery) => isAdmin && canDeletePerm && ["pending", "confirmed"].includes(s.status);
  const canAssign = (s: Delivery) => isAdmin && canAssignPerm && s.status === "confirmed";
  const canChangeStatus = () => isAdmin && canUpdateStatusPerm;

  // ── Sort handler ───────────────────────────────────────────────────────────
  function handleSort(key: string, dir: SortDir) {
    setFilters({ sortBy: key && dir ? key : "", sortDir: dir ?? "", page: "1" });
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getDeliveryColumns({
        isAdmin,
        basePath,
        docBasePath,
        canEdit,
        canDelete,
        canAssign,
        canChangeStatus,
        sortBy:  sortBy ?? "",
        sortDir,
        onSort:  handleSort,
        onEdit:            (s) => openEdit(s.shipment_id),
        onDelete:          (s) => setDeletingDelivery(s),
        onAssign:          (s) => setAssigningDelivery(s),
        onStatusChange:    (s) => setStatusDelivery(s),
        onCreateQuotation: isAdmin && canCreateQuotation ? (s) => router.push(`${docBasePath}/quotations/create?loadId=${s.shipment_id}`) : undefined,
        onCreateInvoice:   isAdmin && canCreateInvoice   ? (s) => router.push(`${docBasePath}/invoices/create?loadId=${s.shipment_id}`) : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, canEditPerm, canDeletePerm, canAssignPerm, canUpdateStatusPerm, canCreateQuotation, canCreateInvoice, basePath, docBasePath, sortBy, sortDir],
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
    if (filters.deliveryType)
      chips.push({ key: "deliveryType", label: "Type", value: filters.deliveryType === "freight" ? "Freight" : "Last Mile", onRemove: () => setFilter("deliveryType", "") });
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
    { type: "select",    key: "deliveryType", label: "Type",         options: TYPE_OPTIONS },
    ...(isAdmin ? [
      { type: "select" as const, key: "accountId", label: "Company", options: companyOptions },
    ] : []),
    { type: "dateRange", label: "Created Date", fromKey: "dateFrom",    toKey: "dateTo" },
    { type: "dateRange", label: "Updated Date", fromKey: "updatedFrom", toKey: "updatedTo" },
  ], [isAdmin, companyOptions, viewStatuses]);

  // ── Handlers (table-level dialogs) ────────────────────────────────────────
  async function handleDelete(reason: string) {
    if (!deletingDelivery) return;
    try {
      await deleteMut.mutateAsync({ id: deletingDelivery.shipment_id, reason });
      toast.success(`Delivery ${deletingDelivery.load_number} deleted`);
      setDeletingDelivery(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleStatusChange(status: string, reason?: string) {
    if (!statusDelivery) return;
    try {
      await statusMut.mutateAsync({ status, reason });
      toast.success("Status updated successfully");
      setStatusDelivery(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleAssign(dto: AssignEmployeesDto) {
    if (!assigningDelivery) return;
    try {
      await assignMut.mutateAsync(dto);
      toast.success("Employees assigned successfully");
      setAssigningDelivery(null);
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
              Manage delivery operations and delivery workflows.
            </p>
          </div>
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
              : isResidential
                ? "Viewing as Residential Customer — your deliveries"
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
            <DataTable<Delivery>
              title="Deliveries"
              columns={columns}
              data={deliveries}
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
      {deletingDelivery && (
        <DeleteConfirmDialog
          delivery={deletingDelivery}
          open={!!deletingDelivery}
          onClose={() => setDeletingDelivery(null)}
          onConfirm={handleDelete}
          loading={deleteMut.isPending}
        />
      )}
      {statusDelivery && (
        <StatusChangeDialog
          delivery={statusDelivery}
          open={!!statusDelivery}
          onClose={() => setStatusDelivery(null)}
          onConfirm={handleStatusChange}
          loading={statusMut.isPending}
        />
      )}
      {assigningDelivery && (
        <AssignDialog
          delivery={assigningDelivery}
          employees={employees}
          open={!!assigningDelivery}
          onClose={() => setAssigningDelivery(null)}
          onConfirm={handleAssign}
          loading={assignMut.isPending}
        />
      )}

      {/* Sheets — driven by URL params */}
      <CreateDeliverySheet
        open={createOpen}
        onClose={closeSheet}
      />
      <DeliveryDetailsSheet
        open={detailsOpen}
        onClose={closeSheet}
        loadId={lastDetailsId ?? ""}
        onEditClick={openEdit}
      />
      <EditDeliverySheet
        open={editOpen}
        onClose={closeSheet}
        loadId={lastEditId ?? ""}
      />
    </div>
  );
}
