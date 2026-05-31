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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <DialogContent className="max-w-3xl rounded-2xl border border-card-border bg-card p-0 shadow-2xl">
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <DialogTitle className="text-xl font-semibold text-foreground">{title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">{description}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto px-7 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Type + Shipper */}
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="shipmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipment Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={`h-11 w-full ${fieldClass}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-card-border bg-card">
                          <SelectItem value="freight">Freight</SelectItem>
                          <SelectItem value="last_mile">Last Mile</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="shipperId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Shipper</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger className={`h-11 w-full ${fieldClass}`}>
                              <SelectValue placeholder="Select shipper (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-card-border bg-card">
                            {shippers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <span className="font-medium">
                                  {s.fullName ?? s.email}
                                </span>
                                {s.fullName && (
                                  <span className="ml-1.5 text-xs text-muted">
                                    · {s.email}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Origin */}
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Origin</p>
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-5">
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

              <div className="flex items-center justify-end gap-3 border-t border-card-border pt-5">
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
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary px-6 text-sidebar hover:bg-primary/85"
                >
                  {loading ? "Saving…" : "Save Load"}
                </Button>
              </div>
            </form>
          </Form>
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
