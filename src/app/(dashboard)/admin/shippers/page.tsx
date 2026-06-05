"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  XCircle,
  ShieldCheck,
  MoreVertical,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { KpiCard } from "@/components/loads/kpi-card";
import { DataTable } from "@/components/loads/loads-table";
import { TableSortHeader } from "@/components/ui/table-sort-header";
import { TableFilters } from "@/components/ui/table-filters";
import type { FilterDef } from "@/components/ui/table-filters";
import { useTableFilters } from "@/hooks/use-table-filters";
import type { SortDir } from "@/hooks/use-table-filters";

import { useAccounts } from "@/hooks/use-accounts";
import { useApproveUser } from "@/hooks/use-users";
import { CompanyLogo } from "@/components/ui/company-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Account, AccountProfile } from "@/types/api.types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string | null, fallback: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return fallback.slice(0, 2).toUpperCase();
}

function getAdmin(profiles?: AccountProfile[]): AccountProfile | undefined {
  return profiles?.find((p) => p.company_role === "company_admin");
}

function getEmployeeCount(profiles?: AccountProfile[]): number {
  return profiles?.filter((p) => p.company_role === "employee").length ?? 0;
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "border-success/25 bg-success/10 text-green-700"
          : "border-danger/25 bg-danger/10 text-red-700"
      }`}
    >
      {active ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Active
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3" />
          Inactive
        </>
      )}
    </span>
  );
}

function ApprovalPill({ approved }: { approved: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
        approved
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-warning/25 bg-warning/10 text-yellow-700"
      }`}
    >
      {approved ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          Approved
        </>
      ) : (
        <>
          <Clock className="h-3 w-3" />
          Pending
        </>
      )}
    </span>
  );
}

/* ─── Actions cell ───────────────────────────────────────────────────────── */

function ActionsCell({ account, onView }: { account: Account; onView: (id: string) => void }) {
  const admin    = getAdmin(account.profiles);
  const approveMut = useApproveUser(admin?.id ?? "");

  async function handle(isApproved: boolean) {
    if (!admin) { toast.error("No company admin found for this company"); return; }
    try {
      await approveMut.mutateAsync(isApproved);
      toast.success(isApproved ? `${account.account_name} approved` : `${account.account_name} rejected`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="h-8 w-8 border-card-border bg-transparent hover:border-primary/30 hover:bg-primary/5">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border border-card-border bg-card shadow-lg">
        {admin ? (
          admin.is_approved ? (
            <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger" onClick={() => handle(false)} disabled={approveMut.isPending}>
              <XCircle className="h-4 w-4" /> Revoke Approval
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg text-green-700 focus:text-green-700" onClick={() => handle(true)} disabled={approveMut.isPending}>
                <ShieldCheck className="h-4 w-4" /> Approve
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger" onClick={() => handle(false)} disabled={approveMut.isPending}>
                <XCircle className="h-4 w-4" /> Reject
              </DropdownMenuItem>
            </>
          )
        ) : (
          <DropdownMenuItem disabled className="gap-2 rounded-lg text-muted">
            <UserCircle2 className="h-4 w-4" /> No admin assigned
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Filter defaults ────────────────────────────────────────────────────── */

const FILTER_DEFAULTS = {
  search:   "",
  isActive: "",
  dateFrom: "",
  dateTo:   "",
  sortBy:   "",
  sortDir:  "",
  page:     "1",
};

const STATUS_OPTIONS = [
  { value: "true",  label: "Active" },
  { value: "false", label: "Inactive" },
];

const FILTER_DEFS: FilterDef[] = [
  { type: "select",    key: "isActive", label: "Status",          options: STATUS_OPTIONS },
  { type: "dateRange", label: "Registered Date", fromKey: "dateFrom", toKey: "dateTo" },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ShippersPage() {
  const router   = useRouter();
  const pathname = usePathname();
  const basePath = pathname.startsWith("/admin") ? "/admin/shippers" : "";

  const { filters, setFilter, setFilters, clearAll, activeCount } =
    useTableFilters(FILTER_DEFAULTS);

  const page    = parseInt(filters.page || "1", 10);
  const sortBy  = filters.sortBy  || undefined;
  const sortDir = (filters.sortDir as SortDir) || null;

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => clearTimeout(searchTimer.current);
  }, [filters.search]);

  const query = useMemo(() => ({
    page,
    limit: 20,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(filters.isActive && { isActive: filters.isActive as "true" | "false" }),
    ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
    ...(filters.dateTo   && { dateTo:   filters.dateTo }),
    ...(sortBy           && { sortBy: sortBy as any }),
    ...(sortDir          && { sortDir }),
  }), [debouncedSearch, filters.isActive, filters.dateFrom, filters.dateTo, page, sortBy, sortDir]);

  const { data: res, isLoading } = useAccounts(query);
  const allAccounts = res?.data ?? [];
  const totalCount  = (res as any)?.meta?.total ?? 0;

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

  const stats = useMemo(() => {
    const approved = allAccounts.filter((a) => getAdmin(a.profiles)?.is_approved).length;
    return { total: totalCount, approved, pending: allAccounts.length - approved };
  }, [allAccounts, totalCount]);

  const pendingAccounts = useMemo(
    () => allAccounts.filter((a) => { const admin = getAdmin(a.profiles); return admin && !admin.is_approved; }),
    [allAccounts],
  );

  const filterChips = useMemo(() => {
    const chips = [];
    if (filters.isActive)
      chips.push({ key: "isActive", label: "Status", value: filters.isActive === "true" ? "Active" : "Inactive", onRemove: () => setFilter("isActive", "") });
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
        id: "admin",
        header: "Company Admin",
        cell: ({ row }) => {
          const admin = getAdmin(row.original.profiles);
          if (!admin) return <span className="text-xs italic text-muted-light">No admin assigned</span>;
          return (
            <div className="flex items-center gap-2">
              <UserAvatar name={admin.full_name} avatarUrl={admin.avatar_url} size="sm" rounded="xl" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{admin.full_name ?? <span className="italic text-muted">No name</span>}</span>
                {admin.phone && <span className="flex items-center gap-1 text-xs text-muted"><Phone className="h-3 w-3 shrink-0" />{admin.phone}</span>}
                <div className="mt-0.5"><ApprovalPill approved={admin.is_approved} /></div>
              </div>
            </div>
          );
        },
      },
      {
        id: "employees",
        header: "Employees",
        cell: ({ row }) => {
          const count = getEmployeeCount(row.original.profiles);
          return (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted" />
              <span className="text-sm text-foreground tabular-nums">{count}</span>
            </div>
          );
        },
      },
      {
        id: "status",
        header: () => sh("Status", "is_active"),
        cell: ({ row }) => <StatusPill active={row.original.is_active} />,
      },
      {
        id: "registered",
        header: () => sh("Registered", "created_at"),
        cell: ({ row }) => <span className="text-xs text-muted">{formatDate(row.original.created_at)}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <ActionsCell account={row.original} onView={(id) => router.push(`/admin/shippers/${id}`)} />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy, sortDir],
  );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-7xl space-y-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">Shipping Companies</h1>
          <p className="mt-2 text-sm text-muted">Monitor and manage all registered shipping companies.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <KpiCard title="Total Companies"    value={stats.total}   icon={Building2}    chartColor="#C89B3C" isLoading={isLoading} />
          <KpiCard title="Approved"           value={stats.approved} icon={CheckCircle2} chartColor="#22C55E" isLoading={isLoading} />
          <KpiCard title="Pending Approval"   value={stats.pending}  icon={Clock}        chartColor="#EAB308" isLoading={isLoading} />
        </div>

        {!isLoading && pendingAccounts.length > 0 && <PendingApprovals accounts={pendingAccounts} />}

        <DataTable<Account>
          title="Companies List"
          columns={columns}
          data={allAccounts}
          isLoading={isLoading}
          searchValue={filters.search}
          onSearchChange={(v) => setFilter("search", v)}
          onRowClick={(a) => router.push(`${basePath}/${a.account_id}`)}
          searchPlaceholder="Search by company, email or admin name…"
          pageSize={20}
          totalCount={totalCount}
          page={page}
          onPageChange={(pg) => setFilter("page", String(pg))}
          filterChips={filterChips}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-4">
              <Building2 className="h-8 w-8 text-muted-light" />
              <p className="text-sm text-muted">No shipping companies found.</p>
            </div>
          }
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
    </div>
  );
}

/* ─── Pending Approvals ──────────────────────────────────────────────────── */

function PendingApprovals({ accounts }: { accounts: Account[] }) {
  return (
    <Card className="border border-warning/25 bg-warning/5 shadow-sm">
      <CardHeader className="border-b border-warning/15 px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-yellow-700">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20">
            <Clock className="h-3.5 w-3.5" />
          </div>
          Pending Approvals
          <span className="ml-1 rounded-full bg-warning/25 px-2 py-0.5 text-xs font-bold tabular-nums text-yellow-800">
            {accounts.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-warning/10 p-0">
        {accounts.map((account) => (
          <PendingAccountRow key={account.account_id} account={account} />
        ))}
      </CardContent>
    </Card>
  );
}

function PendingAccountRow({ account }: { account: Account }) {
  const admin = getAdmin(account.profiles);
  const approveMut = useApproveUser(admin?.id ?? "");

  async function handle(isApproved: boolean) {
    if (!admin) return;
    try {
      await approveMut.mutateAsync(isApproved);
      toast.success(isApproved ? `${account.account_name} approved` : `${account.account_name} rejected`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-xs font-bold text-yellow-700">
          {initials(account.account_name, "CO")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{account.account_name}</p>
          {admin?.full_name && <p className="truncate text-xs text-muted">Admin: {admin.full_name}</p>}
          {account.contact_phone && (
            <p className="flex items-center gap-1 text-xs text-muted">
              <Phone className="h-3 w-3 shrink-0" />{account.contact_phone}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" disabled={!admin || approveMut.isPending} onClick={() => handle(false)}
          className="h-8 rounded-lg border-red-200 px-3 text-xs text-red-600 hover:bg-red-50 hover:border-red-300">
          <XCircle className="mr-1 h-3.5 w-3.5" />Reject
        </Button>
        <Button size="sm" disabled={!admin || approveMut.isPending} onClick={() => handle(true)}
          className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85">
          <ShieldCheck className="mr-1 h-3.5 w-3.5" />Approve
        </Button>
      </div>
    </div>
  );
}
