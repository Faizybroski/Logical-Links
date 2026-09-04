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
  MapPin,
  FileQuestion,
  FileText,
  LifeBuoy,
  BarChart3,
  Settings as SettingsIcon,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KpiCard } from "@/components/deliveries/kpi-card";
import { cn } from "@/lib/utils/cn";

import {
  useRolePermissionsMatrix,
  useUpdateRolePermission,
  useCreateAdminRole,
  useRenameAdminRole,
  useDeleteAdminRole,
} from "@/hooks/use-admin-role-permissions";
import { usePermission } from "@/hooks/use-permission";
import type { AdminRoleDef, PermissionDef, PermissionScope } from "@/types/api.types";

const ROLE_ICONS: Record<string, LucideIcon> = {
  ceo: Crown,
  vp: Briefcase,
  manager: Users,
  assistant: User,
  driver: Truck,
};

function roleIcon(slug: string): LucideIcon {
  return ROLE_ICONS[slug] ?? ShieldCheck;
}

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
  "Locations & Statuses": MapPin,
};

const CEO_LOCKED_PERMISSION = "employees.manage_permissions";

// Categories where a "this staff member's own/assigned records only" filter
// is actually implemented server-side (see deliveries/quotations/invoices
// repositories) — every other category keeps just the single granted checkbox.
const SCOPABLE_CATEGORIES = new Set(["Delivery Management", "Quotations", "Invoices"]);

function CategoryIcon({ category }: { category: string }) {
  const Icon = CATEGORY_ICONS[category] ?? ShieldCheck;
  return <Icon className="h-4 w-4" />;
}

function slugify(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  // Backend requires the slug to start with a letter (roleSlugRegex) — a
  // label like "24/7 Ops" would otherwise slugify to "24_7_ops" and fail
  // validation with no useful error surfaced to the user.
  return /^[0-9]/.test(slug) ? `r_${slug}` : slug;
}

function AddRoleDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [label, setLabel] = useState("");
  const createMut = useCreateAdminRole();
  const slug = slugify(label);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    try {
      await createMut.mutateAsync({ slug, label: label.trim() });
      toast.success(`"${label.trim()}" role created`);
      setLabel("");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="role-label">Role name *</Label>
            <Input
              id="role-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Dispatcher"
              required
              className="rounded-lg"
              autoFocus
            />
            {slug && <p className="text-xs text-muted">Internal key: {slug}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={createMut.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={createMut.isPending || !slug}>
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenameRoleDialog({ role, onClose }: { role: AdminRoleDef; onClose: () => void }) {
  const [label, setLabel] = useState(role.label);
  const renameMut = useRenameAdminRole();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await renameMut.mutateAsync({ role: role.slug, label: label.trim() });
      toast.success("Role renamed");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename {role.label}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="rename-role-label">Role name *</Label>
            <Input
              id="rename-role-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="rounded-lg"
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={renameMut.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={renameMut.isPending}>
              {renameMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RolesPermissionsPage() {
  const canManage = usePermission("employees.manage_permissions");
  const { data: res, isLoading } = useRolePermissionsMatrix({ enabled: canManage });
  const updateMut = useUpdateRolePermission();
  const deleteMut = useDeleteAdminRole();

  const permissions = res?.data.permissions ?? [];
  const matrix = res?.data.matrix ?? [];
  const roles = res?.data.roles ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [renaming, setRenaming] = useState<AdminRoleDef | null>(null);

  const grantMap = useMemo(() => {
    const map = new Map<string, boolean>();
    matrix.forEach((row) => map.set(`${row.admin_role}:${row.permission_key}`, row.granted));
    return map;
  }, [matrix]);

  const scopeMap = useMemo(() => {
    const map = new Map<string, PermissionScope>();
    matrix.forEach((row) => map.set(`${row.admin_role}:${row.permission_key}`, row.scope));
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
    const counts: Record<string, number> = {};
    roles.forEach((r) => { counts[r.slug] = 0; });
    matrix.forEach((row) => {
      if (row.granted && row.admin_role in counts) counts[row.admin_role] += 1;
    });
    return counts;
  }, [matrix, roles]);

  async function toggle(role: string, permissionKey: string, granted: boolean) {
    try {
      await updateMut.mutateAsync({ role, permissionKey, granted });
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update permission");
    }
  }

  async function toggleScope(role: string, permissionKey: string, granted: boolean, limitToOwn: boolean) {
    try {
      await updateMut.mutateAsync({ role, permissionKey, granted, scope: limitToOwn ? "own" : "all" });
      toast.success(limitToOwn ? "Now limited to own/assigned records only" : "Now visible for all records");
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to update permission scope");
    }
  }

  async function handleDelete(role: AdminRoleDef) {
    if (!window.confirm(`Delete the "${role.label}" role? This cannot be undone.`)) return;
    try {
      await deleteMut.mutateAsync(role.slug);
      toast.success(`"${role.label}" role deleted`);
    } catch (err) {
      toast.error((err as Error).message);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Settings
            </p>
            <h1 className="mt-2 text-4xl font-bold text-foreground">Roles &amp; Permissions</h1>
            <p className="mt-2 text-sm text-muted">
              Configure what each internal role can access, or add new roles as the team grows — no code changes required.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="rounded-lg bg-primary text-sidebar hover:bg-primary/85">
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>

        {/* KPI summary per role */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <KpiCard
              key={role.slug}
              title={role.label}
              value={roleCounts[role.slug] ?? 0}
              subtitle={`of ${permissions.length} permissions granted`}
              icon={roleIcon(role.slug)}
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
            {/* Role management row */}
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <div
                  key={role.slug}
                  className="flex items-center gap-1.5 rounded-full border border-card-border bg-card py-1 pl-3 pr-1.5 text-sm text-foreground"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {(() => { const Icon = roleIcon(role.slug); return <Icon className="h-3.5 w-3.5 text-muted" />; })()}
                    {role.label}
                  </span>
                  <button
                    type="button"
                    title="Rename role"
                    onClick={() => setRenaming(role)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-background hover:text-foreground"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    title={role.is_system ? "System roles cannot be deleted" : "Delete role"}
                    disabled={role.is_system || deleteMut.isPending}
                    onClick={() => handleDelete(role)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:bg-background hover:text-danger disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

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
                        {roles.map((role) => {
                          const RoleIcon = roleIcon(role.slug);
                          return (
                            <TableHead
                              key={role.slug}
                              className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar"
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <RoleIcon className="h-3.5 w-3.5" />
                                {role.label}
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
                          {roles.map((role) => {
                            const granted = grantMap.get(`${role.slug}:${perm.key}`) ?? false;
                            const scope = scopeMap.get(`${role.slug}:${perm.key}`) ?? "all";
                            const locked = role.slug === "ceo" && perm.key === CEO_LOCKED_PERMISSION;
                            const scopable = SCOPABLE_CATEGORIES.has(currentCategory ?? "");
                            return (
                              <TableCell key={role.slug} className="px-4 py-3 text-center">
                                {locked ? (
                                  <span
                                    className="inline-flex h-6 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
                                    title="The CEO role must always retain this permission"
                                  >
                                    <Lock className="h-3.5 w-3.5" />
                                  </span>
                                ) : (
                                  <div className="flex flex-col items-center gap-1.5">
                                    <Switch
                                      checked={granted}
                                      disabled={updateMut.isPending}
                                      onCheckedChange={(checked) => toggle(role.slug, perm.key, checked)}
                                    />
                                    {scopable && granted && (
                                      <label
                                        className="flex items-center gap-1.5 text-[10px] font-medium text-muted"
                                        title="Only see records this role's own staff member is assigned to, instead of every record"
                                      >
                                        <Checkbox
                                          checked={scope === "own"}
                                          disabled={updateMut.isPending}
                                          onCheckedChange={(checked) => toggleScope(role.slug, perm.key, granted, checked === true)}
                                        />
                                        Own only
                                      </label>
                                    )}
                                  </div>
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

      <AddRoleDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {renaming && <RenameRoleDialog role={renaming} onClose={() => setRenaming(null)} />}
    </div>
  );
}
