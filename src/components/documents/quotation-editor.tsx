"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Save, FileDown, Copy, Send, Loader2, X, Truck } from "lucide-react";
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
import type {
  Quotation,
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationStatus,
  LineItem,
} from "@/types/api.types";
import {
  useCreateQuotation,
  useUpdateQuotation,
  useDuplicateQuotation,
  useGenerateQuotationPdf,
} from "@/hooks/use-quotations";
import { useConvertQuotationToInvoice } from "@/hooks/use-invoices";

// ── Schema ────────────────────────────────────────────────────────────────────

const QUOTATION_STATUS_VALUES = [
  "draft", "sent", "accepted", "rejected", "expired",
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

const QUOTATION_STATUSES: { value: QuotationStatus; label: string }[] = [
  { value: "draft",    label: "Draft"    },
  { value: "sent",     label: "Sent"     },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired",  label: "Expired"  },
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

// ── Props ─────────────────────────────────────────────────────────────────────

export interface LoadPrefill {
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
  loadPrefill?: LoadPrefill;
}

// ── Editor ────────────────────────────────────────────────────────────────────

export function QuotationEditor({ profileId, quotation, redirectTo, isAdmin, loadId, loadPrefill }: Props) {
  const router = useRouter();
  const isEdit = !!quotation;

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
        { description: "Freight Charge", category: "freight_charge" as const, quantity: 1, unit: "load", unit_price: 0, amount: 0, sort_order: 0 },
        { description: "Fuel Surcharge",  category: "fuel_surcharge"  as const, quantity: 1, unit: "load", unit_price: 0, amount: 0, sort_order: 1 },
      ];
    }
    return [];
  });

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

  async function onSubmit(values: QuotationFormValues) {
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
      currency: "AUD",
      items,
    };

    try {
      if (isEdit) {
        await updateMut.mutateAsync(dto as UpdateQuotationDto);
        toast.success("Quotation saved");
      } else {
        const res = await createMut.mutateAsync({ ...dto, profileId, loadId: loadId ?? undefined } as CreateQuotationDto);
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

  async function handleDuplicate() {
    if (!quotation?.id) return;
    try {
      await duplicateMut.mutateAsync(quotation.id);
      toast.success("Quotation duplicated");
      router.push(isAdmin ? "/admin/quotations" : "/shipper/quotations");
    } catch (err) { toast.error((err as Error).message); }
  }

  async function handleConvert() {
    if (!quotation?.id) return;
    try {
      const res = await convertMut.mutateAsync(quotation.id);
      const newId = (res as any)?.data?.id;
      toast.success("Invoice created from quotation");
      if (newId) router.push(`${isAdmin ? "/admin" : "/shipper"}/invoices/${newId}`);
    } catch (err) { toast.error((err as Error).message); }
  }

  const backPath   = isAdmin ? "/admin/quotations" : "/shipper/quotations";
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
                <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateMut.isPending}
                  className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={handleConvert} disabled={convertMut.isPending}
                  className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5">
                  <Send className="h-3.5 w-3.5" /> To Invoice
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

        {/* ── Linked load banner (mobile; sidebar shows on desktop) ── */}
        {(loadPrefill || quotation?.shipments) && (
          <div className="lg:hidden flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Linked Load</p>
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
                href={`/${isAdmin ? "admin" : "shipper"}/loads/${quotation?.load_id ?? loadId}`}
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                View Load
              </Link>
            )}
          </div>
        )}

        {/* ── Main layout: left content + right sidebar ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_272px]">

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
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        options={QUOTATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                        searchPlaceholder="Search status…"
                      />
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* Customer Information */}
            <Section title="Customer Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          placeholder="Street, City, State, Postcode"
                          rows={2}
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

            {/* Line Items */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
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
                onDiscountChange={(v) => form.setValue("discount", v, { shouldValidate: true, shouldDirty: true })}
                onTaxRateChange={(v) => form.setValue("taxRate", v, { shouldValidate: true, shouldDirty: true })}
              />
            </div>
          </div>

          {/* ── Sticky sidebar (desktop only) ── */}
          <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:self-start lg:sticky lg:top-24">

            {/* Live totals */}
            <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
              <div className="border-b border-card-border px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              </div>
              <div className="space-y-0">
                {[
                  { label: "Items",    value: String(items.length), mono: false },
                  { label: "Subtotal", value: new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(subtotal), mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between border-b border-card-border px-5 py-3">
                    <span className="text-sm text-muted">{label}</span>
                    <span className={`text-sm font-semibold text-foreground ${mono ? "tabular-nums" : ""}`}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-primary/5 px-5 py-4">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-base font-bold text-primary tabular-nums">
                    {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing controls (discount + tax) */}
            <PricingSummary
              subtotal={subtotal} discount={watchedDiscount} taxRate={watchedTaxRate} tax={tax} total={total}
              onDiscountChange={(v) => form.setValue("discount", v, { shouldValidate: true, shouldDirty: true })}
              onTaxRateChange={(v) => form.setValue("taxRate", v, { shouldValidate: true, shouldDirty: true })}
            />

            {/* Load reference */}
            {(quotation?.shipments || loadPrefill) && (
              <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 shadow-sm">
                <div className="border-b border-primary/15 px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">Linked Load</h3>
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
                      href={`/${isAdmin ? "admin" : "shipper"}/loads/${quotation?.load_id ?? loadId}`}
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      View Load →
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
              {new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(total)}
            </span>
          </p>
        </div>
      </div>
    </Form>
  );
}
