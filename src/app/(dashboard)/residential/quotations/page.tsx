"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileQuestion, MapPin, Loader2, PackageSearch, AlertCircle, History, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { TermsAcceptanceModal, TERMS_VERSION } from "@/components/documents/terms-acceptance-modal";
import { QuotationStatusBadge } from "@/components/documents/document-status-badge";
import { QuotationDetailsSheet } from "@/components/documents/sheets/quotation-details-sheet";

import { geocodeAddressFull, haversineDistanceKm, type AddressSuggestion, type Coordinates } from "@/lib/utils/geocode";
import { dateInputValueToIso } from "@/lib/utils/format-date";
import { useDeliveryRates } from "@/hooks/use-delivery-rates";
import { useServiceLevels } from "@/hooks/use-service-levels";
import { useAdditionalCharges } from "@/hooks/use-additional-charges";
import { useCalculatePrice } from "@/hooks/use-pricing";
import { useMe } from "@/hooks/use-users";
import { useRewardsCreditSummary } from "@/hooks/use-rewards-credit";
import { useDecideResidentialQuote, useQuotations } from "@/hooks/use-quotations";
import type { DecideAutoQuoteDto, PriceBreakdown } from "@/types/api.types";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-CA", { day: "2-digit", month: "short", year: "numeric" });
}

type AddressParts = { address: string; coords: Coordinates | null; city: string; state: string; postcode: string };

const EMPTY_ADDRESS: AddressParts = { address: "", coords: null, city: "", state: "", postcode: "" };

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-foreground" : "text-muted"}`}>
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}

export default function ResidentialQuotationsPage() {
  const router = useRouter();
  const { data: meRes } = useMe();
  const { data: ratesRes } = useDeliveryRates();
  const rates = (ratesRes?.data ?? []).filter((r) => r.is_active);
  const { data: levelsRes } = useServiceLevels();
  const levels = (levelsRes?.data ?? []).filter((l) => l.is_active);
  const { data: chargesRes } = useAdditionalCharges();
  const charges = (chargesRes?.data ?? []).filter((c) => c.is_active);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [origin, setOrigin] = useState<AddressParts>(EMPTY_ADDRESS);
  const [destination, setDestination] = useState<AddressParts>(EMPTY_ADDRESS);
  const [serviceType, setServiceType] = useState("");
  const [serviceLevel, setServiceLevel] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [pieces, setPieces] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCharges, setSelectedCharges] = useState<Set<string>>(new Set());
  const [geocoding, setGeocoding] = useState<"origin" | "destination" | null>(null);

  // Nothing is persisted until the customer decides — this is just the
  // calculated price preview (POST /pricing/calculate, no DB write).
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [decidedStatus, setDecidedStatus] = useState<"accepted" | "rejected" | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [applyRewards, setApplyRewards] = useState(false);

  const { data: rewardsRes } = useRewardsCreditSummary();
  const rewardsPoints = rewardsRes?.data.points ?? 0;
  const rewardsCredit = rewardsRes?.data.creditAvailable ?? 0;
  // Preview only — the backend re-caps against the authoritative quote total.
  const quoteTotal = breakdown?.subtotal ?? 0;
  const rewardsDiscount = applyRewards
    ? Math.min(rewardsCredit, Math.round(quoteTotal * 0.5 * 100) / 100)
    : 0;
  const netTotal = Math.max(0, quoteTotal - rewardsDiscount);

  const calculateMut = useCalculatePrice();
  const decideMut = useDecideResidentialQuote();
  const { data: pastQuotesRes, isLoading: pastQuotesLoading } = useQuotations({ sortBy: "created_at", sortDir: "desc", limit: 10 });
  const pastQuotes = pastQuotesRes?.data ?? [];

  useEffect(() => {
    if (!meRes?.data) return;
    setCustomerName((prev) => prev || meRes.data.fullName || "");
    setCustomerEmail((prev) => prev || meRes.data.email || "");
    setCustomerPhone((prev) => prev || meRes.data.phone || "");
  }, [meRes]);

  useEffect(() => {
    if (!serviceLevel && levels.length > 0) {
      const standard = levels.find((l) => l.slug === "standard") ?? levels[0];
      setServiceLevel(standard.slug);
    }
  }, [levels, serviceLevel]);

  const distanceKm = origin.coords && destination.coords
    ? Math.round(haversineDistanceKm(origin.coords, destination.coords) * 10) / 10
    : null;

  // Fills coords AND city/state/postcode from a plain blur (typed address,
  // never clicked from the dropdown) — mirrors what handleAddressSelect does,
  // so the form doesn't stay silently unsubmittable for anyone who just types
  // and tabs away instead of clicking a suggestion.
  async function handleAddressBlur(field: "origin" | "destination", address: string) {
    setGeocoding(field);
    const result = await geocodeAddressFull(address);
    const setter = field === "origin" ? setOrigin : setDestination;
    setter((prev) => ({
      ...prev,
      coords:   result?.center ?? prev.coords,
      city:     prev.city     || result?.context?.city     || "",
      state:    prev.state    || result?.context?.region   || "",
      postcode: prev.postcode || result?.context?.postcode || "",
    }));
    setGeocoding(null);
  }

  function handleAddressSelect(field: "origin" | "destination", suggestion: AddressSuggestion) {
    const setter = field === "origin" ? setOrigin : setDestination;
    setter({
      address:  suggestion.placeName,
      coords:   suggestion.center,
      city:     suggestion.context?.city ?? "",
      state:    suggestion.context?.region ?? "",
      postcode: suggestion.context?.postcode ?? "",
    });
  }

  function toggleCharge(key: string) {
    setSelectedCharges((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setBreakdown(null);
  }

  // Plain-language reasons the button is disabled — shown to the user instead
  // of a silently greyed-out button with no explanation.
  const missingReasons: string[] = [];
  if (!customerName.trim())  missingReasons.push("Enter your name");
  if (!customerEmail.trim()) missingReasons.push("Enter your email");
  if (!customerPhone.trim()) missingReasons.push("Enter your phone number");
  if (!origin.address) {
    missingReasons.push("Enter a pickup address");
  } else if (!origin.coords || !origin.city || !origin.state || !origin.postcode) {
    missingReasons.push("Pickup address isn't fully recognized — try re-entering it or picking it from the suggestions");
  }
  if (!destination.address) {
    missingReasons.push("Enter a delivery address");
  } else if (!destination.coords || !destination.city || !destination.state || !destination.postcode) {
    missingReasons.push("Delivery address isn't fully recognized — try re-entering it or picking it from the suggestions");
  }
  if (!serviceType)  missingReasons.push("Choose a service type");
  if (!serviceLevel) missingReasons.push("Choose a service level");
  if (cargoDescription.trim().length < 3) missingReasons.push("Describe what needs to be delivered");
  if (!(Number(pieces) >= 1))    missingReasons.push("Enter the number of packages");
  if (!(Number(weightKg) > 0))   missingReasons.push("Enter the weight");
  if (!preferredDeliveryDate)    missingReasons.push("Choose a preferred delivery date");
  if (origin.coords && destination.coords && distanceKm == null) {
    missingReasons.push("Still calculating distance — please wait a moment");
  }

  const canSubmit = missingReasons.length === 0;

  async function handleGetQuote() {
    if (!canSubmit || distanceKm == null) return;
    try {
      const res = await calculateMut.mutateAsync({
        serviceType, serviceLevel, distanceKm, weightKg: Number(weightKg),
        additionalChargeKeys: Array.from(selectedCharges),
      });
      setBreakdown(res.data);
      setDecidedStatus(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function buildDecideDto(decision: "accept" | "decline"): DecideAutoQuoteDto {
    return {
      customerName: customerName.trim(), customerEmail: customerEmail.trim(), customerPhone: customerPhone.trim(),
      originAddress: origin.address, originLat: origin.coords!.lat, originLng: origin.coords!.lng,
      originCity: origin.city, originState: origin.state, originPostcode: origin.postcode,
      destinationAddress: destination.address, destinationLat: destination.coords!.lat, destinationLng: destination.coords!.lng,
      destinationCity: destination.city, destinationState: destination.state, destinationPostcode: destination.postcode,
      distanceKm: distanceKm as number, serviceType, serviceLevel, cargoDescription: cargoDescription.trim(),
      pieces: Number(pieces), weightKg: Number(weightKg),
      preferredDeliveryDate: dateInputValueToIso(preferredDeliveryDate)!,
      notes: notes.trim() || null,
      additionalChargeKeys: Array.from(selectedCharges),
      decision,
      ...(decision === "accept"
        ? { termsVersion: TERMS_VERSION, acknowledged: true, applyRewards }
        : {}),
    };
  }

  async function handleConfirmAccept() {
    try {
      await decideMut.mutateAsync(buildDecideDto("accept"));
      toast.success("Quote accepted — your delivery has been created");
      setTermsOpen(false);
      router.push("/residential/deliveries");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleDecline() {
    try {
      await decideMut.mutateAsync(buildDecideDto("decline"));
      toast.success("Quote declined");
      setDecidedStatus("rejected");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function startOver() {
    setBreakdown(null);
    setDecidedStatus(null);
    setApplyRewards(false);
    setOrigin(EMPTY_ADDRESS);
    setDestination(EMPTY_ADDRESS);
    setServiceType("");
    setCargoDescription("");
    setPieces("");
    setWeightKg("");
    setPreferredDeliveryDate("");
    setNotes("");
    setSelectedCharges(new Set());
  }

  // Zero-amount lines (e.g. a weight surcharge that priced to $0) are omitted —
  // they add noise without adding information for the customer.
  const priceItems = breakdown ? [
    { key: "delivery", label: `${breakdown.label} Delivery (${breakdown.serviceLevelLabel})`, amount: breakdown.deliveryCharge },
    ...(breakdown.weightCharge > 0 ? [{ key: "weight", label: `Weight Surcharge (${breakdown.weightKg} kg × $${breakdown.weightPerKgRate.toFixed(2)}/kg)`, amount: breakdown.weightCharge }] : []),
    ...breakdown.additionalCharges.map((c) => ({ key: c.key, label: c.label, amount: c.amount })),
  ].filter((item) => item.amount !== 0) : [];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Get a Quote</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Instant Delivery Quote</h1>
          <p className="mt-2 text-sm text-muted">
            Tell us where and what you need delivered — we&apos;ll price it instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          {/* ── Form — always visible, never replaced by the result ───────────── */}
          <div className="space-y-5 rounded-3xl border border-card-border bg-card p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Customer Name</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@example.com" className="rounded-lg" />
            </div>

            <div className="space-y-1.5">
              <Label>Pickup Address</Label>
              <AddressAutocomplete
                as="textarea"
                rows={2}
                value={origin.address}
                onChange={(v) => setOrigin((prev) => ({ ...prev, address: v }))}
                onBlur={() => handleAddressBlur("origin", origin.address)}
                onSelect={(s) => handleAddressSelect("origin", s)}
                placeholder="Street, City, Province, Postal Code"
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Delivery Address</Label>
              <AddressAutocomplete
                as="textarea"
                rows={2}
                value={destination.address}
                onChange={(v) => setDestination((prev) => ({ ...prev, address: v }))}
                onBlur={() => handleAddressBlur("destination", destination.address)}
                onSelect={(s) => handleAddressSelect("destination", s)}
                placeholder="Street, City, Province, Postal Code"
                className="resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5" />
              {geocoding ? (
                <span>Locating {geocoding} address…</span>
              ) : distanceKm != null ? (
                <span className="font-semibold text-foreground">≈ {distanceKm} km</span>
              ) : (
                <span>Distance appears once both addresses are selected from the dropdown</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Service Type</Label>
                <SearchableSelect
                  value={serviceType}
                  onValueChange={(v) => { setServiceType(v); setBreakdown(null); }}
                  options={rates.map((r) => ({ value: r.service_type, label: r.label }))}
                  placeholder="What kind of delivery is this?"
                  searchPlaceholder="Search…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Service Level</Label>
                <SearchableSelect
                  value={serviceLevel}
                  onValueChange={(v) => { setServiceLevel(v); setBreakdown(null); }}
                  options={levels.map((l) => ({ value: l.slug, label: l.label }))}
                  placeholder="How fast do you need it?"
                  searchPlaceholder="Search…"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>What needs to be delivered?</Label>
              <Textarea
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                placeholder="e.g. Groceries, a small parcel, medical supplies…"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Number of Packages</Label>
                <Input type="number" min={1} step={1} value={pieces} onChange={(e) => { setPieces(e.target.value); setBreakdown(null); }} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label>Weight (kg)</Label>
                <Input type="number" min={0.1} step={0.1} value={weightKg} onChange={(e) => { setWeightKg(e.target.value); setBreakdown(null); }} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Delivery Date</Label>
                <Input type="date" value={preferredDeliveryDate} onChange={(e) => setPreferredDeliveryDate(e.target.value)} className="rounded-lg" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Special Instructions (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Access requirements, gate codes, handling notes…"
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Additional Options</Label>
              <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-card-border p-3">
                {charges.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={selectedCharges.has(c.key)}
                      onCheckedChange={() => toggleCharge(c.key)}
                      disabled={c.amount == null}
                    />
                    <span className="flex-1">{c.label}</span>
                    <span className="text-xs text-muted">
                      {c.amount != null ? `$${c.amount.toFixed(2)}` : "priced separately"}
                    </span>
                  </label>
                ))}
                {charges.length === 0 && <p className="text-xs italic text-muted">No optional extras available.</p>}
              </div>
            </div>

            {missingReasons.length > 0 && (
              <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Before you can get a quote:</span>
                </div>
                <ul className="ml-5 list-disc space-y-0.5">
                  {missingReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="button"
              onClick={handleGetQuote}
              disabled={!canSubmit || calculateMut.isPending}
              className="w-full rounded-lg bg-primary text-sidebar hover:bg-primary/85"
            >
              {calculateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : breakdown ? "Recalculate" : "Get Instant Quote"}
            </Button>
          </div>

          {/* ── Price panel — appears alongside the form, form stays put ──────── */}
          <div className="space-y-5 lg:sticky lg:top-6">
            {breakdown ? (
              <>
                <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-card-border px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileQuestion className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-foreground">Your Price</h2>
                      <p className="truncate text-xs text-muted">{origin.address} → {destination.address}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 p-5 text-sm">
                    {priceItems.length > 0 ? (
                      priceItems.map((item) => <Row key={item.key} label={item.label} value={item.amount} />)
                    ) : (
                      <p className="text-xs text-muted">No charges on this quote.</p>
                    )}
                    <div className="border-t border-card-border pt-1.5">
                      <Row label={rewardsDiscount > 0 ? "Subtotal" : "Total"} value={quoteTotal} bold={rewardsDiscount === 0} />
                    </div>
                    {rewardsDiscount > 0 && (
                      <>
                        <div className="flex items-center justify-between text-green-600">
                          <span>Rewards discount</span><span>−${rewardsDiscount.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-card-border pt-1.5">
                          <Row label="Total" value={netTotal} bold />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rewards points — residential members with a balance */}
                {rewardsPoints > 0 && decidedStatus !== "rejected" && (
                  <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
                    <div className="flex items-center gap-2 border-b border-card-border px-5 py-3.5">
                      <Gift className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Rewards Points</h3>
                    </div>
                    <div className="space-y-2.5 p-5 text-sm">
                      <p className="text-muted">
                        {rewardsPoints.toLocaleString()} points available
                        <span className="text-xs"> (${rewardsCredit.toFixed(2)} credit)</span>
                      </p>
                      <label className="flex items-start gap-2 text-foreground">
                        <Checkbox
                          checked={applyRewards}
                          onCheckedChange={(c) => setApplyRewards(c === true)}
                          className="mt-0.5"
                        />
                        <span>
                          Apply my rewards points
                          <span className="block text-xs text-muted">
                            Covers up to 50% of a quote — ${Math.min(rewardsCredit, quoteTotal * 0.5).toFixed(2)} on this one
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {decidedStatus === "rejected" ? (
                  <div className="rounded-2xl border border-card-border bg-card/50 p-3 text-center text-xs font-medium text-muted">
                    You declined this quote.
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={startOver} disabled={decideMut.isPending}>
                      Start Over
                    </Button>
                    <Button type="button" variant="outline" className="flex-1 rounded-lg border-red-200 text-red-600 hover:bg-red-50" onClick={handleDecline} disabled={decideMut.isPending}>
                      {decideMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setTermsOpen(true)}
                      disabled={decideMut.isPending}
                      className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85"
                    >
                      Accept &amp; Book
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-card-border bg-card/50 p-8 text-center">
                <FileQuestion className="h-8 w-8 text-muted-light" />
                <p className="text-sm font-medium text-muted">Your price will appear here</p>
                <p className="text-xs text-muted-light">Fill in the form and click &quot;Get Instant Quote&quot;.</p>
              </div>
            )}

            <div className="flex items-start gap-2 rounded-2xl border border-card-border bg-card p-4 text-xs text-muted">
              <PackageSearch className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>Prices are calculated instantly from our published delivery rates, service level, weight, and any options you select. Nothing is saved until you accept or decline — accepting creates your delivery right away.</p>
            </div>
          </div>
        </div>

        {/* ── Past quotations — always visible so nothing gets lost ─────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Your Quotations</h2>
          </div>
          <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
            {pastQuotesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted" />
              </div>
            ) : pastQuotes.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <FileQuestion className="h-8 w-8 text-muted-light" />
                <p className="text-sm font-medium text-muted">No quotations yet</p>
                <p className="text-xs text-muted-light">Quotes you accept or decline will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-card-border">
                {pastQuotes.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => setDetailsId(q.id)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm transition-colors hover:bg-primary/5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{q.quotation_number}</span>
                          <QuotationStatusBadge status={q.status} residential />
                        </div>
                        <p className="truncate text-xs text-muted">
                          {q.origin_address ?? q.origin_city} → {q.destination_address ?? q.destination_city} · {fmtDate(q.issue_date)}
                        </p>
                      </div>
                      <span className="shrink-0 text-right tabular-nums">
                        {(q.rewards_credit_applied ?? 0) > 0 ? (
                          <>
                            <span className="block text-xs text-muted line-through">${q.total.toFixed(2)}</span>
                            <span className="font-semibold text-foreground">${(q.total - q.rewards_credit_applied).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="font-semibold text-foreground">${q.total.toFixed(2)}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <TermsAcceptanceModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={handleConfirmAccept}
        loading={decideMut.isPending}
      />

      <QuotationDetailsSheet
        open={!!detailsId}
        onClose={() => setDetailsId(null)}
        quotationId={detailsId ?? ""}
        onEditClick={() => {}}
      />
    </div>
  );
}
