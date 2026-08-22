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
import { DeleteConfirmDialog } from "@/components/deliveries/dialogs/delete-confirmation-dialog";
import { StatusBadge } from "@/components/deliveries/status-badge";
import { formatDate, isoToDateInputValue, dateInputValueToIso } from "@/lib/utils/format-date";

import { loadSchema, type DeliveryFormValues } from "@/lib/validations/delivery";
import { useDelivery, useUpdateDelivery, useDeleteDelivery } from "@/hooks/use-deliveries";
import { useAuthStore } from "@/store/auth.store";

import { FormSection, DeliveryLocationFields, DeliveryCargoFields, DeliveryScheduleFields, F } from "./delivery-form-fields";

interface EditDeliverySheetProps {
  open: boolean;
  onClose: () => void;
  loadId: string;
}

export function EditDeliverySheet({ open, onClose, loadId }: EditDeliverySheetProps) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useDelivery(loadId);
  const delivery = data?.data;

  const updateMut = useUpdateDelivery(loadId);
  const deleteMut = useDeleteDelivery();

  const form = useForm<DeliveryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loadSchema) as any,
    defaultValues: {
      deliveryType:        "freight",
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
      packageType:         undefined,
      preferredDeliveryDate: "",
    },
  });

  useEffect(() => {
    if (delivery) {
      form.reset({
        deliveryType:        (delivery.shipment_type as "freight" | "last_mile") ?? "freight",
        originAddress:       delivery.origin_address       ?? "",
        originCity:          delivery.origin_city          ?? "",
        originState:         delivery.origin_state         ?? "",
        originPostcode:      delivery.origin_postcode      ?? "",
        destinationAddress:  delivery.destination_address  ?? "",
        destinationCity:     delivery.destination_city     ?? "",
        destinationState:    delivery.destination_state    ?? "",
        destinationPostcode: delivery.destination_postcode ?? "",
        cargoDescription:    delivery.cargo_description    ?? "",
        weightKg:            delivery.weight_kg            ?? undefined,
        pieces:              delivery.pieces               ?? undefined,
        estimatedPickupDate:   isoToDateInputValue(delivery.estimated_pickup_date),
        estimatedDeliveryDate: isoToDateInputValue(delivery.estimated_delivery_date),
        quotedPrice:         delivery.quoted_price         ?? undefined,
        referenceNumber:     delivery.reference_number     ?? "",
        specialInstructions: delivery.special_instructions ?? "",
        packageType:         delivery.package_type          ?? undefined,
        preferredDeliveryDate: isoToDateInputValue(delivery.preferred_delivery_date),
      });
    }
  }, [delivery]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: DeliveryFormValues) {
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
        packageType:         values.packageType,
        preferredDeliveryDate: dateInputValueToIso(values.preferredDeliveryDate),
      });
      toast.success("Delivery updated");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleDelete(reason: string) {
    if (!delivery) return;
    try {
      await deleteMut.mutateAsync({ id: delivery.shipment_id, reason });
      toast.success(`Delivery ${delivery.load_number} deleted`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const saving    = updateMut.isPending;
  const canDelete = isAdmin && delivery && ["pending", "confirmed"].includes(delivery.status);

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {delivery ? `Edit ${delivery.load_number}` : "Edit Delivery"}
                </h2>
                {delivery && <StatusBadge status={delivery.status} />}
              </div>
              {delivery && (
                <p className="mt-0.5 text-xs text-muted capitalize">
                  {delivery.shipment_type.replace("_", " ")} delivery
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
            ) : !delivery ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-muted">Delivery not found.</p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {/* Assignment card (admin view) */}
                {isAdmin && (
                  <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-card-border bg-background/50 px-5 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">Assignment</h3>
                      </div>
                    </div>
                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                      <div className="flex items-start gap-2 rounded-xl border border-card-border bg-background p-3">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Created At</p>
                          <p className="mt-0.5 text-sm font-medium text-foreground">{formatDate(delivery.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl border border-card-border bg-background p-3">
                        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Assigned Company</p>
                          <p className="mt-0.5 text-sm font-medium text-foreground">
                            {delivery.accounts?.account_name ?? "Unassigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery type + reference (read-only type) */}
                <FormSection
                  title="Delivery Details"
                  description="Type and reference information"
                  icon={<Truck className="h-4 w-4" />}
                >
                  <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Confirmation Number</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="LLC-0001" className={F} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </FormSection>

                {/* Location */}
                <DeliveryLocationFields form={form} />

                {/* Cargo */}
                <DeliveryCargoFields form={form} showQuotedPrice={isAdmin} />

                {/* Schedule */}
                <DeliveryScheduleFields form={form} />
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
                disabled={saving || !delivery}
                className="h-9 rounded-lg bg-primary px-6 text-sm text-sidebar hover:bg-primary/85"
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {delivery && (
        <DeleteConfirmDialog
          delivery={delivery}
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          loading={deleteMut.isPending}
        />
      )}
    </Sheet>
  );
}
