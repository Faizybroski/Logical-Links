"use client";

import { useEffect, useMemo, useState } from "react";
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

import { loadSchema, type DeliveryFormValues } from "@/lib/validations/delivery";
import { useCreateDelivery } from "@/hooks/use-deliveries";
import { useAccounts } from "@/hooks/use-accounts";
import { useUsers } from "@/hooks/use-users";
import { useAdminEmployees } from "@/hooks/use-admin-employees";
import { useAuthStore } from "@/store/auth.store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { dateInputValueToIso } from "@/lib/utils/format-date";
import { api, type ApiResponse } from "@/lib/api";
import type { AccountProfile, Delivery } from "@/types/api.types";

import { FormSection, DeliveryLocationFields, DeliveryCargoFields, DeliveryScheduleFields, LAST_MILE_SERVICE_TYPES, F } from "./delivery-form-fields";

interface CreateDeliverySheetProps {
  open: boolean;
  onClose: () => void;
  /** Which page opened this sheet — controls the Type field and Assignment section. Omit for the legacy generic behavior. */
  context?: "residential" | "corporate";
  /** Locks this delivery to a residential customer — hides the customer picker. */
  presetCustomerId?: string;
  /** Locks this delivery to a corporate customer (account) — hides the company picker. */
  presetAccountId?: string;
}

export function CreateDeliverySheet({ open, onClose, context, presetCustomerId, presetAccountId }: CreateDeliverySheetProps) {
  const pathname = usePathname();
  const isAdmin  = useAuthStore((s) => s.user?.role === "admin");

  // Company/customer pickers are needed unless a specific preset was passed in
  // (e.g. launched from that customer's own detail page) — the list-page "Create"
  // buttons still need the admin to pick which customer/company this is for.
  const needsAccountPicker  = (!context || context === "corporate") && !presetAccountId;
  const needsCustomerPicker = (!context || context === "residential") && !presetCustomerId;

  const createMut = useCreateDelivery();
  const { data: accountsRes } = useAccounts(
    { limit: 100, isActive: "true" },
    { enabled: isAdmin && open && needsAccountPicker },
  );
  const companies = accountsRes?.data ?? [];

  const { data: customersRes } = useUsers(
    { role: "residential", limit: 100 },
    { enabled: isAdmin && open && needsCustomerPicker },
  );
  const customers = customersRes?.data ?? [];

  const { data: driversRes } = useAdminEmployees(
    { role: "driver", limit: 100 },
    { enabled: isAdmin && open && !!context },
  );
  const drivers = (driversRes?.data ?? []).filter((d) => d.is_active);
  const [assignedDriverId, setAssignedDriverId] = useState<string>("");

  const customerOptions = useMemo(
    () => customers.map((u) => ({
      value: u.id,
      label: u.fullName ?? u.email,
      description: u.fullName ? u.email : undefined,
      icon: <UserAvatar name={u.fullName} avatarUrl={u.avatarUrl} size="xs" rounded="lg" />,
    })),
    [customers],
  );

  const companyOptions = useMemo(
    () => companies.map((c) => {
      const adm = c.profiles?.find((p: AccountProfile) => p.company_role === "company_admin");
      return {
        value: c.account_id,
        label: c.account_name,
        description: adm?.full_name ? `Admin: ${adm.full_name}` : undefined,
        icon: <CompanyLogo name={c.account_name} logoUrl={c.logo_url ?? null} size="xs" rounded="lg" />,
      };
    }),
    [companies],
  );

  const driverOptions = useMemo(
    () => drivers.map((d) => ({
      value: d.id,
      label: d.full_name ?? d.email,
      icon: <UserAvatar name={d.full_name} avatarUrl={d.avatar_url} size="xs" rounded="lg" />,
    })),
    [drivers],
  );

  const form = useForm<DeliveryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loadSchema) as any,
    defaultValues: {
      deliveryType:        context === "residential" ? "last_mile" : "freight",
      serviceType:         undefined,
      accountId:           undefined,
      customerId:          undefined,
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
      packageType:         undefined,
      estimatedPickupDate:   "",
      estimatedDeliveryDate: "",
      preferredDeliveryDate: "",
      quotedPrice:         undefined,
      specialInstructions: "",
    },
  });

  const deliveryType = form.watch("deliveryType");
  const showServiceType = context === "residential" || (context === "corporate" && deliveryType === "last_mile");

  // Reset form when sheet closes (after animation)
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        form.reset();
        setAssignedDriverId("");
      }, 350);
      return () => clearTimeout(t);
    }
  }, [open, form]);

  async function onSubmit(values: DeliveryFormValues) {
    try {
      const created = await createMut.mutateAsync({
        deliveryType:        values.deliveryType,
        serviceType:         values.deliveryType === "last_mile" ? values.serviceType : undefined,
        serviceLevel:        values.deliveryType === "last_mile" ? values.serviceLevel : undefined,
        packageType:         values.packageType,
        accountId:           needsAccountPicker ? (values.accountId || undefined) : presetAccountId,
        customerId:          needsCustomerPicker ? (values.customerId || undefined) : presetCustomerId,
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
        preferredDeliveryDate: dateInputValueToIso(values.preferredDeliveryDate),
        ...(isAdmin && { quotedPrice: values.quotedPrice }),
        specialInstructions: values.specialInstructions,
      });

      if (assignedDriverId) {
        try {
          await api.post<ApiResponse<Delivery>>(
            `/api/v1/deliveries/${created.data.shipment_id}/assign-driver`,
            { employeeId: assignedDriverId },
          );
        } catch (err) {
          toast.error(`Delivery created, but assigning the driver failed: ${(err as Error).message}`);
          onClose();
          return;
        }
      }

      toast.success("Delivery created successfully");
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
              <h2 className="text-lg font-bold text-foreground">
                {context === "residential" ? "Create a Delivery" : context === "corporate" ? "Create a Delivery" : "Create New Delivery"}
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                {context === "residential"
                  ? "Submit a new last-mile delivery for this customer"
                  : context === "corporate"
                    ? "Submit a new delivery for this corporate customer"
                    : pathname.startsWith("/admin")
                      ? "Initiate a new freight or last-mile delivery"
                      : "Submit a new delivery request"}
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

              {/* Delivery type + reference */}
              <FormSection
                title="Delivery Details"
                description="Basic classification for this delivery"
                icon={<Truck className="h-4 w-4" />}
              >
                <div className="grid grid-cols-2 gap-4">
                  {context !== "residential" && (
                    <FormField
                      control={form.control}
                      name="deliveryType"
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
                  )}
                  {showServiceType && (
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Service Type</FormLabel>
                          <SearchableSelect
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            options={LAST_MILE_SERVICE_TYPES}
                            placeholder="Select service type"
                            searchPlaceholder="Search service type…"
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
                  {showServiceType && (
                    <FormField
                      control={form.control}
                      name="serviceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Service Level</FormLabel>
                          <SearchableSelect
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            options={[
                              { value: "standard", label: "Standard" },
                              { value: "express",  label: "Express" },
                              { value: "same_day", label: "Same-Day" },
                              { value: "priority", label: "Priority" },
                            ]}
                            placeholder="Select service level"
                            searchPlaceholder="Search…"
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <p className="mt-3 text-xs text-muted">
                  Confirmation Number is generated automatically once this delivery is created.
                </p>
              </FormSection>

              {/* Customer/company picker (context set, but no preset was given — e.g. launched from the list page) */}
              {isAdmin && context === "residential" && needsCustomerPicker && (
                <FormSection title="Customer" icon={<User className="h-4 w-4" />}>
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Residential Customer</FormLabel>
                          <SearchableSelect
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            options={customerOptions}
                            placeholder="Select customer"
                            searchPlaceholder="Search customers…"
                            emptyText="No residential customers"
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                </FormSection>
              )}
              {isAdmin && context === "corporate" && needsAccountPicker && (
                <FormSection title="Company" icon={<User className="h-4 w-4" />}>
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">Corporate Customer</FormLabel>
                          <SearchableSelect
                            value={field.value ?? ""}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            options={companyOptions}
                            placeholder="Select company"
                            searchPlaceholder="Search companies…"
                            emptyText="No active corporate customers"
                          />
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                </FormSection>
              )}

              {/* Assigned Driver (residential / corporate contexts) */}
              {isAdmin && context && (
                <FormSection
                  title="Assigned Driver"
                  description="Assign this delivery to one of your drivers (optional, can be set later)"
                  icon={<User className="h-4 w-4" />}
                >
                  <SearchableSelect
                    value={assignedDriverId}
                    onValueChange={setAssignedDriverId}
                    options={driverOptions}
                    placeholder="Unassigned — assign later"
                    searchPlaceholder="Search drivers…"
                    emptyText="No active drivers"
                  />
                </FormSection>
              )}

              {/* Company / residential customer assignment (admin only, legacy generic behavior) */}
              {isAdmin && !context && (
                <FormSection
                  title="Assignment"
                  description="Assign to a shipping company or a residential customer (optional, mutually exclusive)"
                  icon={<User className="h-4 w-4" />}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="accountId"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">
                              Shipping Company <span className="font-normal text-muted">(optional)</span>
                            </FormLabel>
                            <SearchableSelect
                              value={field.value ?? ""}
                              onValueChange={(v) => {
                                field.onChange(v);
                                if (v) form.setValue("customerId", undefined);
                              }}
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

                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted">
                              Residential Customer <span className="font-normal text-muted">(optional)</span>
                            </FormLabel>
                            <SearchableSelect
                              value={field.value ?? ""}
                              onValueChange={(v) => {
                                field.onChange(v);
                                if (v) form.setValue("accountId", undefined);
                              }}
                              onBlur={field.onBlur}
                              options={customerOptions}
                              placeholder="Unassigned — assign later"
                              searchPlaceholder="Search customers…"
                              emptyText="No residential customers"
                            />
                            <FormMessage className="text-xs" />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </FormSection>
              )}

              {/* Location fields */}
              <DeliveryLocationFields form={form} />

              {/* Cargo fields */}
              <DeliveryCargoFields form={form} showQuotedPrice={isAdmin} />

              {/* Schedule */}
              <DeliveryScheduleFields form={form} />
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
              {saving ? "Creating…" : context === "residential" ? "Create Delivery" : "Create Delivery"}
            </Button>
          </div>
        </form>
      </Form>
    </Sheet>
  );
}
