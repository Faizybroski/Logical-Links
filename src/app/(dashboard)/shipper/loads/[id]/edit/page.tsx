"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Package, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { CityProvinceCombobox } from "@/components/tracking/city-province-combobox";

import { loadSchema, type LoadFormValues } from "@/lib/validations/load";
import { useShipment, useUpdateShipment } from "@/hooks/use-shipments";

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-card-border bg-background/50 px-6 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const F = "h-10 rounded-lg border-card-border bg-background text-sm focus-visible:ring-primary/30";

export default function ShipperEditLoadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params);
  const router  = useRouter();

  const { data, isLoading } = useShipment(id);
  const shipment = data?.data;

  const updateMut = useUpdateShipment(id);

  const form = useForm<LoadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loadSchema) as any,
    defaultValues: {
      shipmentType: "freight",
      originAddress: "", originCity: "", originState: "", originPostcode: "",
      destinationAddress: "", destinationCity: "", destinationState: "", destinationPostcode: "",
      cargoDescription: "", weightKg: undefined, pieces: undefined,
      referenceNumber: "", specialInstructions: "",
    },
  });

  const originCity  = form.watch("originCity");
  const originState = form.watch("originState");
  const destCity    = form.watch("destinationCity");
  const destState   = form.watch("destinationState");

  useEffect(() => {
    if (shipment) {
      form.reset({
        shipmentType:        (shipment.shipment_type as "freight" | "last_mile") ?? "freight",
        originAddress:       shipment.origin_address       ?? "",
        originCity:          shipment.origin_city           ?? "",
        originState:         shipment.origin_state          ?? "",
        originPostcode:      shipment.origin_postcode       ?? "",
        destinationAddress:  shipment.destination_address   ?? "",
        destinationCity:     shipment.destination_city      ?? "",
        destinationState:    shipment.destination_state     ?? "",
        destinationPostcode: shipment.destination_postcode  ?? "",
        cargoDescription:    shipment.cargo_description     ?? "",
        weightKg:            shipment.weight_kg             ?? undefined,
        pieces:              shipment.pieces                ?? undefined,
        referenceNumber:     shipment.reference_number      ?? "",
        specialInstructions: shipment.special_instructions  ?? "",
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
        referenceNumber:     values.referenceNumber,
        specialInstructions: values.specialInstructions,
      });
      toast.success("Load updated");
      router.push(`/shipper/loads/${id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const saving = updateMut.isPending;

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
        <Link href="/shipper/loads" className="text-sm text-primary underline">Back to loads</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Sticky header */}
          <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
            <div className="mx-auto max-w-5xl px-6 py-4">
              <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
                <Link href="/shipper/loads" className="hover:text-foreground transition-colors">Loads</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/shipper/loads/${id}`} className="hover:text-foreground transition-colors">{shipment.load_number}</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">Edit</span>
              </nav>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link href={`/shipper/loads/${id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Edit {shipment.load_number}</h1>
                    <p className="text-xs text-muted capitalize">{shipment.shipment_type.replace("_", " ")} shipment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => router.push(`/shipper/loads/${id}`)} disabled={saving} className="h-9 rounded-lg border-card-border text-sm">Cancel</Button>
                  <Button type="submit" disabled={saving} className="h-9 rounded-lg bg-primary px-5 text-sm text-sidebar hover:bg-primary/85">
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-5xl space-y-5 px-2 py-8">
            <div className="grid gap-5 lg:grid-cols-2">
              <FormSection title="Origin" description="Pickup location" icon={<MapPin className="h-4 w-4" />}>
                <div className="space-y-3">
                  <FormField control={form.control} name="originAddress" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address</FormLabel><FormControl><Input {...field} placeholder="123 Main Street" className={F} /></FormControl><FormMessage className="text-xs" /></FormItem>
                  )} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="originCity" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">City &amp; Province</FormLabel>
                        <CityProvinceCombobox
                          value={null}
                          onChange={(_, loc) => {
                            if (loc) {
                              field.onChange(loc.city);
                              form.setValue("originState", loc.province, { shouldValidate: true });
                            }
                          }}
                          fallbackDisplay={originCity && originState ? `${originCity}, ${originState}` : undefined}
                        />
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="originPostcode" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Postcode</FormLabel><FormControl><Input {...field} placeholder="A1A 1A1" className={F} /></FormControl><FormMessage className="text-xs" /></FormItem>
                    )} />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Destination" description="Delivery location" icon={<MapPin className="h-4 w-4" />}>
                <div className="space-y-3">
                  <FormField control={form.control} name="destinationAddress" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address</FormLabel><FormControl><Input {...field} placeholder="456 Market Street" className={F} /></FormControl><FormMessage className="text-xs" /></FormItem>
                  )} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="destinationCity" render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">City &amp; Province</FormLabel>
                        <CityProvinceCombobox
                          value={null}
                          onChange={(_, loc) => {
                            if (loc) {
                              field.onChange(loc.city);
                              form.setValue("destinationState", loc.province, { shouldValidate: true });
                            }
                          }}
                          fallbackDisplay={destCity && destState ? `${destCity}, ${destState}` : undefined}
                        />
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="destinationPostcode" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Postcode</FormLabel><FormControl><Input {...field} placeholder="A1A 1A1" className={F} /></FormControl><FormMessage className="text-xs" /></FormItem>
                    )} />
                  </div>
                </div>
              </FormSection>
            </div>

            <FormSection title="Cargo Details" description="Physical characteristics and instructions" icon={<Package className="h-4 w-4" />}>
              <div className="space-y-4">
                <FormField control={form.control} name="cargoDescription" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Description</FormLabel><FormControl><Textarea {...field} placeholder="Describe the goods…" className="min-h-[80px] resize-none rounded-lg border-card-border bg-background text-sm focus-visible:ring-primary/30" /></FormControl><FormMessage className="text-xs" /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="weightKg" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Weight (kg)</FormLabel><FormControl><Input {...field} type="number" placeholder="0" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} className={F} /></FormControl><FormMessage className="text-xs" /></FormItem>
                  )} />
                  <FormField control={form.control} name="pieces" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Pieces</FormLabel><FormControl><Input {...field} type="number" placeholder="0" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))} className={F} /></FormControl><FormMessage className="text-xs" /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="specialInstructions" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Special Instructions</FormLabel><FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Handle with care…" className="min-h-[60px] resize-none rounded-lg border-card-border bg-background text-sm focus-visible:ring-primary/30" /></FormControl><FormMessage className="text-xs" /></FormItem>
                )} />
              </div>
            </FormSection>

            <div className="flex justify-end gap-3 border-t border-card-border pt-6">
              <Button type="button" variant="outline" onClick={() => router.push(`/shipper/loads/${id}`)} disabled={saving} className="h-10 rounded-lg border-card-border px-6 text-sm">Cancel</Button>
              <Button type="submit" disabled={saving} className="h-10 rounded-lg bg-primary px-8 text-sm font-medium text-sidebar hover:bg-primary/85">
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
