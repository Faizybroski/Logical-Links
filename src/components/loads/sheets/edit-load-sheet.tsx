"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  X,
  Truck,
  Calendar,
  Lock,
  User,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DeleteConfirmDialog } from "@/components/loads/dialogs/delete-confirmation-dialog";
import { CreatorBadge, getCreatorName } from "@/components/loads/creator-badge";
import { StatusBadge } from "@/components/loads/status-badge";
import { formatDate, isoToDateInputValue, dateInputValueToIso } from "@/lib/utils/format-date";

import { loadSchema, type LoadFormValues } from "@/lib/validations/load";
import { useShipment, useUpdateShipment, useDeleteShipment } from "@/hooks/use-shipments";
import { useAuthStore } from "@/store/auth.store";

import { FormSection, LoadLocationFields, LoadCargoFields, LoadScheduleFields, F } from "./load-form-fields";

interface EditLoadSheetProps {
  open: boolean;
  onClose: () => void;
  loadId: string;
}

export function EditLoadSheet({ open, onClose, loadId }: EditLoadSheetProps) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useShipment(loadId);
  const shipment = data?.data;

  const updateMut = useUpdateShipment(loadId);
  const deleteMut = useDeleteShipment();

  const form = useForm<LoadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loadSchema) as any,
    defaultValues: {
      shipmentType:        "freight",
      originAddress:       "",
      originCity:          "",
      originState:         "",
      originPostcode:      "",
      destinationAddress:  "",
      destinationCity:     "",
      destinationState:    "",
      destinationPostcode: "",
      cargoDescription:    "",
      weightKg:            undefined,
      pieces:              undefined,
      estimatedPickupDate:   "",
      estimatedDeliveryDate: "",
      quotedPrice:         undefined,
      referenceNumber:     "",
      specialInstructions: "",
    },
  });

  useEffect(() => {
    if (shipment) {
      form.reset({
        shipmentType:        (shipment.shipment_type as "freight" | "last_mile") ?? "freight",
        originAddress:       shipment.origin_address       ?? "",
        originCity:          shipment.origin_city          ?? "",
        originState:         shipment.origin_state         ?? "",
        originPostcode:      shipment.origin_postcode      ?? "",
        destinationAddress:  shipment.destination_address  ?? "",
        destinationCity:     shipment.destination_city     ?? "",
        destinationState:    shipment.destination_state    ?? "",
        destinationPostcode: shipment.destination_postcode ?? "",
        cargoDescription:    shipment.cargo_description    ?? "",
        weightKg:            shipment.weight_kg            ?? undefined,
        pieces:              shipment.pieces               ?? undefined,
        estimatedPickupDate:   isoToDateInputValue(shipment.estimated_pickup_date),
        estimatedDeliveryDate: isoToDateInputValue(shipment.estimated_delivery_date),
        quotedPrice:         shipment.quoted_price         ?? undefined,
        referenceNumber:     shipment.reference_number     ?? "",
        specialInstructions: shipment.special_instructions ?? "",
      });
    }
  }, [shipment]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: LoadFormValues) {
    try {
      await updateMut.mutateAsync({
        originAddress:       values.originAddress,
        originCity:          values.originCity,
        originState:         values.originState,
        originPostcode:      values.originPostcode,
        destinationAddress:  values.destinationAddress,
        destinationCity:     values.destinationCity,
        destinationState:    values.destinationState,
        destinationPostcode: values.destinationPostcode,
        cargoDescription:    values.cargoDescription,
        weightKg:            values.weightKg,
        pieces:              values.pieces,
        estimatedPickupDate:   dateInputValueToIso(values.estimatedPickupDate),
        estimatedDeliveryDate: dateInputValueToIso(values.estimatedDeliveryDate),
        ...(isAdmin && { quotedPrice: values.quotedPrice }),
        referenceNumber:     values.referenceNumber,
        specialInstructions: values.specialInstructions,
      });
      toast.success("Load updated");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleDelete(reason: string) {
    if (!shipment) return;
    try {
      await deleteMut.mutateAsync({ id: shipment.shipment_id, reason });
      toast.success(`Load ${shipment.load_number} deleted`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const saving         = updateMut.isPending;
  const isShipperOwned = shipment?.created_by_role === "shipper";
  const canDelete      = isAdmin && shipment && ["pending", "confirmed"].includes(shipment.status);

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {shipment ? `Edit ${shipment.load_number}` : "Edit Load"}
                </h2>
                {shipment && <StatusBadge status={shipment.status} />}
              </div>
              {shipment && (
                <p className="mt-0.5 text-xs text-muted capitalize">
                  {shipment.shipment_type.replace("_", " ")} shipment
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onClose}
              disabled={saving}
              className="h-8 w-8 border-card-border"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable content */}
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
              <div className="space-y-4 p-6">
                {/* Ownership card (admin view) */}
                {isAdmin && (
                  <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-card-border bg-background/50 px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">Ownership &amp; Assignment</h3>
                        <p className="mt-0.5 text-xs text-muted">
                          {isShipperOwned ? "Company-owned — locked" : "Admin-managed"}
                        </p>
                      </div>
                      <CreatorBadge shipment={shipment} />
                    </div>
                    <div className="grid gap-3 p-5 sm:grid-cols-3">
                      <div className="flex items-start gap-2 rounded-xl border border-card-border bg-background p-3">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Created By</p>
                          <p className="mt-0.5 truncate text-sm font-medium text-foreground">{getCreatorName(shipment)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl border border-card-border bg-background p-3">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Created At</p>
                          <p className="mt-0.5 text-sm font-medium text-foreground">{formatDate(shipment.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl border border-card-border bg-background p-3">
                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Assigned Company</p>
                          <p className="mt-0.5 text-sm font-medium text-foreground">
                            {shipment.accounts?.account_name ?? "Unassigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isShipperOwned && (
                      <div className="flex items-start gap-3 border-t border-violet-200 bg-violet-50/60 px-5 py-3 dark:border-violet-800 dark:bg-violet-950/40">
                        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                        <p className="text-xs text-violet-800 dark:text-violet-300">
                          Company-owned load — assignment cannot be changed by anyone.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Shipment type + reference (read-only type) */}
                <FormSection
                  title="Shipment Details"
                  description="Type and reference information"
                  icon={<Truck className="h-4 w-4" />}
                >
                  <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Reference No.</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="REF-001" className={F} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </FormSection>

                {/* Location */}
                <LoadLocationFields form={form} />

                {/* Cargo */}
                <LoadCargoFields form={form} showQuotedPrice={isAdmin} />

                {/* Schedule */}
                <LoadScheduleFields form={form} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-card-border px-6 py-4 flex-shrink-0">
            <div>
              {canDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteOpen(true)}
                  className="h-9 rounded-lg border-red-200 px-3 text-xs text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="h-9 rounded-lg border-card-border text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !shipment}
                className="h-9 rounded-lg bg-primary px-6 text-sm text-sidebar hover:bg-primary/85"
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {shipment && (
        <DeleteConfirmDialog
          shipment={shipment}
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={deleteMut.isPending}
        />
      )}
    </Sheet>
  );
}
