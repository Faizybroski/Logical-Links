"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Copy,
  FileDown,
  ChevronRight,
  Loader2,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Truck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { InvoiceStatusBadge } from "@/components/documents/document-status-badge";
import { LineItemsTable } from "@/components/documents/line-items-table";
import { PricingSummary } from "@/components/documents/pricing-summary";
import { PdfActionsCard } from "@/components/documents/pdf-actions-card";
import {
  useInvoice,
  useDuplicateInvoice,
  useGenerateInvoicePdf,
} from "@/hooks/use-invoices";
import type { LineItem } from "@/types/api.types";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(n);
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-card-border bg-background p-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground break-words">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: res, isLoading } = useInvoice(id);
  const invoice = res?.data;

  const duplicateMut = useDuplicateInvoice();
  const pdfMut = useGenerateInvoicePdf(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted">Invoice not found.</p>
        <Link href="/admin/invoices" className="text-sm text-primary underline">
          Back to invoices
        </Link>
      </div>
    );
  }

  const items: Omit<LineItem, "id" | "created_at" | "updated_at">[] = (
    invoice.invoice_items ?? []
  ).map((i) => ({
    description: i.description,
    category: i.category,
    quantity: i.quantity,
    unit: i.unit,
    unit_price: i.unit_price,
    amount: i.amount,
    notes: i.notes ?? undefined,
    sort_order: i.sort_order,
  }));

  async function handleDuplicate() {
    try {
      await duplicateMut.mutateAsync(id);
      toast.success("Invoice duplicated");
      router.push("/admin/invoices");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleGeneratePdf() {
    try {
      await pdfMut.mutateAsync();
      toast.success("PDF generated successfully");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
            <Link
              href="/admin/invoices"
              className="hover:text-foreground transition-colors"
            >
              Invoices
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{invoice.invoice_number}</span>
          </nav>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/invoices"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">
                  {invoice.invoice_number}
                </h1>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={duplicateMut.isPending}
                className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGeneratePdf}
                disabled={pdfMut.isPending}
                className="h-8 rounded-lg border-card-border px-3 text-xs gap-1.5"
              >
                {pdfMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <FileDown className="h-3.5 w-3.5" />
                )}
                {invoice.pdf_url ? "Regenerate PDF" : "Generate PDF"}
              </Button>
              <Button
                asChild
                size="sm"
                // onClick={() => router.push(`/admin/invoices/${id}/edit`)}
                className="h-8 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85 gap-1.5"
              >
                <Link href={`/admin/invoices/${id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit{" "}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-2 sm:py-8 space-y-6">
        {/* Dates strip */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
          <div className="grid grid-cols-1 divide-y divide-card-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { label: "Issue Date", value: fmtDate(invoice.issue_date) },
              { label: "Due Date", value: fmtDate(invoice.due_date) },
              { label: "Currency", value: invoice.currency },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-4 sm:py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  {label}
                </p>
                <p className="mt-1.5 text-base font-semibold text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
              <div className="border-b border-card-border px-5 py-4 sm:px-6">
                <h2 className="text-sm font-semibold text-foreground">
                  Customer Information
                </h2>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                <InfoTile
                  icon={<User className="h-4 w-4" />}
                  label="Name"
                  value={invoice.customer_name}
                />
                <InfoTile
                  icon={<Building2 className="h-4 w-4" />}
                  label="Company"
                  value={invoice.customer_company}
                />
                <InfoTile
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={invoice.customer_email}
                />
                <InfoTile
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={invoice.customer_phone}
                />
                {invoice.billing_address && (
                  <div className="sm:col-span-2">
                    <InfoTile
                      icon={<MapPin className="h-4 w-4" />}
                      label="Billing Address"
                      value={invoice.billing_address}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Line Items
              </h2>
              <LineItemsTable items={items} onChange={() => {}} readOnly />
            </div>

            {invoice.payment_instructions && (
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-5 py-4 sm:px-6">
                  <h2 className="text-sm font-semibold text-foreground">
                    Payment Instructions
                  </h2>
                </div>
                <div className="px-5 py-5 sm:px-6">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {invoice.payment_instructions}
                  </p>
                </div>
              </div>
            )}

            {(invoice.notes || invoice.terms) && (
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-5 py-4 sm:px-6">
                  <h2 className="text-sm font-semibold text-foreground">
                    Notes & Terms
                  </h2>
                </div>
                <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
                  {invoice.notes && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                        Notes
                      </p>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                        {invoice.notes}
                      </p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                        Terms
                      </p>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                        {invoice.terms}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <PricingSummary
              subtotal={invoice.subtotal}
              discount={invoice.discount}
              taxRate={invoice.tax_rate}
              tax={invoice.tax}
              total={invoice.total}
              amountPaid={invoice.amount_paid}
              balanceDue={invoice.balance_due}
              readOnly
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:self-start">
            {/* PDF Document card */}
            <PdfActionsCard
              pdfUrl={invoice.pdf_url ?? null}
              filename={`invoice-${invoice.invoice_number}.pdf`}
            />

            <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
              <div className="border-b border-card-border px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Payment
                </h3>
              </div>
              <div className="space-y-0">
                {[
                  { label: "Total", value: fmtCurrency(invoice.total) },
                  {
                    label: "Amount Paid",
                    value: fmtCurrency(invoice.amount_paid),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-card-border px-5 py-3"
                  >
                    <span className="text-sm text-muted">{label}</span>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
                <div
                  className={`flex items-center justify-between px-5 py-4 ${invoice.balance_due > 0 ? "bg-danger/5" : "bg-green-500/5"}`}
                >
                  <span className="text-sm font-semibold text-foreground">
                    Balance Due
                  </span>
                  <span
                    className={`text-base font-bold tabular-nums ${invoice.balance_due > 0 ? "text-danger" : "text-green-600"}`}
                  >
                    {fmtCurrency(invoice.balance_due)}
                  </span>
                </div>
              </div>
            </div>

            {invoice.shipments && (
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Load Reference
                  </h3>
                </div>
                <div className="space-y-3 p-4 sm:p-5">
                  <InfoTile
                    icon={<DollarSign className="h-4 w-4" />}
                    label={invoice.shipments.load_number}
                    value={`${invoice.shipments.origin_city} → ${invoice.shipments.destination_city}`}
                  />
                  {invoice.shipments.accounts && (
                    <InfoTile
                      icon={<CompanyLogo name={invoice.shipments.accounts.account_name} logoUrl={invoice.shipments.accounts.logo_url} size="sm" rounded="lg" />}
                      label="Assigned Company"
                      value={invoice.shipments.accounts.account_name}
                    />
                  )}
                  {invoice.shipments.profiles && (
                    <InfoTile
                      icon={<UserAvatar name={invoice.shipments.profiles.full_name} avatarUrl={invoice.shipments.profiles.avatar_url} size="sm" rounded="lg" />}
                      label="Assigned Employee"
                      value={invoice.shipments.profiles.full_name ?? "—"}
                    />
                  )}
                </div>
              </div>
            )}

            {invoice.quotations && (
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    From Quotation
                  </h3>
                </div>
                <div className="px-5 py-4">
                  <Link
                    href={`/admin/quotations/${invoice.quotation_id}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {invoice.quotations.quotation_number}
                  </Link>
                </div>
              </div>
            )}

            {invoice.profiles && (
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Created By
                  </h3>
                </div>
                <div className="p-4 sm:p-5">
                  <InfoTile
                    icon={<UserAvatar name={invoice.profiles.full_name} avatarUrl={invoice.profiles.avatar_url} size="sm" rounded="lg" />}
                    label="Shipper"
                    value={invoice.profiles.full_name ?? "—"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
