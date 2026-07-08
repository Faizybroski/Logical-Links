"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  X,
  Pencil,
  ArrowLeftRight,
  UserPlus,
  Truck,
  Package,
  DollarSign,
  Tag,
  Weight,
  CheckCircle2,
  Circle,
  XCircle,
  Calendar,
  Lock,
  Unlock,
  FileText,
  Receipt,
  Plus,
  Eye,
  Clock,
  PackageCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/loads/status-badge";
import { CreatorBadge, getCreatorName } from "@/components/loads/creator-badge";
import { getEtaInfo } from "@/components/loads/columns";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { StatusChangeDialog } from "@/components/loads/dialogs/status-change-dialog";
import { AssignDialog } from "@/components/loads/dialogs/assign-dialog";
import { AssignEmployeeDialog } from "@/components/loads/dialogs/assign-employee-dialog";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { formatDate } from "@/lib/utils/format-date";

import {
  useShipment,
  useUpdateShipmentStatus,
  useAssignShipment,
  useAssignEmployee,
} from "@/hooks/use-shipments";
import { useAccounts } from "@/hooks/use-accounts";
import { useEmployees } from "@/hooks/use-company-users";
import { useInvoices } from "@/hooks/use-invoices";
import { useQuotations } from "@/hooks/use-quotations";
import { useTrackingEvents } from "@/hooks/use-tracking";
import { useAuthStore } from "@/store/auth.store";

import type {
  Shipment,
  ShipmentStatus,
  AssignShipmentDto,
  AssignEmployeeDto,
  Invoice,
  Quotation,
  TrackingEvent,
} from "@/types/api.types";

/* ─── Status timeline ──────────────────────────────────────────────────────── */

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

function StatusTimeline({ current }: { current: ShipmentStatus }) {
  const isCancelled = current === "cancelled";
  const currentIdx = STATUS_ORDER[current] ?? -1;
  return (
    <div className="space-y-0">
      {isCancelled && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <XCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs font-semibold text-red-700">
            Shipment cancelled
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
                className={`mt-0.5 text-sm font-medium ${
                  done
                    ? "text-success"
                    : active
                      ? "font-semibold text-primary"
                      : "text-muted-light"
                }`}
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

/* ─── Info tile ────────────────────────────────────────────────────────────── */

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
    <div className="flex items-start gap-3 rounded-xl border border-card-border bg-background p-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

/* ─── Props ─────────────────────────────────────────────────────────────────── */

interface LoadDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  loadId: string;
  onEditClick: (id: string) => void;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function LoadDetailsSheet({
  open,
  onClose,
  loadId,
  onEditClick,
}: LoadDetailsSheetProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isCompanyAdmin = user?.companyRole === "company_admin";
  const docBasePath = pathname.startsWith("/admin") ? "/admin" : "/shipper";

  const [statusOpen, setStatusOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignEmpOpen, setAssignEmpOpen] = useState(false);

  const { data, isLoading } = useShipment(loadId);
  const { data: companiesRes } = useAccounts(
    { limit: 100 },
    { enabled: isAdmin && open },
  );
  const { data: invoicesRes } = useInvoices(
    { loadId: loadId || undefined },
    { enabled: !!loadId && open },
  );
  const { data: quotationsRes } = useQuotations(
    { loadId: loadId || undefined },
    { enabled: !!loadId && open },
  );
  const { data: employeesRes } = useEmployees(
    { limit: 100 },
    { enabled: isCompanyAdmin && !isAdmin && open },
  );
  const { data: trackingRes, refetch: refetchTracking } = useTrackingEvents(
    loadId,
    { limit: 100 },
  );

  const shipment: Shipment | undefined = data?.data as Shipment | undefined;
  const loadInvoices = (invoicesRes?.data ?? []) as Invoice[];
  const loadQuotations = (quotationsRes?.data ?? []) as Quotation[];
  const trackingEvents = (trackingRes?.data ?? []) as TrackingEvent[];
  const companies = companiesRes?.data ?? [];
  const employees = employeesRes?.data ?? [];

  const statusMut = useUpdateShipmentStatus(loadId);
  const assignMut = useAssignShipment(loadId);
  const assignEmpMut = useAssignEmployee(loadId);

  async function handleStatusChange(status: ShipmentStatus, reason?: string) {
    try {
      await statusMut.mutateAsync({ status, reason });
      toast.success("Status updated");
      setStatusOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleAssign(dto: AssignShipmentDto) {
    try {
      await assignMut.mutateAsync(dto);
      toast.success("Company assigned");
      setAssignOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleAssignEmployee(dto: AssignEmployeeDto) {
    try {
      await assignEmpMut.mutateAsync(dto);
      toast.success(
        dto.employeeId ? "Employee assigned" : "Employee unassigned",
      );
      setAssignEmpOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const isShipperOwned = shipment?.created_by_role === "shipper";
  const transferLocked = isShipperOwned || shipment?.status !== "pending";
  const canEdit =
    shipment && !["delivered", "cancelled"].includes(shipment.status);
  const canAssign = isAdmin && !transferLocked;
  const canChangeStatus =
    shipment && (STATUS_TRANSITIONS[shipment.status] ?? []).length > 0;

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex shrink-0 flex-col gap-3 border-b border-card-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="h-6 w-40 animate-pulse rounded bg-card-border sm:w-48" />
            ) : shipment ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="max-w-full truncate text-base font-bold text-foreground sm:text-lg">
                    {shipment.load_number}
                  </h2>

                  <StatusBadge status={shipment.status} />
                  <CreatorBadge shipment={shipment} size="sm" />

                  <span className="text-xs capitalize text-muted">
                    {shipment.shipment_type.replace("_", " ")}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-muted">
                  Created {formatDate(shipment.created_at)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Load not found</p>
            )}
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:ml-4 sm:w-auto sm:flex-nowrap sm:justify-end">
            {shipment && (
              <>
                {isCompanyAdmin && !isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAssignEmpOpen(true)}
                    className="h-8 flex-1 rounded-lg border-card-border px-2 text-xs text-foreground sm:flex-none sm:px-3"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Assign Emp.
                  </Button>
                )}

                {canAssign && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAssignOpen(true)}
                    className="h-8 flex-1 rounded-lg border-card-border px-2 text-xs text-foreground sm:flex-none sm:px-3"
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {shipment.account_id ? "Reassign" : "Assign"}
                  </Button>
                )}

                {canChangeStatus && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatusOpen(true)}
                    className="h-8 flex-1 rounded-lg border-card-border px-2 text-xs text-foreground sm:flex-none sm:px-3"
                  >
                    <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                    Status
                  </Button>
                )}

                {canEdit && (
                  <Button
                    type="button"
                    onClick={() => onEditClick(shipment.shipment_id)}
                    className="h-8 flex-1 rounded-lg bg-primary px-2 text-xs text-sidebar hover:bg-primary/85 sm:flex-none sm:px-3"
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </>
            )}

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 shrink-0 border-card-border"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !shipment ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted">Shipment not found.</p>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* Route strip */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="flex-1 px-6 pt-5 pb-2 sm:py-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                      Origin
                    </p>
                    <p className="mt-1 text-xl font-bold text-foreground">
                      {shipment.origin_city}
                      <span className="ml-1.5 text-base font-medium text-muted">
                        {shipment.origin_state}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {shipment.origin_address}
                    </p>
                    <p className="text-xs text-muted-light">
                      {shipment.origin_postcode}
                    </p>
                  </div>
                  <div className="flex items-center justify-center px-4 py-1 sm:py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-primary/10 text-primary">
                      <Truck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 px-6 pb-5 pt-2 sm:py-5 sm:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                      Destination
                    </p>
                    <p className="mt-1 text-xl font-bold text-foreground">
                      {shipment.destination_city}
                      <span className="ml-1.5 text-base font-medium text-muted">
                        {shipment.destination_state}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {shipment.destination_address}
                    </p>
                    <p className="text-xs text-muted-light">
                      {shipment.destination_postcode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin: Ownership & Assignment */}
              {isAdmin && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-6 py-4">
                    <h2 className="text-sm font-semibold text-foreground">
                      Ownership &amp; Assignment
                    </h2>
                  </div>
                  <div className="sm:grid flex flex-col gap-3 p-5 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl border border-card-border bg-background p-3">
                      <UserAvatar
                        name={getCreatorName(shipment)}
                        avatarUrl={shipment.profiles?.avatar_url}
                        size="lg"
                        rounded="xl"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Created By
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {getCreatorName(shipment)}
                        </p>
                        <div className="mt-1">
                          <CreatorBadge shipment={shipment} size="sm" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-card-border bg-background p-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Created At
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {formatDate(shipment.created_at)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-start gap-3 rounded-xl border p-3 sm:col-span-2 ${
                        transferLocked
                          ? "border-red-200 bg-red-50/60"
                          : "border-green-200 bg-green-50/60"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          transferLocked
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transferLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Transfer
                        </p>
                        <p
                          className={`mt-0.5 text-sm font-semibold ${transferLocked ? "text-red-700" : "text-green-700"}`}
                        >
                          {transferLocked ? "Locked" : "Allowed"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {isShipperOwned
                            ? "Company-owned — permanent"
                            : transferLocked
                              ? "Operational phase started"
                              : "Can be reassigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isShipperOwned && (
                    <div className="flex items-start gap-3 border-t border-violet-200 bg-violet-50/60 px-5 py-3 dark:border-violet-800 dark:bg-violet-950/40">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                      <p className="text-sm text-violet-800 dark:text-violet-300">
                        <span className="font-semibold">
                          Company-Owned Load.
                        </span>{" "}
                        Created by a shipping company and permanently assigned
                        to them.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Info grid + Timeline */}
              <div className="gap-5">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                    <div className="border-b border-card-border px-6 py-4">
                      <h2 className="text-sm font-semibold text-foreground">
                        Shipment Information
                      </h2>
                    </div>
                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                      {isAdmin ? (
                        <InfoTile
                          icon={
                            <CompanyLogo
                              name={shipment.accounts?.account_name}
                              logoUrl={shipment.accounts?.logo_url}
                              size="sm"
                              rounded="lg"
                            />
                          }
                          label={
                            isShipperOwned
                              ? "Shipping Co. (Locked)"
                              : "Shipping Company"
                          }
                          value={
                            isShipperOwned ? (
                              <span className="flex items-center gap-1.5">
                                {shipment.accounts?.account_name ??
                                  "Unassigned"}
                                <Lock className="h-3 w-3 text-violet-500" />
                              </span>
                            ) : (
                              (shipment.accounts?.account_name ?? "Unassigned")
                            )
                          }
                        />
                      ) : null}
                      {shipment.employee?.full_name && (
                        <InfoTile
                          icon={
                            <UserAvatar
                              name={shipment.employee.full_name}
                              avatarUrl={shipment.employee.avatar_url}
                              size="sm"
                              rounded="lg"
                            />
                          }
                          label="Assigned Employee"
                          value={shipment.employee.full_name}
                        />
                      )}
                      <InfoTile
                        icon={<Truck className="h-4 w-4" />}
                        label="Type"
                        value={
                          <span className="capitalize">
                            {shipment.shipment_type.replace("_", " ")}
                          </span>
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
                      {shipment.estimated_pickup_date && (
                        <InfoTile
                          icon={<Calendar className="h-4 w-4" />}
                          label="Estimated Pickup"
                          value={formatDate(shipment.estimated_pickup_date)}
                        />
                      )}
                      {(() => {
                        const eta = getEtaInfo(shipment);
                        if (eta.kind === "none") return null;
                        const tone =
                          eta.kind === "overdue"
                            ? "text-red-600"
                            : eta.kind === "delivered"
                              ? "text-green-700"
                              : "text-foreground";
                        return (
                          <InfoTile
                            icon={
                              eta.kind === "delivered" ? (
                                <PackageCheck className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )
                            }
                            label={
                              eta.kind === "delivered"
                                ? "Delivered"
                                : eta.kind === "overdue"
                                  ? "ETA (Overdue)"
                                  : "Estimated Delivery"
                            }
                            value={<span className={tone}>{formatDate(eta.date)}</span>}
                          />
                        );
                      })()}
                      {shipment.actual_pickup_date && (
                        <InfoTile
                          icon={<Calendar className="h-4 w-4" />}
                          label="Actual Pickup"
                          value={formatDate(shipment.actual_pickup_date)}
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

                  {/* Status timeline */}
                  <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm ">
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
              </div>

              {/* Tracking Timeline */}
              <TrackingTimeline
                loadId={loadId}
                events={trackingEvents}
                canCreate={true}
                canEdit={(event) =>
                  isAdmin || isCompanyAdmin || event.created_by === user?.id
                }
                canDelete={(event) =>
                  isAdmin || isCompanyAdmin || event.created_by === user?.id
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
                      href={`${docBasePath}/quotations?create=true&loadId=${loadId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" /> New Quotation
                    </Link>
                    <Link
                      href={`${docBasePath}/invoices?create=true&loadId=${loadId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-sidebar transition-colors hover:bg-primary/85"
                    >
                      <Plus className="h-3.5 w-3.5" /> New Invoice
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
                    <p className="text-sm italic text-muted">
                      No quotations yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {loadQuotations.map((q: Quotation) => (
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
                              href={`${docBasePath}/quotations?details=${q.id}`}
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
                    <p className="text-sm italic text-muted">
                      No invoices yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {loadInvoices.map((inv: Invoice) => (
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
                              href={`${docBasePath}/invoices?details=${inv.id}`}
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
          )}
        </div>
      </div>

      {/* Dialogs rendered via Radix portals — appear above the sheet */}
      {shipment && statusOpen && (
        <StatusChangeDialog
          shipment={shipment}
          open={statusOpen}
          onClose={() => setStatusOpen(false)}
          onConfirm={handleStatusChange}
          loading={statusMut.isPending}
        />
      )}

      {shipment && isAdmin && assignOpen && (
        <AssignDialog
          shipment={shipment}
          companies={companies}
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          onConfirm={handleAssign}
          loading={assignMut.isPending}
        />
      )}

      {shipment && isCompanyAdmin && !isAdmin && assignEmpOpen && (
        <AssignEmployeeDialog
          shipment={shipment}
          employees={employees}
          open={assignEmpOpen}
          onClose={() => setAssignEmpOpen(false)}
          onConfirm={handleAssignEmployee}
          loading={assignEmpMut.isPending}
        />
      )}
    </Sheet>
  );
}
