"use client";

import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  X, Pencil, Copy, FileDown, Loader2,
  User, Building2, Mail, Phone, MapPin, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
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
  return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-card-border bg-background p-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

interface InvoiceDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  onEditClick: (id: string) => void;
}

export function InvoiceDetailsSheet({ open, onClose, invoiceId, onEditClick }: InvoiceDetailsSheetProps) {
  const router   = useRouter();
  const pathname = usePathname();

  const { data: res, isLoading } = useInvoice(invoiceId);
  const invoice = res?.data;

  const duplicateMut = useDuplicateInvoice();
  const pdfMut       = useGenerateInvoicePdf(invoiceId);

  const quotationBasePath = pathname.startsWith("/admin") ? "/admin/quotations" : "/shipper/quotations";

  async function handleDuplicate() {
    try {
      await duplicateMut.mutateAsync(invoiceId);
      toast.success("Invoice duplicated");
      onClose();
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleGeneratePdf() {
    try {
      await pdfMut.mutateAsync();
      toast.success("PDF generated successfully");
    } catch (e) { toast.error((e as Error).message); }
  }

  const items: Omit<LineItem, "id" | "created_at" | "updated_at">[] =
    (invoice?.invoice_items ?? []).map((i) => ({
      description: i.description, category: i.category, quantity: i.quantity,
      unit: i.unit, unit_price: i.unit_price, amount: i.amount,
      notes: i.notes ?? undefined, sort_order: i.sort_order,
    }));

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">
              {invoice?.invoice_number ?? "Invoice"}
            </h2>
            {invoice && <InvoiceStatusBadge status={invoice.status} />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateMut.isPending}
              className="h-8 rounded-lg border-card-border px-2.5 text-xs gap-1">
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Duplicate</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleGeneratePdf} disabled={!invoice || pdfMut.isPending}
              className="h-8 rounded-lg border-card-border px-2.5 text-xs gap-1">
              {pdfMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{invoice?.pdf_url ? "Regen PDF" : "Gen PDF"}</span>
            </Button>
            <Button size="sm" onClick={() => invoice && onEditClick(invoice.id)}
              disabled={!invoice}
              className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85 gap-1">
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="outline" size="icon" onClick={onClose} className="h-8 w-8 border-card-border">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !invoice ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted">Invoice not found.</p>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* Dates strip */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="grid grid-cols-3 divide-x divide-card-border">
                  {[
                    { label: "Issue Date", value: fmtDate(invoice.issue_date) },
                    { label: "Due Date", value: fmtDate(invoice.due_date) },
                    { label: "Currency", value: invoice.currency },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer info */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">Customer Information</h3>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <InfoTile icon={<User className="h-4 w-4" />} label="Name" value={invoice.customer_name} />
                  <InfoTile icon={<Building2 className="h-4 w-4" />} label="Company" value={invoice.customer_company} />
                  <InfoTile icon={<Mail className="h-4 w-4" />} label="Email" value={invoice.customer_email} />
                  <InfoTile icon={<Phone className="h-4 w-4" />} label="Phone" value={invoice.customer_phone} />
                  {invoice.billing_address && (
                    <div className="sm:col-span-2">
                      <InfoTile icon={<MapPin className="h-4 w-4" />} label="Billing Address" value={invoice.billing_address} />
                    </div>
                  )}
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
                <LineItemsTable items={items} onChange={() => {}} readOnly />
              </div>

              {/* Payment instructions */}
              {invoice.payment_instructions && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Payment Instructions</h3>
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{invoice.payment_instructions}</p>
                  </div>
                </div>
              )}

              {/* Notes & Terms */}
              {(invoice.notes || invoice.terms) && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Notes & Terms</h3>
                  </div>
                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    {invoice.notes && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Notes</p>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{invoice.notes}</p>
                      </div>
                    )}
                    {invoice.terms && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Terms</p>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{invoice.terms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing summary */}
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

              {/* PDF card */}
              <PdfActionsCard pdfUrl={invoice.pdf_url ?? null} filename={`invoice-${invoice.invoice_number}.pdf`} />

              {/* Payment summary */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground">Payment</h3>
                </div>
                <div>
                  {[
                    { label: "Total", value: fmtCurrency(invoice.total) },
                    { label: "Amount Paid", value: fmtCurrency(invoice.amount_paid) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between border-b border-card-border px-5 py-3">
                      <span className="text-sm text-muted">{label}</span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
                    </div>
                  ))}
                  <div className={`flex items-center justify-between px-5 py-4 ${invoice.balance_due > 0 ? "bg-danger/5" : "bg-green-500/5"}`}>
                    <span className="text-sm font-semibold text-foreground">Balance Due</span>
                    <span className={`text-base font-bold tabular-nums ${invoice.balance_due > 0 ? "text-danger" : "text-green-600"}`}>
                      {fmtCurrency(invoice.balance_due)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Load reference */}
              {invoice.shipments && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Load Reference</h3>
                  </div>
                  <div className="space-y-3 p-4">
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

              {/* From quotation */}
              {invoice.quotations && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">From Quotation</h3>
                  </div>
                  <div className="px-5 py-4">
                    <button
                      onClick={() => router.push(`${quotationBasePath}?details=${invoice.quotation_id}`)}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {invoice.quotations.quotation_number}
                    </button>
                  </div>
                </div>
              )}

              {/* Created by */}
              {invoice.profiles && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Created By</h3>
                  </div>
                  <div className="p-4">
                    <InfoTile
                      icon={<UserAvatar name={invoice.profiles.full_name} avatarUrl={invoice.profiles.avatar_url} size="sm" rounded="lg" />}
                      label="Shipper"
                      value={invoice.profiles.full_name ?? "—"}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
