"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { loadSchema, LoadFormValues } from "@/lib/validations/load";
import type { Shipment, UserProfile } from "@/types/api.types";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  defaultValues?: Partial<Shipment>;
  isAdmin: boolean;
  /** Approved shipper profiles shown in the assignment dropdown (admin only) */
  shippers: UserProfile[];
  onSubmit: (values: LoadFormValues) => void;
  loading?: boolean;
}

export function LoadDialog({
  open,
  onClose,
  title,
  description,
  defaultValues,
  isAdmin,
  shippers,
  onSubmit,
  loading = false,
}: Props) {
  const form = useForm<LoadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loadSchema) as any,
    defaultValues: buildDefaults(defaultValues),
  });

  useEffect(() => {
    if (open) form.reset(buildDefaults(defaultValues));
  }, [open]);                                           // eslint-disable-line react-hooks/exhaustive-deps

  const fieldClass =
    "rounded-lg border-card-border bg-background text-sm focus-visible:ring-primary/40";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col rounded-2xl border border-card-border bg-card p-0 shadow-2xl overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 sm:px-7">
          <DialogTitle className="text-xl font-semibold text-foreground">{title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">{description}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <Form {...form}>
            <form id="load-dialog-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Type + Shipper */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="shipmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipment Type</FormLabel>
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        options={[
                          { value: "freight", label: "Freight" },
                          { value: "last_mile", label: "Last Mile" },
                        ]}
                        placeholder="Select type"
                        searchPlaceholder="Search type…"
                        className={`h-11 ${fieldClass}`}
                      />
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="shipperId"
                    render={({ field }) => {
                      const shipperOptions = shippers.map((s) => ({
                        value: s.id,
                        label: s.fullName ?? s.email,
                        description: s.fullName ? s.email : undefined,
                        icon: (
                          <UserAvatar
                            name={s.fullName ?? s.email}
                            avatarUrl={null}
                            size="xs"
                            rounded="full"
                          />
                        ),
                      }));
                      return (
                        <FormItem>
                          <FormLabel>Assign to Shipper</FormLabel>
                          <SearchableSelect
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            options={shipperOptions}
                            placeholder="Select shipper (optional)"
                            searchPlaceholder="Search shippers…"
                            className={`h-11 ${fieldClass}`}
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                )}
              </div>

              {/* Origin */}
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Origin</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="originAddress" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input {...field} placeholder="123 Main St" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="originCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input {...field} placeholder="Sydney" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="originState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input {...field} placeholder="NSW" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="originPostcode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl><Input {...field} placeholder="2000" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Destination */}
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Destination</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="destinationAddress" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input {...field} placeholder="456 Market St" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="destinationCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input {...field} placeholder="Melbourne" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="destinationState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl><Input {...field} placeholder="VIC" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="destinationPostcode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postcode</FormLabel>
                      <FormControl><Input {...field} placeholder="3000" className={fieldClass} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Cargo + meta */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField control={form.control} name="cargoDescription" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Cargo Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the goods being shipped..."
                        className={`${fieldClass} min-h-[70px] resize-none`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="weightKg" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        }
                        className={fieldClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="pieces" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                        }
                        className={fieldClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                {isAdmin && (
                  <FormField control={form.control} name="quotedPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quoted Price (AUD)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                          }
                          className={fieldClass}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                )}

                <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="REF-001"
                        className={fieldClass}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <FormField control={form.control} name="specialInstructions" render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Handle with care, keep refrigerated..."
                        className={`${fieldClass} min-h-[60px] resize-none`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>

            </form>
          </Form>
        </div>

        {/* Sticky footer — always visible regardless of scroll position */}
        <div className="shrink-0 flex items-center justify-end gap-3 border-t border-card-border px-5 py-4 sm:px-7">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border-card-border text-foreground hover:bg-background"
          >
            Cancel
          </Button>
          <Button
            form="load-dialog-form"
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 text-sidebar hover:bg-primary/85"
          >
            {loading ? "Saving…" : "Save Load"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function buildDefaults(s?: Partial<Shipment>): LoadFormValues {
  return {
    shipmentType:        (s?.shipment_type as "freight" | "last_mile") ?? "freight",
    shipperId:           undefined,   // can't reverse-resolve account_id → user_id here
    originAddress:       s?.origin_address       ?? "",
    originCity:          s?.origin_city           ?? "",
    originState:         s?.origin_state          ?? "",
    originPostcode:      s?.origin_postcode       ?? "",
    destinationAddress:  s?.destination_address   ?? "",
    destinationCity:     s?.destination_city      ?? "",
    destinationState:    s?.destination_state     ?? "",
    destinationPostcode: s?.destination_postcode  ?? "",
    cargoDescription:    s?.cargo_description     ?? "",
    weightKg:            s?.weight_kg             ?? undefined,
    pieces:              s?.pieces                ?? undefined,
    quotedPrice:         s?.quoted_price          ?? undefined,
    referenceNumber:     s?.reference_number      ?? "",
    specialInstructions: s?.special_instructions  ?? "",
  };
}
