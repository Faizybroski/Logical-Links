"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, Truck, User } from "lucide-react";

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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CompanyLogo } from "@/components/ui/company-logo";

import { loadSchema, type LoadFormValues } from "@/lib/validations/load";
import { useCreateShipment } from "@/hooks/use-shipments";
import { useAccounts } from "@/hooks/use-accounts";
import { useAuthStore } from "@/store/auth.store";
import type { AccountProfile } from "@/types/api.types";

import { FormSection, LoadLocationFields, LoadCargoFields, F } from "./load-form-fields";

interface CreateLoadSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateLoadSheet({ open, onClose }: CreateLoadSheetProps) {
  const pathname = usePathname();
  const isAdmin  = useAuthStore((s) => s.user?.role === "admin");

  const createMut = useCreateShipment();
  const { data: accountsRes } = useAccounts(
    { limit: 100, isActive: "true" },
    { enabled: isAdmin && open },
  );
  const companies = accountsRes?.data ?? [];

  const form = useForm<LoadFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loadSchema) as any,
    defaultValues: {
      shipmentType:        "freight",
      accountId:           undefined,
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
      quotedPrice:         undefined,
      referenceNumber:     "",
      specialInstructions: "",
    },
  });

  // Reset form when sheet closes (after animation)
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => form.reset(), 350);
      return () => clearTimeout(t);
    }
  }, [open, form]);

  async function onSubmit(values: LoadFormValues) {
    try {
      await createMut.mutateAsync({
        shipmentType:        values.shipmentType,
        accountId:           values.accountId || undefined,
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
        ...(isAdmin && { quotedPrice: values.quotedPrice }),
        referenceNumber:     values.referenceNumber,
        specialInstructions: values.specialInstructions,
      });
      toast.success("Load created successfully");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const saving = createMut.isPending;

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-foreground">Create New Load</h2>
              <p className="mt-0.5 text-xs text-muted">
                {pathname.startsWith("/admin")
                  ? "Initiate a new freight or last-mile shipment"
                  : "Submit a new shipment request"}
              </p>
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
            <div className="space-y-4 p-6">

              {/* Shipment type + reference */}
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
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Type</FormLabel>
                        <SearchableSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
                          options={[
                            { value: "freight",   label: "Freight" },
                            { value: "last_mile", label: "Last Mile" },
                          ]}
                          searchPlaceholder="Search type…"
                        />
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referenceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Reference No.</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="REF-001" className={F} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              {/* Company assignment (admin only) */}
              {isAdmin && (
                <FormSection
                  title="Assignment"
                  description="Assign to a shipping company (optional)"
                  icon={<User className="h-4 w-4" />}
                >
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => {
                      const companyOptions = companies.map((c) => {
                        const adm = c.profiles?.find(
                          (p: AccountProfile) => p.company_role === "company_admin",
                        );
                        return {
                          value: c.account_id,
                          label: c.account_name,
                          description: adm?.full_name ? `Admin: ${adm.full_name}` : undefined,
                          icon: (
                            <CompanyLogo
                              name={c.account_name}
                              logoUrl={c.logo_url ?? null}
                              size="xs"
                              rounded="lg"
                            />
                          ),
                        };
                      });
                      return (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">
                            Shipping Company <span className="font-normal text-muted">(optional)</span>
                          </FormLabel>
                          <SearchableSelect
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            options={companyOptions}
                            placeholder="Unassigned — assign later"
                            searchPlaceholder="Search companies…"
                            emptyText="No active shipping companies"
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                </FormSection>
              )}

              {/* Location fields */}
              <LoadLocationFields form={form} />

              {/* Cargo fields */}
              <LoadCargoFields form={form} showQuotedPrice={isAdmin} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-card-border px-6 py-4 flex-shrink-0">
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
              disabled={saving}
              className="h-9 rounded-lg bg-primary px-6 text-sm text-sidebar hover:bg-primary/85"
            >
              {saving ? "Creating…" : "Create Load"}
            </Button>
          </div>
        </form>
      </Form>
    </Sheet>
  );
}
