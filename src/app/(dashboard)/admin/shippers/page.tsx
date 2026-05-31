"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  CheckCircle2,
  Clock,
  Phone,
  Eye,
  XCircle,
  ShieldCheck,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { KpiCard } from "@/components/loads/kpi-card";
import { DataTable } from "@/components/loads/loads-table";

import { useUsers, useApproveUser } from "@/hooks/use-users";
import type { UserProfile } from "@/types/api.types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function StatusPill({ approved }: { approved: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        approved
          ? "border-success/25 bg-success/10 text-green-700"
          : "border-warning/25 bg-warning/10 text-yellow-700"
      }`}
    >
      {approved ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
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

/* ─── Actions cell (isolated so each row can own its mutation) ───────────── */

function ActionsCell({
  user,
  onView,
}: {
  user: UserProfile;
  onView: (id: string) => void;
}) {
  const approveMut = useApproveUser(user.id);

  async function handle(isApproved: boolean) {
    try {
      await approveMut.mutateAsync(isApproved);
      toast.success(
        isApproved
          ? `${user.fullName ?? user.email} approved`
          : `${user.fullName ?? user.email} rejected`,
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

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
        {/* <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-lg"
          onClick={() => onView(user.id)}
        >
          <Eye className="h-4 w-4" />
          View Details
        </DropdownMenuItem> */}

        {/* <DropdownMenuSeparator /> */}

        {user.isApproved ? (
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger"
            onClick={() => handle(false)}
            disabled={approveMut.isPending}
          >
            <XCircle className="h-4 w-4" />
            Revoke Approval
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-green-700 focus:text-green-700"
              onClick={() => handle(true)}
              disabled={approveMut.isPending}
            >
              <ShieldCheck className="h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger"
              onClick={() => handle(false)}
              disabled={approveMut.isPending}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function ShippersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const basePath = pathname.startsWith("/admin") ? "/admin/shippers" : "";

  const { data: res, isLoading } = useUsers({ role: "shipper", limit: 100 });
  const allShippers = res?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allShippers;
    return allShippers.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q),
    );
  }, [allShippers, search]);

  const stats = useMemo(
    () => ({
      total: allShippers.length,
      approved: allShippers.filter((u) => u.isApproved).length,
      pending: allShippers.filter((u) => !u.isApproved).length,
    }),
    [allShippers],
  );

  const pendingUsers = useMemo(
    () => allShippers.filter((u) => !u.isApproved),
    [allShippers],
  );

  const columns: ColumnDef<UserProfile>[] = useMemo(
    () => [
      {
        id: "shipper",
        header: "Shipper",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                {initials(u.fullName, u.email)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {u.fullName ?? (
                    <span className="italic font-normal text-muted">
                      No name
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">{u.email}</p>
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
        cell: ({ row }) => <StatusPill approved={row.original.isApproved} />,
      },
      {
        id: "registered",
        header: "Registered",
        cell: ({ row }) => (
          <span className="text-xs text-muted">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <ActionsCell
            user={row.original}
            onView={(id) => router.push(`/admin/shippers/${id}`)}
          />
        ),
      },
    ],
    // router is stable — no deps needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* ── Page header ── */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Administration
          </p>
          <h1 className="mt-2 text-4xl font-bold text-foreground">
            Manage Shippers
          </h1>
          <p className="mt-2 text-sm text-muted">
            Monitor and manage all registered shipping partners.
          </p>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid gap-5 sm:grid-cols-3">
          <KpiCard
            title="Total Shippers"
            value={stats.total}
            icon={Users}
            chartColor="#C89B3C"
            isLoading={isLoading}
          />
          <KpiCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle2}
            chartColor="#22C55E"
            isLoading={isLoading}
          />
          <KpiCard
            title="Pending Approval"
            value={stats.pending}
            icon={Clock}
            chartColor="#EAB308"
            isLoading={isLoading}
          />
        </div>

        {/* ── Pending approvals quick-action panel ── */}
        {!isLoading && pendingUsers.length > 0 && (
          <PendingApprovals users={pendingUsers} />
        )}

        {/* ── Shippers table ── */}
        <DataTable<UserProfile>
          title="Shippers List"
          columns={columns}
          data={filtered}
          searchValue={search}
          onSearchChange={setSearch}
          onRowClick={(s) => router.push(`${basePath}/${s.id}`)}
          searchPlaceholder="Search by name, email or phone…"
          pageSize={10}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-4">
              <Users className="h-8 w-8 text-muted-light" />
              <p className="text-sm text-muted">No shippers found.</p>
            </div>
          }
        />
      </div>
    </div>
  );
}

/* ─── Pending Approvals ──────────────────────────────────────────────────── */

function PendingApprovals({ users }: { users: UserProfile[] }) {
  return (
    <Card className="border border-warning/25 bg-warning/5 shadow-sm">
      <CardHeader className="border-b border-warning/15 px-6 py-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-yellow-700">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20">
            <Clock className="h-3.5 w-3.5" />
          </div>
          Pending Approvals
          <span className="ml-1 rounded-full bg-warning/25 px-2 py-0.5 text-xs font-bold tabular-nums text-yellow-800">
            {users.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-warning/10 p-0">
        {users.map((user) => (
          <PendingUserRow key={user.id} user={user} />
        ))}
      </CardContent>
    </Card>
  );
}

function PendingUserRow({ user }: { user: UserProfile }) {
  const approveMut = useApproveUser(user.id);

  async function handle(isApproved: boolean) {
    try {
      await approveMut.mutateAsync(isApproved);
      toast.success(
        isApproved
          ? `${user.fullName ?? user.email} approved`
          : `${user.fullName ?? user.email} rejected`,
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-xs font-bold text-yellow-700">
          {initials(user.fullName, user.email)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.fullName ?? "—"}
          </p>
          <p className="truncate text-xs text-muted">{user.email}</p>
          {user.phone && (
            <p className="flex items-center gap-1 text-xs text-muted">
              <Phone className="h-3 w-3 shrink-0" />
              {user.phone}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={approveMut.isPending}
          onClick={() => handle(false)}
          className="h-8 rounded-lg border-red-200 px-3 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <XCircle className="mr-1 h-3.5 w-3.5" />
          Reject
        </Button>
        <Button
          size="sm"
          disabled={approveMut.isPending}
          onClick={() => handle(true)}
          className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85"
        >
          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
          Approve
        </Button>
      </div>
    </div>
  );
}
