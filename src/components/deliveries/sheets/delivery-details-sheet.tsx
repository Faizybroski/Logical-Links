"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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
  FileText,
  Receipt,
  Plus,
  Eye,
  Clock,
  PackageCheck,
  Calculator,
  ClipboardList,
  Gift,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/deliveries/status-badge";
import { getEtaInfo } from "@/components/deliveries/columns";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { StatusChangeDialog } from "@/components/deliveries/dialogs/status-change-dialog";
import { AssignDialog } from "@/components/deliveries/dialogs/assign-dialog";
import { PricingCalculatorDialog } from "@/components/deliveries/dialogs/pricing-calculator-dialog";
import { LAST_MILE_SERVICE_TYPE_LABELS } from "@/components/deliveries/sheets/delivery-form-fields";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { formatDate } from "@/lib/utils/format-date";

const DeliveryMap = dynamic(
  () => import("@/components/tracking/delivery-map").then((m) => m.DeliveryMap),
  { ssr: false },
);

import {
  useDelivery,
  useUpdateDeliveryStatus,
  useAssignEmployees,
} from "@/hooks/use-deliveries";
import { useAdminEmployees } from "@/hooks/use-admin-employees";
import { useInvoices } from "@/hooks/use-invoices";
import { useQuotations } from "@/hooks/use-quotations";
import { useTrackingEvents } from "@/hooks/use-tracking";
import { useAuthStore } from "@/store/auth.store";
import { usePermission } from "@/hooks/use-permission";

import type {
  Delivery,
  DeliveryStatus,
  AssignEmployeesDto,
  Invoice,
  Quotation,
  TrackingEvent,
} from "@/types/api.types";

/* ─── Status timeline ──────────────────────────────────────────────────────── */

const TIMELINE_STEPS: { status: DeliveryStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "assigned", label: "Assigned" },
  { status: "picked_up", label: "Picked Up" },
  { status: "in_transit", label: "In Transit" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const STATUS_ORDER: Record<DeliveryStatus, number> = {
  pending: 0,
  confirmed: 1,
  assigned: 2,
  picked_up: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
  cancelled: -1,
};

const STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "cancelled"],
  in_transit: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

function StatusTimeline({ current }: { current: DeliveryStatus }) {
  const isCancelled = current === "cancelled";
  const currentIdx = STATUS_ORDER[current] ?? -1;
  return (
    <div className="space-y-0">
      {isCancelled && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
          <XCircle className="h-4 w-4 shrink-0 text-red-600" />
          <p className="text-xs font-semibold text-red-700">
            Delivery cancelled
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

interface DeliveryDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  loadId: string;
  onEditClick: (id: string) => void;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function DeliveryDetailsSheet({
  open,
  onClose,
  loadId,
  onEditClick,
}: DeliveryDetailsSheetProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const docBasePath = pathname.startsWith("/admin") ? "/admin" : "/corporate";

  const [statusOpen, setStatusOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [pricingCalcOpen, setPricingCalcOpen] = useState(false);

  const { data, isLoading } = useDelivery(loadId);
  const { data: employeesRes } = useAdminEmployees(
    { limit: 200 },
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
  const { data: trackingRes, refetch: refetchTracking } = useTrackingEvents(
    loadId,
    { limit: 100 },
  );

  const delivery: Delivery | undefined = data?.data as Delivery | undefined;
  const loadInvoices = (invoicesRes?.data ?? []) as Invoice[];
  const loadQuotations = (quotationsRes?.data ?? []) as Quotation[];
  const trackingEvents = (trackingRes?.data ?? []) as TrackingEvent[];
  const employees = employeesRes?.data ?? [];

  // Additional options priced onto the quotation that became this delivery —
  // every line item except the base transportation charge itself (category
  // freight_charge/line_haul). There's no separate home for this on the
  // delivery record, so it's read off the accepted quotation's own priced
  // line items. Excluding by category rather than "everything but the
  // first row" so this stays correct for a manually-authored quotation too,
  // where admin can add items in any order/category, not just the
  // auto-generated instant-quote shape (base charge always first).
  const acceptedQuotation = loadQuotations.find((q) => q.status === "accepted") ?? loadQuotations[0];
  const additionalOptions = (acceptedQuotation?.quotation_items ?? []).filter(
    (i) => i.category !== "freight_charge" && i.category !== "line_haul" && i.description,
  );

  const statusMut = useUpdateDeliveryStatus(loadId);
  const assignMut = useAssignEmployees(loadId);

  async function handleStatusChange(status: string, reason?: string) {
    try {
      await statusMut.mutateAsync({ status, reason });
      toast.success("Status updated");
      setStatusOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleAssign(dto: AssignEmployeesDto) {
    try {
      await assignMut.mutateAsync(dto);
      toast.success("Employees assigned");
      setAssignOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const canEditPerm = usePermission("deliveries.edit");
  const canAssignPerm = usePermission("deliveries.assign");
  const canUpdateStatusPerm = usePermission("deliveries.update_status");

  const transferLocked = delivery?.status !== "pending";
  // Delivery status/history is admin-only — customers (residential and
  // corporate) can view it but never mutate it themselves.
  const canEdit =
    isAdmin && canEditPerm && delivery && !["delivered", "cancelled"].includes(delivery.status);
  const canAssign = isAdmin && canAssignPerm && !transferLocked;
  const canChangeStatus =
    isAdmin && canUpdateStatusPerm &&
    delivery && (STATUS_TRANSITIONS[delivery.status] ?? []).length > 0;

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="shrink-0 items-center justify-between border-b border-card-border px-6 py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
            {isLoading ? (
              <div className="h-6 w-40 animate-pulse rounded bg-card-border" />
            ) : delivery ? (
              <>
                <h2 className="max-w-full text-lg font-bold text-foreground">
                  {delivery.load_number}
                </h2>
                <StatusBadge status={delivery.status} />
                {/* <span className="text-xs capitalize text-muted">
                  {delivery.shipment_type.replace("_", " ")}
                </span> */}
                {/* <span className="text-xs text-muted">
                  · Created {formatDate(delivery.created_at)}
                </span> */}
              </>
            ) : (
              <p className="text-sm text-muted">Delivery not found</p>
            )}
          </div>

          <div className="flex flex-shrink-0 items-center justify-end gap-2">
            {delivery && (
              <>
                {canAssign && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignOpen(true)}
                    className="h-8 gap-1 rounded-lg border-card-border px-2.5 text-xs text-foreground"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{delivery.assignments?.length ? "Reassign" : "Assign"}</span>
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPricingCalcOpen(true)}
                    className="h-8 gap-1 rounded-lg border-card-border px-2.5 text-xs text-foreground"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Calculate Price</span>
                  </Button>
                )}

                {canChangeStatus && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusOpen(true)}
                    className="h-8 gap-1 rounded-lg border-card-border px-2.5 text-xs text-foreground"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Status</span>
                  </Button>
                )}

                {canEdit && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onEditClick(delivery.shipment_id)}
                    className="h-8 gap-1 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
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
          ) : !delivery ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted">Delivery not found.</p>
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
                      {delivery.origin_city}
                      <span className="ml-1.5 text-base font-medium text-muted">
                        {delivery.origin_state}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {delivery.origin_address}
                    </p>
                    <p className="text-xs text-muted-light">
                      {delivery.origin_postcode}
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
                      {delivery.destination_city}
                      <span className="ml-1.5 text-base font-medium text-muted">
                        {delivery.destination_state}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {delivery.destination_address}
                    </p>
                    <p className="text-xs text-muted-light">
                      {delivery.destination_postcode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info grid + Timeline */}
              <div className="gap-5">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                    <div className="border-b border-card-border px-6 py-4">
                      <h2 className="text-sm font-semibold text-foreground">
                        Delivery Information
                      </h2>
                    </div>
                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                      {isAdmin ? (
                        delivery.customer_id ? (
                          <InfoTile
                            icon={
                              <UserAvatar
                                name={delivery.customer?.full_name}
                                avatarUrl={delivery.customer?.avatar_url}
                                size="sm"
                                rounded="lg"
                              />
                            }
                            label="Customer"
                            value={
                              <span className="inline-flex items-center gap-1.5">
                                {delivery.customer?.full_name ?? "Unknown"}
                                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                  Residential
                                </span>
                              </span>
                            }
                          />
                        ) : (
                          <InfoTile
                            icon={
                              <CompanyLogo
                                name={delivery.accounts?.account_name}
                                logoUrl={delivery.accounts?.logo_url}
                                size="sm"
                                rounded="lg"
                              />
                            }
                            label="Customer"
                            value={
                              <span className="inline-flex items-center gap-1.5">
                                {delivery.accounts?.account_name ?? "Unassigned"}
                                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                  Corporate
                                </span>
                              </span>
                            }
                          />
                        )
                      ) : null}
                      {delivery.assignments && delivery.assignments.length > 0 && (
                        <div className="sm:col-span-2">
                          <InfoTile
                            icon={<UserAvatar name={delivery.assignments[0].employee.full_name} avatarUrl={delivery.assignments[0].employee.avatar_url} size="sm" rounded="lg" />}
                            label="Assigned To"
                            value={
                              <span className="flex flex-wrap items-center gap-1.5">
                                {delivery.assignments.map((a) => (
                                  <span key={a.employee_id} className="inline-flex items-center gap-1 rounded-full bg-primary/5 py-0.5 pl-0.5 pr-2 text-xs">
                                    <UserAvatar name={a.employee.full_name} avatarUrl={a.employee.avatar_url} size="xs" rounded="full" />
                                    {a.employee.full_name ?? "Unnamed"}
                                  </span>
                                ))}
                              </span>
                            }
                          />
                        </div>
                      )}
                      {delivery.service_type && (
                        <InfoTile
                          icon={<Truck className="h-4 w-4" />}
                          label="Service Type"
                          value={LAST_MILE_SERVICE_TYPE_LABELS[delivery.service_type] ?? delivery.service_type}
                        />
                      )}
                      {delivery.service_level && (
                        <InfoTile
                          icon={<ClipboardList className="h-4 w-4" />}
                          label="Service Level"
                          value={delivery.service_level}
                        />
                      )}
                      {delivery.cargo_description && (
                        <div className="sm:col-span-2">
                          <InfoTile
                            icon={<Package className="h-4 w-4" />}
                            label="Delivery Description"
                            value={delivery.cargo_description}
                          />
                        </div>
                      )}
                      {delivery.weight_kg != null && (
                        <InfoTile
                          icon={<Weight className="h-4 w-4" />}
                          label="Weight"
                          value={`${delivery.weight_kg.toLocaleString()} kg`}
                        />
                      )}
                      {delivery.pieces != null && (
                        <InfoTile
                          icon={<Package className="h-4 w-4" />}
                          label="Number of Packages"
                          value={delivery.pieces.toLocaleString()}
                        />
                      )}
                      {delivery.package_type && (
                        <InfoTile
                          icon={<Package className="h-4 w-4" />}
                          label="Package Type"
                          value={delivery.package_type}
                        />
                      )}
                      {delivery.preferred_delivery_date && (
                        <InfoTile
                          icon={<Calendar className="h-4 w-4" />}
                          label="Preferred Delivery Date"
                          value={formatDate(delivery.preferred_delivery_date)}
                        />
                      )}
                      {delivery.special_instructions && (
                        <div className="sm:col-span-2">
                          <InfoTile
                            icon={<ClipboardList className="h-4 w-4" />}
                            label="Special Instructions"
                            value={delivery.special_instructions}
                          />
                        </div>
                      )}
                      {additionalOptions.length > 0 && (
                        <div className="sm:col-span-2">
                          <InfoTile
                            icon={<Gift className="h-4 w-4" />}
                            label="Additional Options"
                            value={additionalOptions.map((i) => i.description).join(", ")}
                          />
                        </div>
                      )}
                      {delivery.quoted_price != null && (
                        <InfoTile
                          icon={<DollarSign className="h-4 w-4" />}
                          label="Quoted Price"
                          value={`${delivery.currency} ${delivery.quoted_price.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`}
                        />
                      )}
                      {delivery.reference_number && (
                        <InfoTile
                          icon={<Tag className="h-4 w-4" />}
                          label="Confirmation Number"
                          value={delivery.reference_number}
                        />
                      )}
                      {delivery.estimated_pickup_date && (
                        <InfoTile
                          icon={<Calendar className="h-4 w-4" />}
                          label="Estimated Pickup"
                          value={formatDate(delivery.estimated_pickup_date)}
                        />
                      )}
                      {(() => {
                        const eta = getEtaInfo(delivery);
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
                      {delivery.actual_pickup_date && (
                        <InfoTile
                          icon={<Calendar className="h-4 w-4" />}
                          label="Actual Pickup"
                          value={formatDate(delivery.actual_pickup_date)}
                        />
                      )}
                      <InfoTile
                        icon={<Calendar className="h-4 w-4" />}
                        label="Created"
                        value={formatDate(delivery.created_at)}
                      />
                    </div>
                  </div>

                  {delivery.cargo_description && (
                    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                      <div className="border-b border-card-border px-6 py-4">
                        <h2 className="text-sm font-semibold text-foreground">
                          Delivery Details
                        </h2>
                      </div>
                      <div className="px-6 py-5">
                        <p className="text-sm leading-relaxed text-foreground">
                          {delivery.cargo_description}
                        </p>
                      </div>
                    </div>
                  )}

                  {delivery.special_instructions && (
                    <div className="overflow-hidden rounded-2xl border border-warning/25 bg-warning/5 shadow-sm">
                      <div className="border-b border-warning/20 px-6 py-4">
                        <h2 className="text-sm font-semibold text-yellow-700">
                          Special Instructions
                        </h2>
                      </div>
                      <div className="px-6 py-5">
                        <p className="text-sm leading-relaxed text-foreground">
                          {delivery.special_instructions}
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
                      <StatusTimeline current={delivery.status} />
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

              {/* Live Location (Mapbox) */}
              <DeliveryMap event={trackingEvents[0] ?? null} />

              {/* Tracking Timeline — Logical Links staff only; customers read-only */}
              <TrackingTimeline
                loadId={loadId}
                events={trackingEvents}
                canCreate={isAdmin}
                canEdit={() => isAdmin}
                canDelete={() => isAdmin}
                onRefresh={() => refetchTracking()}
              />

              {/* Financial Documents */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-6 py-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    Financial Documents
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    {isAdmin && (
                      <>
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
                      </>
                    )}
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
                              {new Intl.NumberFormat("en-CA", {
                                style: "currency",
                                currency: q.currency ?? "CAD",
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
                                {new Intl.NumberFormat("en-CA", {
                                  style: "currency",
                                  currency: inv.currency ?? "CAD",
                                }).format(inv.total ?? 0)}
                              </p>
                              {inv.balance_due > 0 && (
                                <p className="text-xs text-danger tabular-nums">
                                  Due{" "}
                                  {new Intl.NumberFormat("en-CA", {
                                    style: "currency",
                                    currency: inv.currency ?? "CAD",
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
      {delivery && statusOpen && (
        <StatusChangeDialog
          delivery={delivery}
          open={statusOpen}
          onClose={() => setStatusOpen(false)}
          onConfirm={handleStatusChange}
          loading={statusMut.isPending}
        />
      )}

      {delivery && isAdmin && assignOpen && (
        <AssignDialog
          delivery={delivery}
          employees={employees}
          open={assignOpen}
          onClose={() => setAssignOpen(false)}
          onConfirm={handleAssign}
          loading={assignMut.isPending}
        />
      )}

      {delivery && isAdmin && (
        <PricingCalculatorDialog
          open={pricingCalcOpen}
          onClose={() => setPricingCalcOpen(false)}
          initialServiceType={delivery.service_type}
          pickupAddress={delivery.origin_address}
          deliveryAddress={delivery.destination_address}
        />
      )}
    </Sheet>
  );
}
