"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  ArrowLeftRight,
  Truck,
  Package,
  DollarSign,
  Tag,
  Weight,
  ChevronRight,
  CheckCircle2,
  Circle,
  XCircle,
  Calendar,
  FileText,
  Receipt,
  Plus,
  Eye,
  UserPlus,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/loads/status-badge";
import { CreatorBadge, getCreatorName } from "@/components/loads/creator-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatusChangeDialog } from "@/components/loads/dialogs/status-change-dialog";
import { AssignEmployeeDialog } from "@/components/loads/dialogs/assign-employee-dialog";

import { useShipment, useUpdateShipmentStatus, useAssignEmployee } from "@/hooks/use-shipments";
import { useEmployees } from "@/hooks/use-company-users";
import { useInvoices } from "@/hooks/use-invoices";
import { useQuotations } from "@/hooks/use-quotations";
import { useTrackingEvents } from "@/hooks/use-tracking";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { useAuthStore } from "@/store/auth.store";
import { formatDate } from "@/lib/utils/format-date";
import type {
  Shipment,
  ShipmentStatus,
  Invoice,
  Quotation,
  AssignEmployeeDto,
  TrackingEvent,
} from "@/types/api.types";

/* ─── Status timeline (same as admin) ───────────────────────────────────── */

const TIMELINE_STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "assigned", label: "Assigned" },
  { status: "picked_up", label: "Picked Up" },
  { status: "in_transit", label: "In Transit" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const STATUS_ORDER: Record<ShipmentStatus, number> = {
  pending: 0,
  confirmed: 1,
  assigned: 2,
  picked_up: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
  cancelled: -1,
};

function StatusTimeline({ current }: { current: ShipmentStatus }) {
  const isCancelled = current === "cancelled";
  const currentIdx = STATUS_ORDER[current] ?? -1;

  return (
    <div className="space-y-0">
      {isCancelled && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <XCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-sm font-semibold text-red-700">
            This shipment was cancelled
          </p>
        </div>
      )}
      {TIMELINE_STEPS.map((step, idx) => {
        const done = !isCancelled && currentIdx > idx;
        const active = !isCancelled && currentIdx === idx;
        const isLast = idx === TIMELINE_STEPS.length - 1;
        return (
          <div key={step.status} className="flex items-stretch gap-3">
            <div className="flex w-5 flex-col items-center">
              <div className="mt-1 shrink-0">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : active ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-light" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`mt-1 w-px flex-1 ${done ? "bg-success/40" : "bg-card-border"}`}
                />
              )}
            </div>
            <div className="pb-4">
              <p
                className={`mt-0.5 text-sm font-medium ${done ? "text-success" : active ? "font-semibold text-primary" : "text-muted-light"}`}
              >
                {step.label}
              </p>
              {active && (
                <p className="mt-0.5 text-xs text-muted">Current status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-card-border bg-background p-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ShipperLoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const isCompanyAdmin = user?.companyRole === "company_admin";

  const [statusOpen, setStatusOpen]         = useState(false);
  const [assignEmpOpen, setAssignEmpOpen]   = useState(false);

  const { data, isLoading }       = useShipment(id);
  const { data: invoicesRes }     = useInvoices({ loadId: id });
  const { data: quotationsRes }   = useQuotations({ loadId: id });
  const { data: employeesRes }    = useEmployees({ limit: 100 }, { enabled: isCompanyAdmin });
  const { data: trackingRes, refetch: refetchTracking } = useTrackingEvents(id, { limit: 100 });
  const shipment: Shipment | undefined = data?.data as Shipment | undefined;
  const loadInvoices    = (invoicesRes?.data   ?? []) as Invoice[];
  const loadQuotations  = (quotationsRes?.data ?? []) as Quotation[];
  const trackingEvents  = (trackingRes?.data   ?? []) as TrackingEvent[];
  const employees       = employeesRes?.data ?? [];

  const statusMut      = useUpdateShipmentStatus(id);
  const assignEmpMut   = useAssignEmployee(id);

  async function handleStatusChange(status: ShipmentStatus, reason?: string) {
    try {
      await statusMut.mutateAsync({ status, reason });
      toast.success("Status updated");
      setStatusOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleAssignEmployee(dto: AssignEmployeeDto) {
    try {
      await assignEmpMut.mutateAsync(dto);
      toast.success(dto.employeeId ? "Employee assigned" : "Employee unassigned");
      setAssignEmpOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted">Shipment not found.</p>
        <Link href="/shipper/loads" className="text-sm text-primary underline">
          Back to loads
        </Link>
      </div>
    );
  }

  const canEdit = !["delivered", "cancelled"].includes(shipment.status);
  const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["assigned", "cancelled"],
    assigned: ["picked_up", "cancelled"],
    picked_up: ["in_transit", "cancelled"],
    in_transit: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };
  const canChangeStatus =
    (STATUS_TRANSITIONS[shipment.status] ?? []).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
            <Link
              href="/shipper/loads"
              className="hover:text-foreground transition-colors"
            >
              Loads
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{shipment.load_number}</span>
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/shipper/loads"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold text-foreground">
                    {shipment.load_number}
                  </h1>
                  <StatusBadge status={shipment.status} />
                  <span className="text-xs text-muted capitalize">
                    {shipment.shipment_type.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Created {formatDate(shipment.created_at)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isCompanyAdmin && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignEmpOpen(true)}
                  className="h-8 rounded-lg border-card-border px-3 text-xs text-foreground"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Assign Employee
                </Button>
              )}
              {canChangeStatus && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStatusOpen(true)}
                  className="h-8 rounded-lg border-card-border px-3 text-xs text-foreground"
                >
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                  Change Status
                </Button>
              )}
              {canEdit && (
                <Button
                  asChild
                  type="button"
                  className="h-8 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85"
                >
                  <Link href={`/shipper/loads/${id}/edit`}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-2 py-8 space-y-6">
        {/* Route strip */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
          <div className="flex flex-col items-stretch sm:flex-row sm:items-center">
            <div className="flex-1 px-8 py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                Origin
              </p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">
                {shipment.origin_city}
                <span className="ml-1.5 text-base font-medium text-muted">
                  {shipment.origin_state}
                </span>
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {shipment.origin_address}
              </p>
            </div>
            <div className="flex items-center justify-center px-4 py-3 sm:py-6">
              <div className="flex items-center gap-2">
                <div className="hidden h-px w-10 bg-card-border sm:block" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border bg-primary/10 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="hidden h-px w-10 bg-card-border sm:block" />
              </div>
            </div>
            <div className="flex-1 px-8 py-6 sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                Destination
              </p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">
                {shipment.destination_city}
                <span className="ml-1.5 text-base font-medium text-muted">
                  {shipment.destination_state}
                </span>
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {shipment.destination_address}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
              <div className="border-b border-card-border px-6 py-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Shipment Information
                </h2>
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-2">
                <InfoTile
                  icon={<Truck className="h-4 w-4" />}
                  label="Type"
                  value={
                    <span className="capitalize">
                      {shipment.shipment_type.replace("_", " ")}
                    </span>
                  }
                />
                <InfoTile
                  icon={
                    <UserAvatar
                      name={getCreatorName(shipment)}
                      avatarUrl={shipment.profiles?.avatar_url}
                      size="sm"
                      rounded="lg"
                    />
                  }
                  label="Created By"
                  value={
                    <span className="flex flex-wrap items-center gap-1.5">
                      {getCreatorName(shipment)}
                      <CreatorBadge shipment={shipment} size="sm" />
                    </span>
                  }
                />
                <InfoTile
                  icon={
                    <UserAvatar
                      name={shipment.employee?.full_name}
                      avatarUrl={shipment.employee?.avatar_url}
                      size="sm"
                      rounded="lg"
                    />
                  }
                  label="Assigned Employee"
                  value={
                    shipment.employee?.full_name ?? (
                      <span className="italic text-muted-light">Unassigned</span>
                    )
                  }
                />
                {shipment.weight_kg != null && (
                  <InfoTile
                    icon={<Weight className="h-4 w-4" />}
                    label="Weight"
                    value={`${shipment.weight_kg.toLocaleString()} kg`}
                  />
                )}
                {shipment.pieces != null && (
                  <InfoTile
                    icon={<Package className="h-4 w-4" />}
                    label="Pieces"
                    value={shipment.pieces.toLocaleString()}
                  />
                )}
                {shipment.quoted_price != null && (
                  <InfoTile
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Quoted Price"
                    value={`${shipment.currency} ${shipment.quoted_price.toLocaleString("en-AU", { minimumFractionDigits: 2 })}`}
                  />
                )}
                {shipment.reference_number && (
                  <InfoTile
                    icon={<Tag className="h-4 w-4" />}
                    label="Reference"
                    value={shipment.reference_number}
                  />
                )}
                <InfoTile
                  icon={<Calendar className="h-4 w-4" />}
                  label="Created"
                  value={formatDate(shipment.created_at)}
                />
              </div>
            </div>
            {shipment.cargo_description && (
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-6 py-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    Cargo Description
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm leading-relaxed text-foreground">
                    {shipment.cargo_description}
                  </p>
                </div>
              </div>
            )}
            {shipment.special_instructions && (
              <div className="overflow-hidden rounded-2xl border border-warning/25 bg-warning/5 shadow-sm">
                <div className="border-b border-warning/20 px-6 py-4">
                  <h2 className="text-sm font-semibold text-yellow-700">
                    Special Instructions
                  </h2>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm leading-relaxed text-foreground">
                    {shipment.special_instructions}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm lg:self-start">
            <div className="border-b border-card-border px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Status Timeline
              </h2>
            </div>
            <div className="px-6 py-5">
              <StatusTimeline current={shipment.status} />
            </div>
            {canChangeStatus && (
              <div className="border-t border-card-border px-6 py-4">
                <Button
                  type="button"
                  onClick={() => setStatusOpen(true)}
                  className="w-full rounded-lg bg-primary text-xs text-sidebar hover:bg-primary/85"
                >
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                  Advance Status
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        <TrackingTimeline
          loadId={id}
          events={trackingEvents}
          canCreate={true}
          canEdit={(event) =>
            isCompanyAdmin || event.created_by === user?.id
          }
          canDelete={(event) =>
            isCompanyAdmin || event.created_by === user?.id
          }
          onRefresh={() => refetchTracking()}
        />

        {/* Financial Documents */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Financial Documents
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/shipper/quotations/create?loadId=${id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                New Quotation
              </Link>
              <Link
                href={`/shipper/invoices/create?loadId=${id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-sidebar transition-colors hover:bg-primary/85"
              >
                <Plus className="h-3.5 w-3.5" />
                New Invoice
              </Link>
            </div>
          </div>

          {/* Quotations */}
          <div className="border-b border-card-border px-6 py-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Quotations ({loadQuotations.length})
              </h3>
            </div>
            {loadQuotations.length === 0 ? (
              <p className="text-sm text-muted italic">No quotations yet.</p>
            ) : (
              <div className="space-y-2">
                {loadQuotations.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-xl border border-card-border bg-background px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {q.quotation_number}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(q.issue_date)} ·{" "}
                        <span className="capitalize">
                          {q.status.replace("_", " ")}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {new Intl.NumberFormat("en-AU", {
                          style: "currency",
                          currency: q.currency ?? "AUD",
                        }).format(q.total ?? 0)}
                      </p>
                      <Link
                        href={`/shipper/quotations/${q.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border bg-card text-muted transition-colors hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="px-6 py-4">
            <div className="mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Invoices ({loadInvoices.length})
              </h3>
            </div>
            {loadInvoices.length === 0 ? (
              <p className="text-sm text-muted italic">No invoices yet.</p>
            ) : (
              <div className="space-y-2">
                {loadInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl border border-card-border bg-background px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {inv.invoice_number}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDate(inv.issue_date)} ·{" "}
                        <span className="capitalize">
                          {inv.status.replace("_", " ")}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {new Intl.NumberFormat("en-AU", {
                            style: "currency",
                            currency: inv.currency ?? "AUD",
                          }).format(inv.total ?? 0)}
                        </p>
                        {inv.balance_due > 0 && (
                          <p className="text-xs text-danger tabular-nums">
                            Due{" "}
                            {new Intl.NumberFormat("en-AU", {
                              style: "currency",
                              currency: inv.currency ?? "AUD",
                            }).format(inv.balance_due)}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/shipper/invoices/${inv.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border bg-card text-muted transition-colors hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {statusOpen && (
        <StatusChangeDialog
          shipment={shipment}
          open={statusOpen}
          onClose={() => setStatusOpen(false)}
          onConfirm={handleStatusChange}
          loading={statusMut.isPending}
        />
      )}

      {assignEmpOpen && isCompanyAdmin && (
        <AssignEmployeeDialog
          shipment={shipment}
          employees={employees}
          open={assignEmpOpen}
          onClose={() => setAssignEmpOpen(false)}
          onConfirm={handleAssignEmployee}
          loading={assignEmpMut.isPending}
        />
      )}
    </div>
  );
}
