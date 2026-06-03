"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Package,
  User,
  DollarSign,
  ChevronRight,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { loadSchema, type LoadFormValues } from "@/lib/validations/load";
import { useCreateShipment } from "@/hooks/use-shipments";
import { useUsers } from "@/hooks/use-users";

/* ─── Shared sub-components ──────────────────────────────────────────────── */

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

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function AdminCreateLoadPage() {
  const router = useRouter();

  const createMut = useCreateShipment();
  const { data: shippersRes } = useUsers({ role: "shipper", limit: 100 });
  const shippers = (shippersRes?.data ?? []).filter((s) => s.isApproved);

  const form = useForm<LoadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loadSchema) as any,
    defaultValues: {
      shipmentType: "freight",
      shipperId: undefined,
      originAddress: "",
      originCity: "",
      originState: "",
      originPostcode: "",
      destinationAddress: "",
      destinationCity: "",
      destinationState: "",
      destinationPostcode: "",
      cargoDescription: "",
      weightKg: undefined,
      pieces: undefined,
      quotedPrice: undefined,
      referenceNumber: "",
      specialInstructions: "",
    },
  });

  async function onSubmit(values: LoadFormValues) {
    try {
      await createMut.mutateAsync({
        shipmentType:        values.shipmentType,
        shipperId:           values.shipperId || undefined,
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
        quotedPrice:         values.quotedPrice,
        referenceNumber:     values.referenceNumber,
        specialInstructions: values.specialInstructions,
      });
      toast.success("Load created successfully");
      router.push("/admin/loads");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const saving = createMut.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

          {/* ── Sticky page header ── */}
          <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
            <div className="mx-auto max-w-5xl px-6 py-4">
              {/* Breadcrumb */}
              <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
                <Link href="/admin/loads" className="hover:text-foreground transition-colors">
                  Loads
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">Create</span>
              </nav>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/loads"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Create New Load</h1>
                    <p className="text-xs text-muted">Initiate a new freight or last-mile shipment</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/loads")}
                    disabled={saving}
                    className="h-9 rounded-lg border-card-border text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-9 rounded-lg bg-primary px-5 text-sm text-sidebar hover:bg-primary/85"
                  >
                    {saving ? "Creating…" : "Create Load"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="mx-auto max-w-5xl space-y-5 px-2 py-8">

            {/* Row 1: Shipment type + Assignment */}
            <div className="grid gap-5 lg:grid-cols-2">
              <FormSection
                title="Shipment Details"
                description="Basic classification for this load"
                icon={<Truck className="h-4 w-4" />}
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shipmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={`h-10`}>
                              <SelectValue />
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

                  <FormField
                    control={form.control}
                    name="referenceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">
                          Reference No.
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="REF-001" className={F} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Assignment"
                description="Assign to an approved shipper (optional)"
                icon={<User className="h-4 w-4" />}
              >
                <FormField
                  control={form.control}
                  name="shipperId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Shipper
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className={`h-10`}>
                            <SelectValue placeholder="Unassigned — select later" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-card-border bg-card">
                          {shippers.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted">No approved shippers</div>
                          ) : (
                            shippers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                <span className="font-medium">{s.fullName ?? s.email}</span>
                                {s.fullName && (
                                  <span className="ml-1.5 text-xs text-muted">· {s.email}</span>
                                )}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </FormSection>
            </div>

            {/* Row 2: Origin + Destination */}
            <div className="grid gap-5 lg:grid-cols-2">
              <FormSection
                title="Origin"
                description="Pickup location"
                icon={<MapPin className="h-4 w-4" />}
              >
                <div className="space-y-3">
                  <FormField control={form.control} name="originAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address</FormLabel>
                      <FormControl><Input {...field} placeholder="123 Main Street" className={F} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="originCity" render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">City</FormLabel>
                        <FormControl><Input {...field} placeholder="Sydney" className={F} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="originState" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">State</FormLabel>
                        <FormControl><Input {...field} placeholder="NSW" className={F} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="originPostcode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Postcode</FormLabel>
                        <FormControl><Input {...field} placeholder="2000" className={F} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Destination"
                description="Delivery location"
                icon={<MapPin className="h-4 w-4" />}
              >
                <div className="space-y-3">
                  <FormField control={form.control} name="destinationAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address</FormLabel>
                      <FormControl><Input {...field} placeholder="456 Market Street" className={F} /></FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-3 gap-3">
                    <FormField control={form.control} name="destinationCity" render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">City</FormLabel>
                        <FormControl><Input {...field} placeholder="Melbourne" className={F} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="destinationState" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">State</FormLabel>
                        <FormControl><Input {...field} placeholder="VIC" className={F} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="destinationPostcode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Postcode</FormLabel>
                        <FormControl><Input {...field} placeholder="3000" className={F} /></FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </FormSection>
            </div>

            {/* Row 3: Cargo details */}
            <FormSection
              title="Cargo Details"
              description="Description and physical characteristics of the freight"
              icon={<Package className="h-4 w-4" />}
            >
              <div className="space-y-4">
                <FormField control={form.control} name="cargoDescription" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the goods being transported…"
                        className="min-h-[80px] resize-none rounded-lg border-card-border bg-background text-sm focus-visible:ring-primary/30"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <FormField control={form.control} name="weightKg" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          className={F}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="pieces" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Pieces</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          className={F}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="quotedPrice" render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Quoted Price (AUD)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          className={F}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="specialInstructions" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Handle with care, temperature-controlled…"
                        className="min-h-[60px] resize-none rounded-lg border-card-border bg-background text-sm focus-visible:ring-primary/30"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
              </div>
            </FormSection>

            {/* Row 4: Bottom pricing row (Admin) */}
            <FormSection
              title="Pricing & Financial"
              description="Quoted amount for this shipment"
              icon={<DollarSign className="h-4 w-4" />}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1 text-sm text-muted">
                  Pricing has been entered in Cargo Details above.
                </div>
              </div>
            </FormSection>

            {/* Bottom save bar */}
            <div className="flex items-center justify-end gap-3 border-t border-card-border pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/loads")}
                disabled={saving}
                className="h-10 rounded-lg border-card-border px-6 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="h-10 rounded-lg bg-primary px-8 text-sm font-medium text-sidebar hover:bg-primary/85"
              >
                {saving ? "Creating…" : "Create Load"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
