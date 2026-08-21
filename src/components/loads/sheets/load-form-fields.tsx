"use client";

import type { UseFormReturn } from "react-hook-form";
import { MapPin, Package, Clock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CityProvinceCombobox } from "@/components/tracking/city-province-combobox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { AddressSuggestion } from "@/lib/utils/geocode";
import type { LoadFormValues } from "@/lib/validations/load";

export const PACKAGE_TYPE_OPTIONS = [
  { value: "pallet",   label: "Pallet" },
  { value: "box",      label: "Box" },
  { value: "crate",    label: "Crate" },
  { value: "envelope", label: "Envelope" },
  { value: "other",    label: "Other" },
];

export const F = "h-10 rounded-lg border-card-border bg-background text-sm focus-visible:ring-primary/30";

// Granular last-mile service types (Aug 2026 chat requirement) — extensible list,
// not a DB enum, so adding a new one here is enough, no migration needed.
export const LAST_MILE_SERVICE_TYPES: { value: string; label: string }[] = [
  { value: "courier",   label: "Courier Delivery" },
  { value: "medical",   label: "Medical Delivery" },
  { value: "grocery",   label: "Grocery Delivery" },
  { value: "ecommerce", label: "E-Commerce Delivery" },
  { value: "same_day",  label: "Same-Day Delivery" },
  { value: "scheduled", label: "Scheduled Delivery" },
  { value: "priority",  label: "Priority Delivery" },
];

export const LAST_MILE_SERVICE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  LAST_MILE_SERVICE_TYPES.map((t) => [t.value, t.label]),
);

export function FormSection({
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
      <div className="flex items-center gap-3 border-b border-card-border bg-background/50 px-5 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function LoadLocationFields({ form }: { form: UseFormReturn<LoadFormValues> }) {
  const originCity  = form.watch("originCity");
  const originState = form.watch("originState");
  const destCity    = form.watch("destinationCity");
  const destState   = form.watch("destinationState");

  function handleAddressSelect(prefix: "origin" | "destination", s: AddressSuggestion) {
    if (prefix === "origin") {
      if (s.context?.city)     form.setValue("originCity", s.context.city, { shouldValidate: true });
      if (s.context?.region)   form.setValue("originState", s.context.region, { shouldValidate: true });
      if (s.context?.postcode) form.setValue("originPostcode", s.context.postcode, { shouldValidate: true });
    } else {
      if (s.context?.city)     form.setValue("destinationCity", s.context.city, { shouldValidate: true });
      if (s.context?.region)   form.setValue("destinationState", s.context.region, { shouldValidate: true });
      if (s.context?.postcode) form.setValue("destinationPostcode", s.context.postcode, { shouldValidate: true });
    }
  }

  return (
    <div className="space-y-4">
      {/* Origin */}
      <FormSection title="Origin" description="Pickup location" icon={<MapPin className="h-4 w-4" />}>
        <div className="space-y-3">
          <FormField control={form.control} name="originAddress" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onSelect={(s) => handleAddressSelect("origin", s)}
                  placeholder="123 Main Street"
                  className={F}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
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
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Postcode</FormLabel>
                <FormControl><Input {...field} placeholder="A1A 1A1" className={F} /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
          </div>
        </div>
      </FormSection>

      {/* Destination */}
      <FormSection title="Destination" description="Delivery location" icon={<MapPin className="h-4 w-4" />}>
        <div className="space-y-3">
          <FormField control={form.control} name="destinationAddress" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Street Address</FormLabel>
              <FormControl>
                <AddressAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onSelect={(s) => handleAddressSelect("destination", s)}
                  placeholder="456 Market Street"
                  className={F}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
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
              <FormItem>
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Postcode</FormLabel>
                <FormControl><Input {...field} placeholder="A1A 1A1" className={F} /></FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />
          </div>
        </div>
      </FormSection>
    </div>
  );
}

export function LoadScheduleFields({ form }: { form: UseFormReturn<LoadFormValues> }) {
  return (
    <FormSection
      title="Schedule"
      description="Estimated pickup and delivery dates"
      icon={<Clock className="h-4 w-4" />}
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField control={form.control} name="estimatedPickupDate" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Estimated Pickup</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="date"
                value={field.value ?? ""}
                className={F}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )} />

        <FormField control={form.control} name="preferredDeliveryDate" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Preferred Delivery Date</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="date"
                value={field.value ?? ""}
                className={F}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )} />

        <FormField control={form.control} name="estimatedDeliveryDate" render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Estimated Delivery (ETA, when available)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="date"
                value={field.value ?? ""}
                className={F}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )} />
      </div>
    </FormSection>
  );
}

export function LoadCargoFields({
  form,
  showQuotedPrice = false,
}: {
  form: UseFormReturn<LoadFormValues>;
  showQuotedPrice?: boolean;
}) {
  return (
    <FormSection
      title="Delivery Details"
      description="Description and physical characteristics"
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

          <FormField control={form.control} name="packageType" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Package Type</FormLabel>
              <SearchableSelect
                value={field.value ?? ""}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                options={PACKAGE_TYPE_OPTIONS}
                placeholder="Select type"
                searchPlaceholder="Search…"
              />
              <FormMessage className="text-xs" />
            </FormItem>
          )} />

          {showQuotedPrice && (
            <FormField control={form.control} name="quotedPrice" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Quoted Price (CAD)</FormLabel>
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
          )}
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
  );
}
