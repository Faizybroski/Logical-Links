"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, FileDown, FileOutput, Copy, Send, Loader2, X, Truck, Route as RouteIcon, Package, Weight, Calendar, ClipboardList, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LineItemsTable, type LineItemsTableHandle } from "./line-items-table";
import { PricingSummary } from "./pricing-summary";
import { QuotationStatusBadge } from "./document-status-badge";
import { DatePicker } from "./date-picker";
import { PricingCalculatorDialog } from "@/components/deliveries/dialogs/pricing-calculator-dialog";
import { Calculator } from "lucide-react";
import type {
  Quotation,
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationStatus,
  LineItem,
  PriceBreakdown,
} from "@/types/api.types";
import {
  useCreateQuotation,
  useUpdateQuotation,
  useDuplicateQuotation,
  useGenerateQuotationPdf,
} from "@/hooks/use-quotations";
import { useConvertQuotationToInvoice } from "@/hooks/use-invoices";
import { useAccounts } from "@/hooks/use-accounts";
import { useAdditionalCharges } from "@/hooks/use-additional-charges";
import { useCalculatePrice } from "@/hooks/use-pricing";
import { CompanyLogo } from "@/components/ui/company-logo";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { geocodeAddress, haversineDistanceKm, type AddressSuggestion, type Coordinates } from "@/lib/utils/geocode";
import { LAST_MILE_SERVICE_TYPE_LABELS } from "@/components/deliveries/sheets/delivery-form-fields";

// ── Schema ────────────────────────────────────────────────────────────────────

const QUOTATION_STATUS_VALUES = [
  "requested", "draft", "sent", "accepted", "rejected", "expired",
] as const;

const quotationFormSchema = z
  .object({
    status:          z.enum(QUOTATION_STATUS_VALUES),
    issueDate:       z.string().min(1, "Issue date is required"),
    expiryDate:      z.string().optional().nullable(),
    customerName:    z
                       .string()
                       .min(1, "Customer name is required")
                       .max(200, "Maximum 200 characters"),
    customerCompany: z.string().max(200, "Maximum 200 characters").optional().nullable(),
    customerEmail:   z
                       .string()
                       .max(200, "Maximum 200 characters")
                       .refine(
                         (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                         "Invalid email address",
                       )
                       .optional()
                       .nullable(),
    customerPhone:   z.string().max(50, "Maximum 50 characters").optional().nullable(),
    billingAddress:  z.string().max(500, "Maximum 500 characters").optional().nullable(),
    originAddress:      z.string().max(500, "Maximum 500 characters").optional().nullable(),
    destinationAddress: z.string().max(500, "Maximum 500 characters").optional().nullable(),
    notes:           z.string().max(2000, "Maximum 2000 characters").optional().nullable(),
    terms:           z.string().max(5000, "Maximum 5000 characters").optional().nullable(),
    discount:        z.number().min(0, "Discount cannot be negative"),
    taxRate:         z.number().min(0, "Must be 0 or greater").max(1, "Must be 100% or less"),
  })
  .refine(
    (data) => {
      if (!data.expiryDate || !data.issueDate) return true;
      return data.expiryDate >= data.issueDate;
    },
    { message: "Expiry date cannot be before issue date", path: ["expiryDate"] },
  );

type QuotationFormValues = z.infer<typeof quotationFormSchema>;

// ── Constants ─────────────────────────────────────────────────────────────────

// Admin can only ever move a quotation between Draft and Sent — Accepted/Declined
// are recorded exclusively by the corporate via the accept/decline workflow.
const QUOTATION_STATUSES: { value: QuotationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent",  label: "Sent"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

type FormItem = Omit<LineItem, "id" | "created_at" | "updated_at">;

function today() { return new Date().toISOString().slice(0, 10); }

function computeTotals(items: FormItem[], discount: number, taxRate: number) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const tax      = Math.round((subtotal - discount) * taxRate * 100) / 100;
  const total    = Math.round((subtotal - discount + tax) * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, tax, total };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="border-b border-card-border px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

const fieldLabelCls = "text-[11px] font-semibold uppercase tracking-wide text-muted";

function RequestTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-card-border bg-background p-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface DeliveryPrefill {
  loadNumber:       string;
  originCity:       string;
  originState:      string;
  destinationCity:  string;
  destinationState: string;
  customerName?:    string;
  customerCompany?: string;
}

interface Props {
  profileId:    string;
  quotation?:   Quotation;
  redirectTo?:  string;
  isAdmin?:     boolean;
  loadId?:      string | null;
  loadPrefill?: DeliveryPrefill;
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function QuotationEditor({ profileId, quotation, redirectTo, isAdmin, loadId, loadPrefill }: Props) {
  const router = useRouter();
  const isEdit = !!quotation;

  // Corporate customer picker — only relevant when an admin is creating a
  // brand-new, standalone quotation. Selecting one sets who the quotation
  // belongs to (profile_id) and autofills the customer fields from that company.
  const { data: accountsRes } = useAccounts(
    { limit: 100, isActive: "true" },
    { enabled: !!isAdmin && !isEdit },
  );
  const corporateAccounts = accountsRes?.data ?? [];
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [selectedProfileId, setSelectedProfileId] = useState<string | undefined>(undefined);

  // Resolves the customer's requested_additional_charge_keys wishlist (a
  // manual quote request, before it's priced) to display labels.
  const { data: chargesRes } = useAdditionalCharges();
  const chargeLabel = (key: string) => chargesRes?.data?.find((c) => c.key === key)?.label ?? key;

  function handleCorporateSelect(accountId: string) {
    const account = corporateAccounts.find((a) => a.account_id === accountId);
    if (!account) return;
    const admin = account.profiles?.find((p) => p.company_role === "company_admin") ?? account.profiles?.[0];
    setSelectedAccountId(accountId);
    setSelectedProfileId(admin?.id);

    const billingAddress = [account.billing_address, account.billing_city, account.billing_state, account.billing_postcode]
      .filter(Boolean).join(", ");

    form.setValue("customerName", admin?.full_name || account.contact_name || account.account_name, { shouldValidate: true, shouldDirty: true });
    form.setValue("customerCompany", account.account_name, { shouldDirty: true });
    form.setValue("customerEmail", account.contact_email ?? "", { shouldDirty: true });
    form.setValue("customerPhone", account.contact_phone ?? admin?.phone ?? "", { shouldDirty: true });
    if (billingAddress) form.setValue("billingAddress", billingAddress, { shouldDirty: true });
  }

  // Line items live outside the main form (managed by LineItemsTable's own useForm)
  const [items, setItems] = useState<FormItem[]>(() => {
    if (quotation?.quotation_items?.length) {
      return quotation.quotation_items.map((i) => ({
        description: i.description,
        category:    i.category,
        quantity:    i.quantity,
        unit:        i.unit,
        unit_price:  i.unit_price,
        amount:      i.amount,
        notes:       i.notes ?? undefined,
        sort_order:  i.sort_order,
      }));
    }
    if (loadPrefill && !quotation) {
      return [
        { description: "Freight Charge", category: "freight_charge" as const, quantity: 1, unit: "delivery", unit_price: 0, amount: 0, sort_order: 0 },
        { description: "Fuel Surcharge",  category: "fuel_surcharge"  as const, quantity: 1, unit: "delivery", unit_price: 0, amount: 0, sort_order: 1 },
      ];
    }
    return [];
  });

  const [originCoords, setOriginCoords] = useState<Coordinates | null>(
    quotation?.origin_lat != null && quotation?.origin_lng != null
      ? { lat: quotation.origin_lat, lng: quotation.origin_lng }
      : null,
  );
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(
    quotation?.destination_lat != null && quotation?.destination_lng != null
      ? { lat: quotation.destination_lat, lng: quotation.destination_lng }
      : null,
  );
  const [geocoding, setGeocoding] = useState<"origin" | "destination" | null>(null);

  // City/state/postcode aren't geocodable from a blurred free-text address —
  // only captured when the user picks a suggestion. Needed so an accepted
  // quotation has everything createDelivery requires.
  const [originParts, setOriginParts] = useState({
    city: quotation?.origin_city ?? "", state: quotation?.origin_state ?? "", postcode: quotation?.origin_postcode ?? "",
  });
  const [destinationParts, setDestinationParts] = useState({
    city: quotation?.destination_city ?? "", state: quotation?.destination_state ?? "", postcode: quotation?.destination_postcode ?? "",
  });

  const distanceKm = originCoords && destinationCoords
    ? Math.round(haversineDistanceKm(originCoords, destinationCoords) * 10) / 10
    : (quotation?.distance_km ?? null);

  async function handleAddressBlur(field: "origin" | "destination", address: string) {
    setGeocoding(field);
    const coords = await geocodeAddress(address);
    if (field === "origin") setOriginCoords(coords);
    else setDestinationCoords(coords);
    setGeocoding(null);
  }

  function handleAddressSelect(field: "origin" | "destination", suggestion: AddressSuggestion) {
    const parts = {
      city:     suggestion.context?.city ?? "",
      state:    suggestion.context?.region ?? "",
      postcode: suggestion.context?.postcode ?? "",
    };
    if (field === "origin") { setOriginCoords(suggestion.center); setOriginParts(parts); }
    else { setDestinationCoords(suggestion.center); setDestinationParts(parts); }
  }

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: {
      status:          quotation?.status ?? "draft",
      issueDate:       quotation?.issue_date ?? today(),
      expiryDate:      quotation?.expiry_date ?? "",
      customerName:    quotation?.customer_name ?? loadPrefill?.customerName ?? "",
      customerCompany: quotation?.customer_company ?? loadPrefill?.customerCompany ?? "",
      customerEmail:   quotation?.customer_email ?? "",
      customerPhone:   quotation?.customer_phone ?? "",
      billingAddress:  quotation?.billing_address ?? "",
      originAddress:      quotation?.origin_address
        ?? (loadPrefill ? `${loadPrefill.originCity}, ${loadPrefill.originState}` : ""),
      destinationAddress: quotation?.destination_address
        ?? (loadPrefill ? `${loadPrefill.destinationCity}, ${loadPrefill.destinationState}` : ""),
      notes:           quotation?.notes ?? "",
      terms:           quotation?.terms ?? "Standard freight terms apply.",
      discount:        quotation?.discount ?? 0,
      taxRate:         quotation?.tax_rate ?? 0.1,
    },
    mode: "onTouched",
  });

  const watchedDiscount = form.watch("discount");
  const watchedTaxRate  = form.watch("taxRate");
  const watchedStatus   = form.watch("status");

  const { subtotal, tax, total } = computeTotals(items, watchedDiscount, watchedTaxRate);

  // Mutations
  const createMut    = useCreateQuotation();
  const updateMut    = useUpdateQuotation(quotation?.id ?? "");
  const duplicateMut = useDuplicateQuotation();
  const pdfMut       = useGenerateQuotationPdf(quotation?.id ?? "");
  const convertMut   = useConvertQuotationToInvoice();

  const isSaving     = createMut.isPending || updateMut.isPending;
  const lineItemsRef = useRef<LineItemsTableHandle>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Mirrors decideAutoQuote's item-building on the backend (the auto/instant
  // quote path) exactly, so a quotation reads the same regardless of which
  // path priced it: base delivery charge, then weight surcharge if any,
  // then every additional charge the customer or admin selected.
  function buildPricedItems(breakdown: PriceBreakdown): FormItem[] {
    return [
      {
        description: `${breakdown.label} Delivery`,
        category:    "freight_charge",
        quantity:    1,
        unit:        "delivery",
        unit_price:  breakdown.deliveryCharge,
        amount:      breakdown.deliveryCharge,
        sort_order:  0,
      },
      ...(breakdown.weightCharge > 0 ? [{
        description: `Weight Surcharge (${breakdown.weightKg} kg × $${breakdown.weightPerKgRate.toFixed(2)}/kg)`,
        category:    "accessorial" as const,
        quantity:    1,
        unit:        "charge",
        unit_price:  breakdown.weightCharge,
        amount:      breakdown.weightCharge,
        sort_order:  1,
      }] : []),
      ...breakdown.additionalCharges.map((c, idx) => ({
        description: c.label,
        category:    "accessorial" as const,
        quantity:    1,
        unit:        "charge",
        unit_price:  c.amount,
        amount:      c.amount,
        sort_order:  idx + 2,
      })),
    ];
  }

  function handleApplyPricing(breakdown: PriceBreakdown) {
    const nextItems = buildPricedItems(breakdown);
    // Imperative — pushes the new rows into the table directly, which then
    // flows the change back up to our own `items` state through the
    // table's normal watch→onChange pipeline. Calling setItems() here
    // ourselves too would just be a second, redundant write racing the
    // first (see LineItemsTable.setItems for why a reactive prop-diff
    // approach here caused a render loop).
    lineItemsRef.current?.setItems(nextItems);
    toast.success("Pricing applied — review the line items below");
  }

  const calculateMut = useCalculatePrice();

  // Auto-price a manual quote request the moment admin opens it, instead of
  // requiring them to separately open the calculator, re-tick the same
  // additional-charge boxes the customer already picked, and click Apply.
  // That extra manual step was the actual bug behind "additional options
  // show as requested but never end up in the real line items" — it's easy
  // to forget, or to apply and then edit away by accident, and nothing ever
  // reconciled the two. Runs once per quotation (only while it still has no
  // items — admin's own edits afterward are never touched), so what the
  // customer asked for always becomes real priced line items automatically.
  useEffect(() => {
    if (!quotation || quotation.status !== "requested") return;
    if (items.length > 0) return;
    if (!quotation.service_type || !quotation.service_level || distanceKm == null) return;

    calculateMut
      .mutateAsync({
        serviceType:          quotation.service_type,
        serviceLevel:         quotation.service_level,
        distanceKm,
        weightKg:             quotation.weight_kg ?? undefined,
        additionalChargeKeys: quotation.requested_additional_charge_keys ?? [],
      })
      .then((res) => {
        lineItemsRef.current?.setItems(buildPricedItems(res.data));
        toast.success("Priced from the customer's request — review before sending");
      })
      .catch(() => {
        // Silent — admin can still price it manually via the calculator;
        // no need to block opening the quotation over this.
      });
    // Deliberately keyed only on the quotation id — must run once per
    // quotation, not re-run as distanceKm/items change during editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation?.id]);

  async function onSubmit(values: QuotationFormValues) {
    if (isAdmin && !isEdit && !selectedProfileId) {
      toast.error("Please select the corporate customer this quotation is for");
      return;
    }

    // Validate line items (separate sub-form)
    const itemsValid = await lineItemsRef.current?.validate() ?? true;
    if (!itemsValid) {
      toast.error("Please fix errors in line items before saving");
      lineItemsRef.current?.focusFirstError();
      return;
    }

    const dto = {
      status:          values.status,
      issueDate:       values.issueDate,
      expiryDate:      values.expiryDate || null,
      customerName:    values.customerName,
      customerCompany: values.customerCompany || null,
      customerEmail:   values.customerEmail || null,
      customerPhone:   values.customerPhone || null,
      billingAddress:  values.billingAddress || null,
      notes:           values.notes || null,
      terms:           values.terms || null,
      subtotal, discount: values.discount, taxRate: values.taxRate, tax, total,
      currency: "CAD",
      originAddress:      values.originAddress || null,
      destinationAddress: values.destinationAddress || null,
      originLat:          originCoords?.lat ?? null,
      originLng:          originCoords?.lng ?? null,
      destinationLat:     destinationCoords?.lat ?? null,
      destinationLng:     destinationCoords?.lng ?? null,
      distanceKm,
      originCity:          originParts.city || null,
      originState:         originParts.state || null,
      originPostcode:      originParts.postcode || null,
      destinationCity:     destinationParts.city || null,
      destinationState:    destinationParts.state || null,
      destinationPostcode: destinationParts.postcode || null,
      items,
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync(dto as UpdateQuotationDto);
        toast.success("Quotation saved");
      } else {
        const res = await createMut.mutateAsync({ ...dto, profileId: selectedProfileId ?? profileId, loadId: loadId ?? undefined } as CreateQuotationDto);
        toast.success("Quotation created");
        const newId = (res as any)?.data?.id;
        if (redirectTo && newId) router.push(redirectTo.replace("[id]", newId));
      }
    } catch (err) { toast.error((err as Error).message); }
  }

  async function handleGeneratePdf() {
    if (!quotation?.id) return;
    try {
      const res = await pdfMut.mutateAsync();
      const url = (res as any)?.data?.pdfUrl;
      if (url) window.open(url, "_blank");
      toast.success("PDF generated");
    } catch (err) { toast.error((err as Error).message); }
  }

  async function handleSendToCorporate() {
    if (!quotation?.id) return;
    try {
      await updateMut.mutateAsync({ status: "sent" } as UpdateQuotationDto);
      form.setValue("status", "sent");
      toast.success("Quotation sent to corporate");
    } catch (err) { toast.error((err as Error).message); }
  }

  async function handleDuplicate() {
    if (!quotation?.id) return;
    try {
      await duplicateMut.mutateAsync(quotation.id);
      toast.success("Quotation duplicated");
      router.push(isAdmin ? "/admin/quotations" : "/corporate/quotations");
    } catch (err) { toast.error((err as Error).message); }
  }

  async function handleConvert() {
    if (!quotation?.id) return;
    try {
      const res = await convertMut.mutateAsync(quotation.id);
      const newId = (res as any)?.data?.id;
      toast.success("Invoice created from quotation");
      if (newId) router.push(`${isAdmin ? "/admin" : "/corporate"}/invoices/${newId}`);
    } catch (err) { toast.error((err as Error).message); }
  }

  const backPath   = isAdmin ? "/admin/quotations" : "/corporate/quotations";
  const handleSave = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <div className="space-y-5 pb-24 sm:pb-0">

        {/* ── Desktop toolbar (hidden on mobile — actions are in the sticky bar) ── */}
        <div className="hidden sm:flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {quotation && <span className="text-xl font-bold text-foreground">{quotation.quotation_number}</span>}
            {quotation && <QuotationStatusBadge status={watchedStatus} />}
          </div>
          <div className="flex flex-wrap gap-2">
            {isEdit && (
              <>
                {quotation?.status === "draft" && (
                  <Button variant="outline" size="sm" onClick={handleSendToCorporate} disabled={updateMut.isPending}
                    className="h-8 rounded-lg border-primary/30 px-3 text-xs gap-1.5 text-primary">
                    <Send className="h-3.5 w-3.5" /> Send to Corporate
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateMut.isPending}
                  className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={handleConvert} disabled={convertMut.isPending}
                  className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5">
                  <FileOutput className="h-3.5 w-3.5" /> To Invoice
                </Button>
                <Button variant="outline" size="sm" onClick={handleGeneratePdf} disabled={pdfMut.isPending}
                  className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5">
                  {pdfMut.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <FileDown className="h-3.5 w-3.5" />}
                  {quotation?.pdf_url ? "Regenerate PDF" : "Generate PDF"}
                </Button>
                {quotation?.pdf_url && (
                  <Button variant="outline" size="sm" asChild className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5">
                    <a href={quotation.pdf_url} target="_blank" rel="noreferrer">
                      <FileDown className="h-3.5 w-3.5" /> Download
                    </a>
                  </Button>
                )}
              </>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving}
              className="h-8 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85 gap-1.5">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isEdit ? "Save Changes" : "Create Quotation"}
            </Button>
          </div>
        </div>

        {/* ── Linked delivery banner (mobile; sidebar shows on desktop) ── */}
        {(loadPrefill || quotation?.shipments) && (
          <div className="lg:hidden flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Linked Delivery</p>
              <p className="text-sm font-semibold text-foreground">
                {quotation?.shipments?.load_number ?? loadPrefill?.loadNumber}
              </p>
              <p className="text-xs text-muted">
                {quotation?.shipments
                  ? `${quotation.shipments.origin_city} → ${quotation.shipments.destination_city}`
                  : `${loadPrefill?.originCity}, ${loadPrefill?.originState} → ${loadPrefill?.destinationCity}, ${loadPrefill?.destinationState}`
                }
              </p>
            </div>
            {(loadId || quotation?.load_id) && (
              <Link
                href={`/${isAdmin ? "admin" : "corporate"}/deliveries/${quotation?.load_id ?? loadId}`}
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                View Delivery
              </Link>
            )}
          </div>
        )}

        {/* ── Main layout: left content + right sidebar ── */}
        <div className="grid gap-5 lg:grid-cols-1">

          {/* ── Form sections ── */}
          <div className="space-y-5 min-w-0">

            {/* Document Details */}
            <Section title="Document Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>
                        Issue Date <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <DatePicker
                          ref={field.ref}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Pick issue date"
                          error={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Expiry Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          ref={field.ref}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Pick expiry date"
                          error={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Status</FormLabel>
                      {field.value === "draft" || field.value === "sent" || field.value === "requested" ? (
                        <SearchableSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
                          options={QUOTATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                          searchPlaceholder="Search status…"
                        />
                      ) : (
                        <div className="flex h-10 items-center gap-2">
                          <QuotationStatusBadge status={field.value} />
                          <span className="text-xs text-muted">Set by the corporate customer</span>
                        </div>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* Customer Information */}
            <Section title="Customer Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {isAdmin && !isEdit && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className={fieldLabelCls}>
                      Corporate <span className="text-destructive">*</span>
                    </label>
                    <SearchableSelect
                      value={selectedAccountId ?? ""}
                      onValueChange={handleCorporateSelect}
                      options={corporateAccounts.map((a) => ({
                        value: a.account_id,
                        label: a.account_name,
                        icon: <CompanyLogo name={a.account_name} logoUrl={a.logo_url} size="xs" rounded="lg" />,
                      }))}
                      placeholder="Select the corporate customer this quotation is for…"
                      searchPlaceholder="Search shipping companies…"
                      emptyText="No active shipping companies"
                    />
                    <p className="text-xs text-muted">Selecting a corporate customer fills in the fields below and links the quotation to them.</p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>
                        Customer Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Full name"
                          className="h-10"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerCompany"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Company</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Company name"
                          className="h-10"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          value={field.value ?? ""}
                          placeholder="email@example.com"
                          className="h-10"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Phone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="+61 4xx xxx xxx"
                          className="h-10"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billingAddress"
                  render={({ field, fieldState }) => (
                    <FormItem className="sm:col-span-2 space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Billing Address</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          as="textarea"
                          rows={2}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Street, City, State, Postcode"
                          className="resize-none"
                          ariaInvalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* What the customer requested — read-only, only shown for a manual
                request that isn't linked to a delivery yet (quote.shipments is
                only ever set once one exists). Without this, admin had to
                switch to the read-only details view to see the customer's
                cargo/weight/pieces/service level before pricing it here. */}
            {(() => {
              if (!quotation || quotation.shipments || loadPrefill) return null;
              const requestedCharges = quotation.requested_additional_charge_keys ?? [];
              if (!quotation.service_type && !quotation.cargo_description && requestedCharges.length === 0) return null;

              return (
                <Section title="Customer Requested">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {quotation.service_type && (
                      <RequestTile icon={<Truck className="h-4 w-4" />} label="Service Type" value={LAST_MILE_SERVICE_TYPE_LABELS[quotation.service_type] ?? quotation.service_type} />
                    )}
                    {quotation.service_level && (
                      <RequestTile icon={<ClipboardList className="h-4 w-4" />} label="Service Level" value={quotation.service_level} />
                    )}
                    {quotation.cargo_description && (
                      <div className="sm:col-span-2">
                        <RequestTile icon={<Package className="h-4 w-4" />} label="Delivery Description" value={quotation.cargo_description} />
                      </div>
                    )}
                    {quotation.pieces != null && (
                      <RequestTile icon={<Package className="h-4 w-4" />} label="Number of Packages" value={String(quotation.pieces)} />
                    )}
                    {quotation.weight_kg != null && (
                      <RequestTile icon={<Weight className="h-4 w-4" />} label="Weight" value={`${quotation.weight_kg} kg`} />
                    )}
                    {quotation.preferred_delivery_date && (
                      <RequestTile icon={<Calendar className="h-4 w-4" />} label="Preferred Delivery Date" value={new Date(quotation.preferred_delivery_date).toLocaleDateString("en-CA", { day: "2-digit", month: "short", year: "numeric" })} />
                    )}
                    {requestedCharges.length > 0 && (
                      <div className="sm:col-span-2">
                        <RequestTile
                          icon={<Gift className="h-4 w-4" />}
                          label="Requested Additional Options"
                          value={requestedCharges.map(chargeLabel).join(", ")}
                        />
                      </div>
                    )}
                  </div>
                </Section>
              );
            })()}

            {/* Origin & Destination */}
            <Section title="Origin & Destination">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="originAddress"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Origin Address</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          as="textarea"
                          rows={2}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={() => { field.onBlur(); handleAddressBlur("origin", field.value ?? ""); }}
                          onSelect={(s) => handleAddressSelect("origin", s)}
                          placeholder="Street, City, Province, Postal Code"
                          className="resize-none"
                          ariaInvalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destinationAddress"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Destination Address</FormLabel>
                      <FormControl>
                        <AddressAutocomplete
                          as="textarea"
                          rows={2}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={() => { field.onBlur(); handleAddressBlur("destination", field.value ?? ""); }}
                          onSelect={(s) => handleAddressSelect("destination", s)}
                          placeholder="Street, City, Province, Postal Code"
                          className="resize-none"
                          ariaInvalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <RouteIcon className="h-3.5 w-3.5" />
                {geocoding ? (
                  <span>Locating {geocoding} address…</span>
                ) : distanceKm != null ? (
                  <span className="font-semibold text-foreground">≈ {distanceKm} km</span>
                ) : (
                  <span>Distance appears once both addresses are located</span>
                )}
              </div>
            </Section>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCalculatorOpen(true)}
                  className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5"
                >
                  <Calculator className="h-3.5 w-3.5" /> Price with Calculator
                </Button>
              </div>
              <LineItemsTable ref={lineItemsRef} items={items} onChange={setItems} />
            </div>

            {/* Notes & Terms */}
            <Section title="Notes & Terms">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Notes for the customer…"
                          rows={4}
                          className="resize-none"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={fieldLabelCls}>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Standard terms…"
                          rows={4}
                          className="resize-none"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* Pricing Summary (below form on mobile; in sidebar on lg) */}
            <div className="lg:hidden">
              <PricingSummary
                subtotal={subtotal} discount={watchedDiscount} taxRate={watchedTaxRate} tax={tax} total={total}
                itemsCount={items.length} distanceKm={distanceKm}
                onDiscountChange={(v) => form.setValue("discount", v, { shouldValidate: true, shouldDirty: true })}
                onTaxRateChange={(v) => form.setValue("taxRate", v, { shouldValidate: true, shouldDirty: true })}
              />
            </div>
          </div>

          {/* ── Sticky sidebar (desktop only) ── */}
          <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:self-start lg:sticky lg:top-24">

            {/* Totals (merged with what used to be a separate "Summary" card — they showed the same numbers) */}
            <PricingSummary
              subtotal={subtotal} discount={watchedDiscount} taxRate={watchedTaxRate} tax={tax} total={total}
              itemsCount={items.length} distanceKm={distanceKm}
              onDiscountChange={(v) => form.setValue("discount", v, { shouldValidate: true, shouldDirty: true })}
              onTaxRateChange={(v) => form.setValue("taxRate", v, { shouldValidate: true, shouldDirty: true })}
            />

            {/* Delivery reference */}
            {(quotation?.shipments || loadPrefill) && (
              <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 shadow-sm">
                <div className="border-b border-primary/15 px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">Linked Delivery</h3>
                </div>
                <div className="px-5 py-4 text-sm">
                  <p className="font-semibold text-foreground">
                    {quotation?.shipments?.load_number ?? loadPrefill?.loadNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {quotation?.shipments
                      ? `${quotation.shipments.origin_city} → ${quotation.shipments.destination_city}`
                      : `${loadPrefill?.originCity}, ${loadPrefill?.originState} → ${loadPrefill?.destinationCity}, ${loadPrefill?.destinationState}`
                    }
                  </p>
                  {(loadId || quotation?.load_id) && (
                    <Link
                      href={`/${isAdmin ? "admin" : "corporate"}/deliveries/${quotation?.load_id ?? loadId}`}
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      View Delivery →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile sticky action bar (visible only below sm) ── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t border-card-border bg-card/95 backdrop-blur-xl px-4 py-3 safe-area-pb">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(backPath)}
              className="h-10 flex-shrink-0 rounded-xl border-card-border px-3 text-sm gap-1.5">
              <X className="h-4 w-4" />
            </Button>
            {isEdit && quotation?.pdf_url && (
              <Button variant="outline" size="sm" asChild
                className="h-10 flex-shrink-0 rounded-xl border-card-border px-3 text-sm gap-1.5">
                <a href={quotation.pdf_url} target="_blank" rel="noreferrer" title="Download PDF">
                  <FileDown className="h-4 w-4" />
                </a>
              </Button>
            )}
            {isEdit && (
              <Button variant="outline" size="sm" onClick={handleGeneratePdf} disabled={pdfMut.isPending}
                className="h-10 flex-shrink-0 rounded-xl border-card-border px-3 text-sm gap-1.5">
                {pdfMut.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <FileDown className="h-4 w-4" />}
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={isSaving}
              className="h-10 flex-1 rounded-xl bg-primary text-sm text-sidebar hover:bg-primary/85 gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Save Changes" : "Create Quotation"}
            </Button>
          </div>
          {/* Live total on mobile bar */}
          <p className="mt-2 text-center text-xs text-muted tabular-nums">
            {items.length} item{items.length !== 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-primary">
              {new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(total)}
            </span>
          </p>
        </div>
      </div>

      <PricingCalculatorDialog
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        pickupAddress={form.watch("originAddress") ?? undefined}
        deliveryAddress={form.watch("destinationAddress") ?? undefined}
        onApply={handleApplyPricing}
        initialSelectedChargeKeys={quotation?.requested_additional_charge_keys}
      />
    </Form>
  );
}
