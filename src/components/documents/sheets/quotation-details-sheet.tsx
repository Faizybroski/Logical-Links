"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  X, Pencil, Copy, Send, FileDown, Loader2,
  User, Building2, Mail, Phone, MapPin, DollarSign, Truck,
  CheckCircle2, XCircle, ShieldCheck, Calendar,
  Package, Weight, ClipboardList, Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { QuotationStatusBadge } from "@/components/documents/document-status-badge";
import { LineItemsTable } from "@/components/documents/line-items-table";
import { PricingSummary } from "@/components/documents/pricing-summary";
import { PdfActionsCard } from "@/components/documents/pdf-actions-card";
import { TermsAcceptanceModal, TERMS_VERSION } from "@/components/documents/terms-acceptance-modal";
import { LAST_MILE_SERVICE_TYPE_LABELS } from "@/components/loads/sheets/load-form-fields";
import {
  useQuotation,
  useDuplicateQuotation,
  useGenerateQuotationPdf,
  useAcceptQuotation,
  useDeclineQuotation,
} from "@/hooks/use-quotations";
import { useConvertQuotationToInvoice } from "@/hooks/use-invoices";
import { useRewardsCreditBalance, useApplyRewardsCredit } from "@/hooks/use-rewards-credit";
import { useAuthStore } from "@/store/auth.store";
import type { LineItem } from "@/types/api.types";

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);
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

interface QuotationDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  quotationId: string;
  onEditClick: (id: string) => void;
}

export function QuotationDetailsSheet({ open, onClose, quotationId, onEditClick }: QuotationDetailsSheetProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isShipper = user?.role === "shipper";
  const isResidential = user?.role === "residential";

  const { data: res, isLoading } = useQuotation(quotationId);
  const quotation = res?.data;

  const duplicateMut = useDuplicateQuotation();
  const pdfMut       = useGenerateQuotationPdf(quotationId);
  const convertMut   = useConvertQuotationToInvoice();
  const acceptMut    = useAcceptQuotation(quotationId);
  const declineMut   = useDeclineQuotation(quotationId);

  const [termsOpen, setTermsOpen] = useState(false);

  const invoiceBasePath = pathname.startsWith("/admin") ? "/admin/invoices" : "/shipper/invoices";

  async function handleDuplicate() {
    try {
      await duplicateMut.mutateAsync(quotationId);
      toast.success("Quotation duplicated");
      onClose();
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleGeneratePdf() {
    try {
      await pdfMut.mutateAsync();
      toast.success("PDF generated successfully");
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleConvert() {
    try {
      const r = await convertMut.mutateAsync(quotationId);
      const newId = (r as any)?.data?.id;
      toast.success("Invoice created");
      if (newId) router.push(`${invoiceBasePath}?details=${newId}`);
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleConfirmAccept() {
    try {
      await acceptMut.mutateAsync({ termsVersion: TERMS_VERSION, acknowledged: true });
      toast.success("Quotation accepted");
      setTermsOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  async function handleDecline() {
    if (!window.confirm("Decline this quotation? This cannot be undone.")) return;
    try {
      await declineMut.mutateAsync();
      toast.success("Quotation declined");
    } catch (e) { toast.error((e as Error).message); }
  }

  const acceptance = quotation?.quotation_acceptances?.[0];
  const canActOnQuotation = (isShipper || isResidential) && quotation?.status === "sent";

  const rewardsBalanceQuery = useRewardsCreditBalance({ enabled: isResidential && open });
  const rewardsBalance = rewardsBalanceQuery.data?.data.balance ?? 0;
  const applyRewardsMut = useApplyRewardsCredit(quotationId);
  const [applyRewards, setApplyRewards] = useState(false);
  const rewardsAlreadyApplied = (quotation?.rewards_credit_applied ?? 0) > 0;

  useEffect(() => {
    setApplyRewards(rewardsAlreadyApplied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation?.id, rewardsAlreadyApplied]);

  async function handleApplyRewardsToggle(checked: boolean) {
    setApplyRewards(checked);
    if (!checked || rewardsAlreadyApplied) return;
    try {
      await applyRewardsMut.mutateAsync();
      toast.success("Rewards Credit applied");
    } catch (e) {
      toast.error((e as Error).message);
      setApplyRewards(false);
    }
  }

  const items: Omit<LineItem, "id" | "created_at" | "updated_at">[] =
    (quotation?.quotation_items ?? []).map((i) => ({
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
              {quotation?.quotation_number ?? "Quotation"}
            </h2>
            {quotation && <QuotationStatusBadge status={quotation.status} />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {!isShipper && (
              <>
                <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateMut.isPending}
                  className="h-8 rounded-lg border-card-border px-2.5 text-xs gap-1">
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Duplicate</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleConvert} disabled={convertMut.isPending}
                  className="h-8 rounded-lg border-card-border px-2.5 text-xs gap-1">
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">To Invoice</span>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleGeneratePdf} disabled={!quotation || pdfMut.isPending}
              className="h-8 rounded-lg border-card-border px-2.5 text-xs gap-1">
              {pdfMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{quotation?.pdf_url ? "Regen PDF" : "Gen PDF"}</span>
            </Button>
            {!isShipper && (
              <Button size="sm" onClick={() => quotation && onEditClick(quotation.id)}
                disabled={!quotation}
                className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85 gap-1">
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
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
          ) : !quotation ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted">Quotation not found.</p>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* Dates strip */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="grid grid-cols-3 divide-x divide-card-border">
                  {[
                    { label: "Issue Date", value: fmtDate(quotation.issue_date) },
                    { label: "Expiry Date", value: fmtDate(quotation.expiry_date) },
                    { label: "Currency", value: quotation.currency },
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
                  <InfoTile icon={<User className="h-4 w-4" />} label="Name" value={quotation.customer_name} />
                  <InfoTile icon={<Building2 className="h-4 w-4" />} label="Company" value={quotation.customer_company} />
                  <InfoTile icon={<Mail className="h-4 w-4" />} label="Email" value={quotation.customer_email} />
                  <InfoTile icon={<Phone className="h-4 w-4" />} label="Phone" value={quotation.customer_phone} />
                  {quotation.billing_address && (
                    <div className="sm:col-span-2">
                      <InfoTile icon={<MapPin className="h-4 w-4" />} label="Billing Address" value={quotation.billing_address} />
                    </div>
                  )}
                </div>
              </div>

              {/* Shipment Details — pulled from the linked booking, not typed in by hand */}
              {quotation.shipments ? (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Shipment Details</h3>
                    <p className="mt-0.5 text-xs text-muted">What the customer requested, pulled from their booking</p>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <InfoTile
                      icon={<Truck className="h-4 w-4" />}
                      label="Service Type"
                      value={quotation.shipments.service_type ? (LAST_MILE_SERVICE_TYPE_LABELS[quotation.shipments.service_type] ?? quotation.shipments.service_type) : quotation.shipments.shipment_type}
                    />
                    {quotation.shipments.service_level && (
                      <InfoTile icon={<ClipboardList className="h-4 w-4" />} label="Service Level" value={quotation.shipments.service_level} />
                    )}
                    <InfoTile icon={<MapPin className="h-4 w-4" />} label="Pickup Address" value={quotation.shipments.origin_address} />
                    <InfoTile icon={<MapPin className="h-4 w-4" />} label="Delivery Address" value={quotation.shipments.destination_address} />
                    <div className="sm:col-span-2">
                      <InfoTile icon={<Package className="h-4 w-4" />} label="Shipment Description" value={quotation.shipments.cargo_description} />
                    </div>
                    {quotation.shipments.pieces != null && (
                      <InfoTile icon={<Package className="h-4 w-4" />} label="Number of Packages" value={String(quotation.shipments.pieces)} />
                    )}
                    {quotation.shipments.package_type && (
                      <InfoTile icon={<Package className="h-4 w-4" />} label="Package Type" value={quotation.shipments.package_type} />
                    )}
                    {quotation.shipments.weight_kg != null && (
                      <InfoTile icon={<Weight className="h-4 w-4" />} label="Weight" value={`${quotation.shipments.weight_kg} kg`} />
                    )}
                    {quotation.shipments.preferred_delivery_date && (
                      <InfoTile icon={<Calendar className="h-4 w-4" />} label="Preferred Delivery Date" value={fmtDate(quotation.shipments.preferred_delivery_date)} />
                    )}
                    {quotation.shipments.estimated_delivery_date && (
                      <InfoTile icon={<Calendar className="h-4 w-4" />} label="Estimated Delivery Date" value={fmtDate(quotation.shipments.estimated_delivery_date)} />
                    )}
                    {quotation.shipments.special_instructions && (
                      <div className="sm:col-span-2">
                        <InfoTile icon={<ClipboardList className="h-4 w-4" />} label="Special Instructions" value={quotation.shipments.special_instructions} />
                      </div>
                    )}
                  </div>
                </div>
              ) : (quotation.origin_address || quotation.destination_address) && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Origin & Destination</h3>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <InfoTile icon={<MapPin className="h-4 w-4" />} label="Origin" value={quotation.origin_address} />
                    <InfoTile icon={<MapPin className="h-4 w-4" />} label="Destination" value={quotation.destination_address} />
                    {quotation.distance_km != null && (
                      <div className="sm:col-span-2">
                        <InfoTile icon={<Truck className="h-4 w-4" />} label="Distance" value={`≈ ${quotation.distance_km} km`} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Line items */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
                <LineItemsTable items={items} onChange={() => {}} readOnly />
              </div>

              {/* Notes & Terms */}
              {(quotation.notes || quotation.terms) && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Notes & Terms</h3>
                  </div>
                  <div className="grid gap-5 p-5 sm:grid-cols-2">
                    {quotation.notes && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Notes</p>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{quotation.notes}</p>
                      </div>
                    )}
                    {quotation.terms && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Terms</p>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{quotation.terms}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rewards Credit — residential customers only */}
              {isResidential && (rewardsBalance > 0 || rewardsAlreadyApplied) && quotation.status !== "draft" && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      Rewards Credit
                    </h3>
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="text-sm text-foreground">
                      Rewards Credit Available: <span className="font-semibold">${rewardsBalance.toFixed(2)}</span>
                    </p>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <Checkbox
                        checked={applyRewards}
                        disabled={rewardsAlreadyApplied || applyRewardsMut.isPending || quotation.status !== "sent"}
                        onCheckedChange={(checked) => handleApplyRewardsToggle(checked === true)}
                      />
                      Apply My Rewards Credit
                    </label>
                    {rewardsAlreadyApplied && (
                      <div className="space-y-1 rounded-lg border border-card-border bg-background p-3 text-sm">
                        <div className="flex items-center justify-between text-muted">
                          <span>Original Quote Amount</span>
                          <span>${quotation.total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted">
                          <span>Rewards Credit Applied</span>
                          <span>−${quotation.rewards_credit_applied.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-card-border pt-1.5 font-semibold text-foreground">
                          <span>Total Amount Due</span>
                          <span>${(quotation.total - quotation.rewards_credit_applied).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Totals (merged with what used to be a separate "Summary" card — they showed the same numbers) */}
              <PricingSummary
                subtotal={quotation.subtotal}
                discount={quotation.discount}
                taxRate={quotation.tax_rate}
                tax={quotation.tax}
                total={quotation.total}
                itemsCount={items.length}
                readOnly
              />

              {/* PDF card */}
              <PdfActionsCard pdfUrl={quotation.pdf_url ?? null} filename={`quotation-${quotation.quotation_number}.pdf`} />

              {/* Load reference */}
              {quotation.shipments && (
                <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                  <div className="border-b border-card-border px-5 py-4">
                    <h3 className="text-sm font-semibold text-foreground">Load Reference</h3>
                  </div>
                  <div className="space-y-3 p-4">
                    <InfoTile
                      icon={<DollarSign className="h-4 w-4" />}
                      label={quotation.shipments.load_number}
                      value={`${quotation.shipments.origin_city} → ${quotation.shipments.destination_city}`}
                    />
                    {quotation.shipments.accounts && (
                      <InfoTile
                        icon={<CompanyLogo name={quotation.shipments.accounts.account_name} logoUrl={quotation.shipments.accounts.logo_url} size="sm" rounded="lg" />}
                        label="Assigned Company"
                        value={quotation.shipments.accounts.account_name}
                      />
                    )}
                    {quotation.shipments.profiles && (
                      <InfoTile
                        icon={<UserAvatar name={quotation.shipments.profiles.full_name} avatarUrl={quotation.shipments.profiles.avatar_url} size="sm" rounded="lg" />}
                        label="Assigned Driver"
                        value={quotation.shipments.profiles.full_name ?? "—"}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Acceptance / decline record — read-only once the decision is made */}
              {quotation.status === "accepted" && acceptance && (
                <div className="overflow-hidden rounded-2xl border border-green-200 bg-green-50/60 shadow-sm dark:border-green-800 dark:bg-green-950/40">
                  <div className="flex items-center gap-2 border-b border-green-200 px-5 py-4 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">Quotation Accepted</h3>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <InfoTile icon={<User className="h-4 w-4" />} label="Accepted By" value={acceptance.full_name ?? "—"} />
                    <InfoTile icon={<Building2 className="h-4 w-4" />} label="Company" value={acceptance.company_name ?? "—"} />
                    <InfoTile icon={<Calendar className="h-4 w-4" />} label="Accepted At" value={fmtDate(acceptance.accepted_at)} />
                    <InfoTile icon={<ShieldCheck className="h-4 w-4" />} label="Terms Version" value={acceptance.terms_version} />
                  </div>
                </div>
              )}

              {quotation.status === "rejected" && (
                <div className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/60 shadow-sm dark:border-red-800 dark:bg-red-950/40">
                  <div className="flex items-center gap-2 px-5 py-4">
                    <XCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                      Quotation Declined{quotation.declined_at ? ` — ${fmtDate(quotation.declined_at)}` : ""}
                    </h3>
                  </div>
                </div>
              )}

              {/* Accept / Decline — customer action, only while awaiting review */}
              {canActOnQuotation && (
                <div className="flex flex-col gap-3 rounded-2xl border border-card-border bg-card p-4 shadow-sm sm:flex-row">
                  <Button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="h-10 flex-1 rounded-none bg-primary text-sm text-sidebar hover:bg-primary/85"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDecline}
                    disabled={declineMut.isPending}
                    className="h-10 flex-1 rounded-none border-red-200 text-sm text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TermsAcceptanceModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={handleConfirmAccept}
        loading={acceptMut.isPending}
      />
    </Sheet>
  );
}
