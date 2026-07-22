"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Plus,
  MoreVertical,
  UserX,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { KpiCard } from "@/components/loads/kpi-card";
import { DataTable } from "@/components/loads/loads-table";

import { useAdminEmployees, useUpdateAdminEmployee } from "@/hooks/use-admin-employees";
import { usePermission } from "@/hooks/use-permission";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ADMIN_ROLE_LABELS, type AdminEmployee, type AdminRoleValue } from "@/types/api.types";

const ADMIN_ROLES: AdminRoleValue[] = ["ceo", "vp", "manager", "assistant"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        active
          ? "border-success/25 bg-success/10 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
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
          Disabled
        </>
      )}
    </span>
  );
}

function RolePill({ role }: { role: AdminRoleValue | null }) {
  if (!role) {
    return (
      <span className="inline-flex items-center rounded-full border border-warning/25 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-700">
        Unassigned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
      {ADMIN_ROLE_LABELS[role]}
    </span>
  );
}

function ActionsCell({ employee }: { employee: AdminEmployee }) {
  const updateMut = useUpdateAdminEmployee(employee.id);
  const canSuspend = usePermission("employees.suspend");
  const canManageRoles = usePermission("employees.manage_roles");

  async function toggleActive() {
    try {
      await updateMut.mutateAsync({ isActive: !employee.is_active });
      toast.success(
        employee.is_active
          ? `${employee.full_name ?? employee.email} disabled`
          : `${employee.full_name ?? employee.email} re-enabled`,
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function changeRole(role: AdminRoleValue) {
    if (role === employee.admin_role) return;
    try {
      await updateMut.mutateAsync({ adminRole: role });
      toast.success(`${employee.full_name ?? employee.email} is now ${ADMIN_ROLE_LABELS[role]}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (!canSuspend && !canManageRoles) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 border-card-border bg-transparent hover:border-primary/30 hover:bg-primary/5"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl border border-card-border bg-card shadow-lg"
      >
        {canManageRoles && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2 rounded-lg">
              Change Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="rounded-xl border border-card-border bg-card shadow-lg">
              {ADMIN_ROLES.map((role) => (
                <DropdownMenuItem
                  key={role}
                  className="cursor-pointer rounded-lg"
                  disabled={role === employee.admin_role || updateMut.isPending}
                  onClick={() => changeRole(role)}
                >
                  {ADMIN_ROLE_LABELS[role]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {canSuspend && (
          <DropdownMenuItem
            className={`cursor-pointer gap-2 rounded-lg ${
              employee.is_active
                ? "text-danger focus:text-danger"
                : "text-green-700 focus:text-green-700"
            }`}
            onClick={toggleActive}
            disabled={updateMut.isPending}
          >
            {employee.is_active ? (
              <>
                <UserX className="h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                Re-enable
              </>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const canView = usePermission("employees.view");
  const canCreate = usePermission("employees.create");
  const canSuspend = usePermission("employees.suspend");
  const canManageRoles = usePermission("employees.manage_roles");
  const canShowActions = canSuspend || canManageRoles;

  const { data: res, isLoading } = useAdminEmployees({ limit: 100 }, { enabled: canView });
  const allEmployees = (res?.data ?? []) as AdminEmployee[];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allEmployees;
    return allEmployees.filter(
      (e) =>
        e.full_name?.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone?.toLowerCase().includes(q),
    );
  }, [allEmployees, search]);

  const stats = useMemo(
    () => ({
      total:    allEmployees.length,
      active:   allEmployees.filter((e) => e.is_active).length,
      disabled: allEmployees.filter((e) => !e.is_active).length,
    }),
    [allEmployees],
  );

  const columns: ColumnDef<AdminEmployee>[] = useMemo(
    () => [
      {
        id: "employee",
        header: "Employee",
        cell: ({ row }) => {
          const e = row.original;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar
                name={e.full_name ?? e.email}
                avatarUrl={e.avatar_url}
                size="md"
                rounded="xl"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {e.full_name ?? (
                    <span className="italic font-normal text-muted">No name</span>
                  )}
                </p>
                <p className="text-xs text-muted">{e.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row }) => <RolePill role={row.original.admin_role} />,
      },
      {
        id: "phone",
        header: "Phone",
        cell: ({ row }) =>
          row.original.phone ? (
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {row.original.phone}
            </div>
          ) : (
            <span className="text-sm text-muted-light italic">—</span>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusPill active={row.original.is_active} />,
      },
      {
        id: "joined",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-xs text-muted">{formatDate(row.original.created_at)}</span>
        ),
      },
      ...(canShowActions
        ? [
            {
              id: "actions",
              header: "",
              cell: ({ row }: { row: { original: AdminEmployee } }) => (
                <ActionsCell employee={row.original} />
              ),
            } as ColumnDef<AdminEmployee>,
          ]
        : []),
    ],
    [canShowActions],
  );

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">You do not have access to Employees.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Internal Team
            </p>
            <h1 className="mt-2 text-4xl font-bold text-foreground">Employees</h1>
            <p className="mt-2 text-sm text-muted">
              Manage Logical Links staff accounts and their roles.
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => router.push("/admin/employees/create")}
              className="shrink-0 rounded-xl bg-primary text-sidebar hover:bg-primary/85"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>

        {/* KPI cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          <KpiCard title="Total Employees" value={stats.total}    icon={Users}         chartColor="#C89B3C" isLoading={isLoading} />
          <KpiCard title="Active"          value={stats.active}   icon={CheckCircle2}  chartColor="#22C55E" isLoading={isLoading} />
          <KpiCard title="Disabled"        value={stats.disabled} icon={XCircle}       chartColor="#EF4444" isLoading={isLoading} />
        </div>

        {/* Table */}
        <DataTable<AdminEmployee>
          title="Employees"
          columns={columns}
          data={filtered}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, email or phone…"
          pageSize={10}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-4">
              <Users className="h-8 w-8 text-muted-light" />
              <p className="text-sm text-muted">No employees yet.</p>
              {canCreate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/employees/create")}
                  className="mt-1 rounded-lg border-card-border text-xs"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add First Employee
                </Button>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
