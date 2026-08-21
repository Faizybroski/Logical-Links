"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileQuestion, MapPin, Loader2, PackageSearch, AlertCircle, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { TermsAcceptanceModal, TERMS_VERSION } from "@/components/documents/terms-acceptance-modal";
import { QuotationStatusBadge } from "@/components/documents/document-status-badge";

import { geocodeAddressFull, haversineDistanceKm, type AddressSuggestion, type Coordinates } from "@/lib/utils/geocode";
import { dateInputValueToIso } from "@/lib/utils/format-date";
import { useDeliveryRates } from "@/hooks/use-delivery-rates";
import { useServiceLevels } from "@/hooks/use-service-levels";
import { useMe } from "@/hooks/use-users";
import { useCreateResidentialQuote, useAcceptQuotation, useQuotations } from "@/hooks/use-quotations";
import type { Quotation, ResidentialQuoteRequestDto } from "@/types/api.types";

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
  const [geocoding, setGeocoding] = useState<"origin" | "destination" | null>(null);

  const [quote, setQuote] = useState<Quotation | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const createMut = useCreateResidentialQuote();
  const acceptMut = useAcceptQuotation(quote?.id ?? "");
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
    const dto: ResidentialQuoteRequestDto = {
      customerName: customerName.trim(), customerEmail: customerEmail.trim(), customerPhone: customerPhone.trim(),
      originAddress: origin.address, originLat: origin.coords!.lat, originLng: origin.coords!.lng,
      originCity: origin.city, originState: origin.state, originPostcode: origin.postcode,
      destinationAddress: destination.address, destinationLat: destination.coords!.lat, destinationLng: destination.coords!.lng,
      destinationCity: destination.city, destinationState: destination.state, destinationPostcode: destination.postcode,
      distanceKm, serviceType, serviceLevel, cargoDescription: cargoDescription.trim(),
      pieces: Number(pieces), weightKg: Number(weightKg),
      preferredDeliveryDate: dateInputValueToIso(preferredDeliveryDate)!,
      notes: notes.trim() || null,
    };
    try {
      const res = await createMut.mutateAsync(dto);
      setQuote(res.data);
      toast.success("Here's your quote");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleConfirmAccept() {
    try {
      await acceptMut.mutateAsync({ termsVersion: TERMS_VERSION, acknowledged: true });
      toast.success("Quote accepted — your delivery has been created");
      setTermsOpen(false);
      router.push("/residential/loads");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function startOver() {
    setQuote(null);
    setOrigin(EMPTY_ADDRESS);
    setDestination(EMPTY_ADDRESS);
    setServiceType("");
    setCargoDescription("");
    setPieces("");
    setWeightKg("");
    setPreferredDeliveryDate("");
    setNotes("");
  }

  // Zero-amount lines (e.g. a weight surcharge that priced to $0) are omitted —
  // they add noise without adding information for the customer.
  const priceItems = (quote?.quotation_items ?? []).filter((item) => item.amount !== 0);

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
                  onValueChange={setServiceType}
                  options={rates.map((r) => ({ value: r.service_type, label: r.label }))}
                  placeholder="What kind of delivery is this?"
                  searchPlaceholder="Search…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Service Level</Label>
                <SearchableSelect
                  value={serviceLevel}
                  onValueChange={setServiceLevel}
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
                <Input type="number" min={1} step={1} value={pieces} onChange={(e) => setPieces(e.target.value)} className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label>Weight (kg)</Label>
                <Input type="number" min={0.1} step={0.1} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="rounded-lg" />
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
              disabled={!canSubmit || createMut.isPending}
              className="w-full rounded-lg bg-primary text-sidebar hover:bg-primary/85"
            >
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : quote ? "Get Another Quote" : "Get Instant Quote"}
            </Button>
          </div>

          {/* ── Price panel — appears alongside the form, form stays put ──────── */}
          <div className="space-y-5 lg:sticky lg:top-6">
            {quote ? (
              <>
                <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-card-border px-5 py-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileQuestion className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-foreground">{quote.quotation_number}</h2>
                      <p className="truncate text-xs text-muted">{quote.origin_address} → {quote.destination_address}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 p-5 text-sm">
                    {priceItems.length > 0 ? (
                      priceItems.map((item) => (
                        <Row key={item.id ?? item.description} label={item.description} value={item.amount} />
                      ))
                    ) : (
                      <p className="text-xs text-muted">No charges on this quote.</p>
                    )}
                    <div className="border-t border-card-border pt-1.5">
                      <Row label="Total" value={quote.total} bold />
                    </div>
                  </div>
                </div>

                {quote.status !== "accepted" ? (
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={startOver}>
                      Start Over
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setTermsOpen(true)}
                      className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85"
                    >
                      Accept &amp; Book Delivery
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-3 text-center text-xs font-medium text-green-700 dark:text-green-400">
                    This quote has already been accepted.
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
              <p>Prices are calculated instantly from our published delivery rates, service level, and weight. Accepting creates your delivery right away.</p>
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
                <p className="text-xs text-muted-light">Quotes you request will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-card-border">
                {pastQuotes.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      onClick={() => { setQuote(q); window.scrollTo({ top: 0, behavior: "smooth" }); }}
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
                      <span className="shrink-0 font-semibold tabular-nums text-foreground">${q.total.toFixed(2)}</span>
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
        loading={acceptMut.isPending}
      />
    </div>
  );
}
