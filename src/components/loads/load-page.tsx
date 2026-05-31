"use client";

import { useMemo, useState } from "react";
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

import { useAuthStore } from "@/store/auth.store";
import {
  useShipments,
  useDeleteShipment,
  useUpdateShipmentStatus,
  useAssignShipment,
} from "@/hooks/use-shipments";
import { useUsers } from "@/hooks/use-users";
import type { Shipment, ShipmentStatus, AssignShipmentDto } from "@/types/api.types";

export default function LoadsPage() {
  const router  = useRouter();
  const pathname = usePathname();
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  // Base path for URL-modal navigation — derive from the current URL segment
  const basePath = pathname.startsWith("/admin") ? "/admin/loads" : "/shipper/loads";

  // ── Local dialog state (only for quick-action dialogs without deep-link need) ──
  const [deletingLoad, setDeletingLoad] = useState<Shipment | null>(null);
  const [statusLoad,   setStatusLoad]   = useState<Shipment | null>(null);
  const [assigningLoad, setAssigningLoad] = useState<Shipment | null>(null);
  const [search, setSearch] = useState("");

  // ── Data ─────────────────────────────────────────────────────────────────────
  const query = isAdmin ? {} : { accountId: user?.accountId ?? undefined };

  const { data: shipmentsRes, isLoading } = useShipments(query);
  const { data: shippersRes }             = useUsers(
    { role: "shipper", limit: 100 },
    { enabled: isAdmin },
  );

  const shipments = shipmentsRes?.data ?? [];
  const shippers  = shippersRes?.data  ?? [];

  // ── Mutations (only for local-state dialogs) ──────────────────────────────────
  const deleteMut = useDeleteShipment();
  const statusMut = useUpdateShipmentStatus(statusLoad?.shipment_id ?? "");
  const assignMut = useAssignShipment(assigningLoad?.shipment_id ?? "");

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shipments;
    return shipments.filter((s) =>
      s.load_number.toLowerCase().includes(q) ||
      s.origin_city.toLowerCase().includes(q) ||
      s.destination_city.toLowerCase().includes(q) ||
      (s.accounts?.account_name ?? "").toLowerCase().includes(q) ||
      (s.reference_number ?? "").toLowerCase().includes(q),
    );
  }, [shipments, search]);

  // ── KPIs ─────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      shipments.length,
    transit:    shipments.filter((s) => s.status === "in_transit").length,
    delivered:  shipments.filter((s) => s.status === "delivered").length,
    exceptions: shipments.filter((s) => s.status === "cancelled").length,
  }), [shipments]);

  // ── Permissions ──────────────────────────────────────────────────────────────
  const canEdit   = (s: Shipment) => !["delivered", "cancelled"].includes(s.status);
  const canDelete = (s: Shipment) => isAdmin && ["pending", "confirmed"].includes(s.status);
  const canAssign = (s: Shipment) => isAdmin && s.status === "confirmed";

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getLoadColumns({
        isAdmin,
        canEdit,
        canDelete,
        canAssign,
        onEdit:         (s) => router.push(`${basePath}/${s.shipment_id}/edit`),
        onDelete:       (s) => setDeletingLoad(s),
        onAssign:       (s) => setAssigningLoad(s),
        onStatusChange: (s) => setStatusLoad(s),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, basePath],
  );

  // ── Handlers (local-state dialogs only) ──────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
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
            onClick={() => router.push(`${basePath}/create`)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-sidebar hover:bg-primary/85"
          >
            <Plus className="h-4 w-4" />
            Create Load
          </Button>
        </div>

        {/* Role badge */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            isAdmin
              ? "border-info/20 bg-info/5 text-blue-700"
              : "border-warning/20 bg-warning/5 text-yellow-700"
          }`}
        >
          {isAdmin
            ? <ShieldAlert className="h-4 w-4 shrink-0" />
            : <User className="h-4 w-4 shrink-0" />}
          <span className="font-medium">
            {isAdmin
              ? "Viewing as Admin — full access to all loads"
              : "Viewing as Shipper — your assigned shipments"}
          </span>
        </div>

        {/* KPI cards */}
        <KpiGrid stats={stats} />

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable<Shipment>
            title="Loads Management"
            columns={columns}
            data={filtered}
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search loads…"
            onRowClick={(s) => router.push(`${basePath}/${s.shipment_id}`)}
            pageSize={10}
            emptyState={<span className="text-muted">No loads found.</span>}
          />
        )}
      </div>

      {/* Delete */}
      {deletingLoad && (
        <DeleteConfirmDialog
          shipment={deletingLoad}
          open={!!deletingLoad}
          onClose={() => setDeletingLoad(null)}
          onConfirm={handleDelete}
          loading={deleteMut.isPending}
        />
      )}

      {/* Status change */}
      {statusLoad && (
        <StatusChangeDialog
          shipment={statusLoad}
          open={!!statusLoad}
          onClose={() => setStatusLoad(null)}
          onConfirm={handleStatusChange}
          loading={statusMut.isPending}
        />
      )}

      {/* Assign to shipper */}
      {assigningLoad && (
        <AssignDialog
          shipment={assigningLoad}
          shippers={shippers}
          open={!!assigningLoad}
          onClose={() => setAssigningLoad(null)}
          onConfirm={handleAssign}
          loading={assignMut.isPending}
        />
      )}
    </div>
  );
}
