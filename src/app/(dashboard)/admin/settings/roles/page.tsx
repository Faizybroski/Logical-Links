"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Crown,
  Briefcase,
  Users,
  User,
  Building2,
  ClipboardList,
  Truck,
  FileQuestion,
  FileText,
  LifeBuoy,
  BarChart3,
  Settings as SettingsIcon,
  DollarSign,
  type LucideIcon,
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { KpiCard } from "@/components/loads/kpi-card";
import { cn } from "@/lib/utils/cn";

import { useRolePermissionsMatrix, useUpdateRolePermission } from "@/hooks/use-admin-role-permissions";
import { usePermission } from "@/hooks/use-permission";
import { ADMIN_ROLE_LABELS, type AdminRoleValue, type PermissionDef } from "@/types/api.types";

const ADMIN_ROLES: AdminRoleValue[] = ["ceo", "vp", "manager", "assistant"];

const ROLE_ICONS: Record<AdminRoleValue, LucideIcon> = {
  ceo: Crown,
  vp: Briefcase,
  manager: Users,
  assistant: User,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Employee Management": Users,
  "Customer Management": Building2,
  "Booking Management": ClipboardList,
  "Delivery Management": Truck,
  "Quotations": FileQuestion,
  "Invoices": FileText,
  "Support Tickets": LifeBuoy,
  "Reports & Analytics": BarChart3,
  "System Settings": SettingsIcon,
  "Finance": DollarSign,
};

const CEO_LOCKED_PERMISSION = "employees.manage_permissions";

function CategoryIcon({ category }: { category: string }) {
  const Icon = CATEGORY_ICONS[category] ?? ShieldCheck;
  return <Icon className="h-4 w-4" />;
}

export default function RolesPermissionsPage() {
  const canManage = usePermission("employees.manage_permissions");
  const { data: res, isLoading } = useRolePermissionsMatrix({ enabled: canManage });
  const updateMut = useUpdateRolePermission();

  const permissions = res?.data.permissions ?? [];
  const matrix = res?.data.matrix ?? [];

  const grantMap = useMemo(() => {
    const map = new Map<string, boolean>();
    matrix.forEach((row) => map.set(`${row.admin_role}:${row.permission_key}`, row.granted));
    return map;
  }, [matrix]);

  const categories = useMemo(() => {
    const byCategory = new Map<string, PermissionDef[]>();
    permissions.forEach((p) => {
      const list = byCategory.get(p.category) ?? [];
      list.push(p);
      byCategory.set(p.category, list);
    });
    return Array.from(byCategory.entries());
  }, [permissions]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const currentCategory = activeCategory ?? categories[0]?.[0] ?? null;
  const currentPerms = categories.find(([c]) => c === currentCategory)?.[1] ?? [];

  const roleCounts = useMemo(() => {
    const counts: Record<AdminRoleValue, number> = { ceo: 0, vp: 0, manager: 0, assistant: 0 };
    matrix.forEach((row) => {
      if (row.granted) counts[row.admin_role] += 1;
    });
    return counts;
  }, [matrix]);

  async function toggle(role: AdminRoleValue, permissionKey: string, granted: boolean) {
    try {
      await updateMut.mutateAsync({ role, permissionKey, granted });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update permission");
    }
  }

  if (!canManage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">You do not have access to Roles &amp; Permissions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Settings
          </p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">Roles &amp; Permissions</h1>
          <p className="mt-2 text-sm text-muted">
            Configure what each internal role can access. CEO ⊇ VP ⊇ Manager ⊇ Assistant by default — toggle any cell to override it.
          </p>
        </div>

        {/* KPI summary per role */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ADMIN_ROLES.map((role) => (
            <KpiCard
              key={role}
              title={ADMIN_ROLE_LABELS[role]}
              value={roleCounts[role]}
              subtitle={`of ${permissions.length} permissions granted`}
              icon={ROLE_ICONS[role]}
              chartColor="#C89B3C"
              isLoading={isLoading}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-card-border/60" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Category selector */}
            <div className="flex flex-wrap gap-2">
              {categories.map(([category, perms]) => {
                const active = category === currentCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-sidebar shadow-sm"
                        : "border-card-border bg-card text-muted hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    <CategoryIcon category={category} />
                    {category}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                        active ? "bg-sidebar/20 text-sidebar" : "bg-primary/10 text-primary",
                      )}
                    >
                      {perms.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Permission matrix */}
            {currentCategory && (
              <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-card-border px-5 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CategoryIcon category={currentCategory} />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">{currentCategory}</h2>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow className="border-0 hover:bg-primary">
                        <TableHead className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar">
                          Permission
                        </TableHead>
                        {ADMIN_ROLES.map((role) => {
                          const RoleIcon = ROLE_ICONS[role];
                          return (
                            <TableHead
                              key={role}
                              className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar"
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <RoleIcon className="h-3.5 w-3.5" />
                                {ADMIN_ROLE_LABELS[role]}
                              </span>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPerms.map((perm) => (
                        <TableRow key={perm.key} className="border-card-border hover:bg-background/60">
                          <TableCell className="px-5 py-3 text-sm font-medium whitespace-normal text-foreground">
                            {perm.label}
                          </TableCell>
                          {ADMIN_ROLES.map((role) => {
                            const granted = grantMap.get(`${role}:${perm.key}`) ?? false;
                            const locked = role === "ceo" && perm.key === CEO_LOCKED_PERMISSION;
                            return (
                              <TableCell key={role} className="px-4 py-3 text-center">
                                {locked ? (
                                  <span
                                    className="inline-flex h-6 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
                                    title="The CEO role must always retain this permission"
                                  >
                                    <Lock className="h-3.5 w-3.5" />
                                  </span>
                                ) : (
                                  <Switch
                                    checked={granted}
                                    disabled={updateMut.isPending}
                                    onCheckedChange={(checked) => toggle(role, perm.key, checked)}
                                  />
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-start gap-2 rounded-2xl border border-card-border bg-card p-4 text-xs text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            Permission changes take effect the next time the affected employee logs in or their session refreshes (up to ~15 minutes).
          </p>
        </div>
      </div>
    </div>
  );
}
