"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCircle2, Mail, Phone, Calendar, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/loads/kpi-card";
import { DataTable } from "@/components/loads/loads-table";
import { useTableFilters } from "@/hooks/use-table-filters";
import { CreateLoadSheet } from "@/components/loads/sheets/create-load-sheet";

import { useUsers } from "@/hooks/use-users";
import { usePermission } from "@/hooks/use-permission";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { UserProfile } from "@/types/api.types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const FILTER_DEFAULTS = {
  search: "",
  page:   "1",
};

export default function ResidentialCustomersPage() {
  const router = useRouter();
  const canCreate = usePermission("deliveries.create");
  const canView = usePermission("customers.view");
  const [createOpen, setCreateOpen] = useState(false);

  const { filters, setFilter } = useTableFilters(FILTER_DEFAULTS);
  const page = parseInt(filters.page || "1", 10);

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
    role: "residential",
    ...(debouncedSearch && { search: debouncedSearch }),
  }), [page, debouncedSearch]);

  const { data: res, isLoading } = useUsers(query, { enabled: canView });
  const customers   = res?.data ?? [];
  const totalCount  = (res as any)?.meta?.total ?? 0;

  const columns: ColumnDef<UserProfile>[] = useMemo(
    () => [
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar name={u.fullName} avatarUrl={u.avatarUrl} size="md" rounded="xl" />
              <div>
                <p className="text-sm font-semibold text-foreground">{u.fullName ?? "No name"}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Mail className="h-3 w-3 shrink-0" />{u.email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "phone",
        header: "Phone",
        cell: ({ row }) =>
          row.original.phone ? (
            <span className="flex items-center gap-1 text-sm text-foreground">
              <Phone className="h-3.5 w-3.5 text-muted" />{row.original.phone}
            </span>
          ) : (
            <span className="text-xs italic text-muted-light">Not provided</span>
          ),
      },
      {
        id: "registered",
        header: "Registered",
        cell: ({ row }) => (
          <span className="flex items-center gap-1 text-xs text-muted">
            <Calendar className="h-3 w-3 shrink-0" />{formatDate(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">You do not have access to Residential Customers.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-7xl space-y-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">Residential Customers</h1>
          <p className="mt-2 text-sm text-muted">Individuals whose deliveries are managed directly, outside any shipping company.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-1 max-w-xs">
          <KpiCard title="Total Customers" value={totalCount} icon={UserCircle2} chartColor="#C89B3C" isLoading={isLoading} />
        </div>

        <DataTable<UserProfile>
          title="Residential Customers"
          columns={columns}
          data={customers}
          isLoading={isLoading}
          searchValue={filters.search}
          onSearchChange={(v) => setFilter("search", v)}
          onRowClick={(u) => router.push(`/admin/residential/${u.id}`)}
          searchPlaceholder="Search by name or email…"
          pageSize={20}
          totalCount={totalCount}
          page={page}
          onPageChange={(pg) => setFilter("page", String(pg))}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-4">
              <UserCircle2 className="h-8 w-8 text-muted-light" />
              <p className="text-sm text-muted">No residential customers found.</p>
            </div>
          }
          headerActions={
            canCreate && (
              <Button onClick={() => setCreateOpen(true)} className="rounded-lg bg-primary text-sidebar hover:bg-primary/85">
                <Plus className="h-4 w-4" />
                Create a Delivery
              </Button>
            )
          }
        />
      </div>

      <CreateLoadSheet open={createOpen} onClose={() => setCreateOpen(false)} context="residential" />
    </div>
  );
}
