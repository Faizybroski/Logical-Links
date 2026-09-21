"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  CheckCircle2,
  MoreVertical,
  Plus,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateDeliverySheet } from "@/components/deliveries/sheets/create-delivery-sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { KpiCard } from "@/components/deliveries/kpi-card";
import { DataTable } from "@/components/deliveries/deliveries-table";
import { TableSortHeader } from "@/components/ui/table-sort-header";
import { TableFilters } from "@/components/ui/table-filters";
import type { FilterDef } from "@/components/ui/table-filters";
import { useTableFilters } from "@/hooks/use-table-filters";
import type { SortDir } from "@/hooks/use-table-filters";

import {
  useAccounts, useSetAccountPipelineStatus, useDeleteAccount,
  useReconsiderAccount, usePurgeAccount,
} from "@/hooks/use-accounts";
import { usePermission } from "@/hooks/use-permission";
import { CompanyLogo } from "@/components/ui/company-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import { PipelineStatusBadge } from "@/components/accounts/pipeline-status-badge";
import { AddCorporateCustomerSheet } from "@/components/accounts/add-corporate-customer-sheet";
import { RejectAccountDialog } from "@/components/accounts/reject-account-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  CORPORATE_PIPELINE_STATUSES,
  CORPORATE_PIPELINE_STATUS_META,
  CORPORATE_PORTAL_ACCESS_STATUSES,
  accountDisplayStatus,
  type Account,
  type CorporatePipelineStatus,
} from "@/types/api.types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const IN_PIPELINE: CorporatePipelineStatus[] = ["prospect", "contacted", "interested", "onboarding"];

/* ─── Actions cell ───────────────────────────────────────────────────────── */

function ActionsCell({ account }: { account: Account }) {
  const canEdit = usePermission("customers.edit");
  const canDelete = usePermission("customers.delete");
  const statusMut = useSetAccountPipelineStatus(account.account_id);
  const deleteMut = useDeleteAccount();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  async function setStatus(next: CorporatePipelineStatus) {
    if (next === account.pipeline_status) return;
    try {
      await statusMut.mutateAsync(next);
      toast.success(`${account.account_name} → ${CORPORATE_PIPELINE_STATUS_META[next].label}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function confirmDelete() {
    try {
      await deleteMut.mutateAsync(account.account_id);
      toast.success(`${account.account_name} removed`);
      setDeleteOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (!canEdit && !canDelete) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" className="h-8 w-8 border-card-border bg-transparent hover:border-primary/30 hover:bg-primary/5">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl border border-card-border bg-card shadow-lg">
          {canEdit && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer gap-2 rounded-lg">Set status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-xl border border-card-border bg-card shadow-lg">
                {CORPORATE_PIPELINE_STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    className="cursor-pointer gap-2 rounded-lg"
                    disabled={s === account.pipeline_status || statusMut.isPending}
                    onClick={() => setStatus(s)}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${CORPORATE_PIPELINE_STATUS_META[s].dot}`} />
                    {CORPORATE_PIPELINE_STATUS_META[s].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {canEdit && !account.rejected_at &&
            !CORPORATE_PORTAL_ACCESS_STATUSES.includes(account.pipeline_status) && (
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger"
              onClick={(e) => { e.preventDefault(); setRejectOpen(true); }}
            >
              <XCircle className="h-4 w-4" /> Reject application
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger"
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMut.isPending}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <RejectAccountDialog
        accountId={account.account_id}
        accountName={account.account_name}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteMut.isPending}
        title="Delete corporate customer"
        description={
          <>
            {account.account_name} will be removed from the dashboard and its logins disabled.
            Deliveries, invoices and history are kept and this can be undone by an administrator.
          </>
        }
        confirmLabel="Delete"
      />
    </>
  );
}

/* ─── Rejected-view actions ──────────────────────────────────────────────── */

function RejectedActionsCell({ account }: { account: Account }) {
  const canEdit = usePermission("customers.edit");
  const canDelete = usePermission("customers.delete");
  const reconsiderMut = useReconsiderAccount(account.account_id);
  const purgeMut = usePurgeAccount(account.account_id);
  const [purgeOpen, setPurgeOpen] = useState(false);

  async function reconsider() {
    try {
      await reconsiderMut.mutateAsync();
      toast.success(`${account.account_name} reopened for review`);
    } catch (err) { toast.error((err as Error).message); }
  }
  async function purge() {
    try {
      await purgeMut.mutateAsync();
      toast.success("Account permanently deleted");
      setPurgeOpen(false);
    } catch (err) { toast.error((err as Error).message); }
  }

  return (
    <div className="flex items-center gap-2">
      {canEdit && (
        <Button size="sm" variant="outline" onClick={reconsider} disabled={reconsiderMut.isPending}
          className="h-8 rounded-lg px-3 text-xs">Reconsider</Button>
      )}
      {canDelete && (
        <Button size="sm" variant="outline" onClick={() => setPurgeOpen(true)} disabled={purgeMut.isPending}
          className="h-8 rounded-lg border-red-200 px-3 text-xs text-red-600 hover:bg-red-50">Purge</Button>
      )}

      <ConfirmDialog
        open={purgeOpen}
        onClose={() => setPurgeOpen(false)}
        onConfirm={purge}
        loading={purgeMut.isPending}
        title="Purge account permanently"
        description={
          <>Permanently delete {account.account_name} and ALL of its data now? This cannot be undone.</>
        }
        confirmLabel="Purge now"
      />
    </div>
  );
}

/* ─── Filter defaults ────────────────────────────────────────────────────── */

const FILTER_DEFAULTS = {
  view:           "pipeline",   // "pipeline" | "rejected"
  search:         "",
  pipelineStatus: "",
  dateFrom:       "",
  dateTo:         "",
  sortBy:         "",
  sortDir:        "",
  page:           "1",
};

const PIPELINE_OPTIONS = CORPORATE_PIPELINE_STATUSES.map((s) => ({
  value: s,
  label: CORPORATE_PIPELINE_STATUS_META[s].label,
}));

const FILTER_DEFS: FilterDef[] = [
  { type: "select",    key: "pipelineStatus", label: "Pipeline stage",  options: PIPELINE_OPTIONS },
  { type: "dateRange", label: "Registered Date", fromKey: "dateFrom", toKey: "dateTo" },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function CorporateCustomersPage() {
  const router   = useRouter();
  const pathname = usePathname();
  const basePath = pathname.startsWith("/admin") ? "/admin/corporate-customers" : "";

  const { filters, setFilter, setFilters, clearAll, activeCount } =
    useTableFilters(FILTER_DEFAULTS);

  const page    = parseInt(filters.page || "1", 10);
  const sortBy  = filters.sortBy  || undefined;
  const sortDir = (filters.sortDir as SortDir) || null;
  const view    = (filters.view || "pipeline") as "pipeline" | "rejected";
  const isRejectedView = view === "rejected";

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  const query = useMemo(() => ({
    page,
    limit: 20,
    ...(isRejectedView
      ? { rejected: "true" as const }
      : filters.pipelineStatus && { pipelineStatus: filters.pipelineStatus as CorporatePipelineStatus }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
    ...(filters.dateTo   && { dateTo:   filters.dateTo }),
    ...(sortBy           && { sortBy: sortBy as any }),
    ...(sortDir          && { sortDir }),
  }), [isRejectedView, debouncedSearch, filters.pipelineStatus, filters.dateFrom, filters.dateTo, page, sortBy, sortDir]);

  const { data: res, isLoading } = useAccounts(query);
  const allAccounts = res?.data ?? [];
  const totalCount  = (res as any)?.meta?.total ?? 0;

  const canCreateCustomer = usePermission("customers.create");
  const canCreateDelivery = usePermission("deliveries.create");
  const [createOpen, setCreateOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  function handleSort(key: string, dir: SortDir) {
    setFilters({ sortBy: key && dir ? key : "", sortDir: dir ?? "", page: "1" });
  }

  function sh(label: string, key: string) {
    return (
      <TableSortHeader
        label={label}
        sortKey={key}
        currentSort={sortBy ?? ""}
        currentDir={sortDir}
        onSort={handleSort}
      />
    );
  }

  // KPIs reflect the current (filtered) page's counts, same as before.
  const stats = useMemo(() => {
    const active = allAccounts.filter((a) => a.pipeline_status === "active").length;
    const inPipeline = allAccounts.filter((a) => IN_PIPELINE.includes(a.pipeline_status)).length;
    return { total: totalCount, active, inPipeline };
  }, [allAccounts, totalCount]);

  const filterChips = useMemo(() => {
    const chips = [];
    if (filters.pipelineStatus)
      chips.push({
        key: "pipelineStatus",
        label: "Stage",
        value: CORPORATE_PIPELINE_STATUS_META[filters.pipelineStatus as CorporatePipelineStatus]?.label ?? filters.pipelineStatus,
        onRemove: () => setFilter("pipelineStatus", ""),
      });
    if (filters.dateFrom || filters.dateTo)
      chips.push({ key: "date", label: "Registered", value: `${filters.dateFrom || "…"} – ${filters.dateTo || "…"}`, onRemove: () => setFilters({ dateFrom: "", dateTo: "" }) });
    return chips;
  }, [filters, setFilter, setFilters]);

  const columns: ColumnDef<Account>[] = useMemo(
    () => [
      {
        id: "company",
        header: () => sh("Company", "account_name"),
        cell: ({ row }) => {
          const a = row.original;
          return (
            <div className="flex items-center gap-3">
              <CompanyLogo name={a.account_name} logoUrl={a.logo_url} size="md" rounded="xl" />
              <div>
                <p className="text-sm font-semibold text-foreground">{a.account_name}</p>
                {a.contact_email && <p className="text-xs text-muted">{a.contact_email}</p>}
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        header: () => sh("Status", "pipeline_status"),
        cell: ({ row }) => <PipelineStatusBadge status={accountDisplayStatus(row.original)} />,
      },
      {
        id: "lastContacted",
        header: "Last Contacted",
        cell: ({ row }) => {
          const d = row.original.last_contacted_at;
          return <span className="text-xs text-muted">{d ? formatDate(d) : "—"}</span>;
        },
      },
      {
        id: "nextFollowUp",
        header: "Next Follow Up",
        cell: ({ row }) => {
          const d = row.original.next_follow_up_at;
          if (!d) return <span className="text-xs text-muted">—</span>;
          const overdue = new Date(d).getTime() < Date.now();
          return (
            <span className={`text-xs font-medium ${overdue ? "text-red-600" : "text-muted"}`}>
              {formatDate(d)}{overdue && " (overdue)"}
            </span>
          );
        },
      },
      {
        id: "assignedTo",
        header: "Assigned To",
        cell: ({ row }) => {
          const emp = row.original.assigned_employee;
          if (!emp) return <span className="text-xs italic text-muted-light">Unassigned</span>;
          return (
            <div className="flex items-center gap-2">
              <UserAvatar name={emp.full_name} avatarUrl={emp.avatar_url} size="sm" rounded="xl" />
              <span className="text-sm font-medium text-foreground">{emp.full_name ?? "No name"}</span>
            </div>
          );
        },
      },
      isRejectedView
        ? {
            id: "purge",
            header: "Purge date",
            cell: ({ row }) => (
              <span className="text-xs text-red-600">
                {row.original.purge_after ? formatDate(row.original.purge_after) : "—"}
              </span>
            ),
          }
        : {
            id: "registered",
            header: () => sh("Registered", "created_at"),
            cell: ({ row }) => <span className="text-xs text-muted">{formatDate(row.original.created_at)}</span>,
          },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          isRejectedView
            ? <RejectedActionsCell account={row.original} />
            : <ActionsCell account={row.original} />,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy, sortDir, isRejectedView],
  );

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">Corporate Customers</h1>
          <p className="mt-2 text-sm text-muted">
            Track companies through the sales pipeline — from prospect to active customer.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-card-border bg-card p-1">
          {(["pipeline", "rejected"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilters({ view: v, page: "1" })}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                view === v ? "bg-primary text-sidebar" : "text-muted hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {!isRejectedView && (
          <div className="grid gap-5 sm:grid-cols-3">
            <KpiCard title="Total Corporate Customers" value={stats.total}      icon={Building2}    chartColor="#C89B3C" isLoading={isLoading} />
            <KpiCard title="Active"                     value={stats.active}     icon={CheckCircle2} chartColor="#22C55E" isLoading={isLoading} />
            <KpiCard title="In Pipeline"                value={stats.inPipeline} icon={TrendingUp}   chartColor="#8B5CF6" isLoading={isLoading} />
          </div>
        )}

        {isRejectedView && (
          <div className="rounded-2xl border border-danger/20 bg-danger/5 px-5 py-3 text-sm text-red-700">
            Rejected applications are kept for 90 days so the decision can be reversed, then permanently deleted.
          </div>
        )}

        <DataTable<Account>
          title="Corporate Customers List"
          columns={columns}
          data={allAccounts}
          isLoading={isLoading}
          searchValue={filters.search}
          onSearchChange={(v) => setFilter("search", v)}
          onRowClick={(a) => router.push(`${basePath}/${a.account_id}`)}
          searchPlaceholder="Search by company, code, email…"
          pageSize={20}
          totalCount={totalCount}
          page={page}
          onPageChange={(pg) => setFilter("page", String(pg))}
          filterChips={isRejectedView ? [] : filterChips}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-4">
              <Building2 className="h-8 w-8 text-muted-light" />
              <p className="text-sm text-muted">No corporate customers found.</p>
            </div>
          }
          headerActions={
            <div className="flex items-center gap-2">
              {!isRejectedView && canCreateCustomer && (
                <Button onClick={() => setAddOpen(true)} variant="outline" className="rounded-lg border-card-border">
                  <Plus className="h-4 w-4" />
                  Add Corporate Customer
                </Button>
              )}
              {!isRejectedView && canCreateDelivery && (
                <Button onClick={() => setCreateOpen(true)} className="rounded-lg bg-primary text-sidebar hover:bg-primary/85">
                  <Plus className="h-4 w-4" />
                  Create a Delivery
                </Button>
              )}
              {!isRejectedView && (
                <TableFilters
                  defs={FILTER_DEFS}
                  getValue={(key) => filters[key as keyof typeof FILTER_DEFAULTS] ?? ""}
                  onChange={(key, val) => setFilter(key as keyof typeof FILTER_DEFAULTS, val)}
                  onClearAll={clearAll}
                  activeCount={activeCount}
                  chips={filterChips}
                />
              )}
            </div>
          }
        />
      </div>

      <AddCorporateCustomerSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <CreateDeliverySheet open={createOpen} onClose={() => setCreateOpen(false)} context="corporate" />
    </div>
  );
}
