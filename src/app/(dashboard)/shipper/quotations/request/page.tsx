"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

import { geocodeAddress, haversineDistanceKm, type AddressSuggestion, type Coordinates } from "@/lib/utils/geocode";
import { dateInputValueToIso } from "@/lib/utils/format-date";
import { useDeliveryRates } from "@/hooks/use-delivery-rates";
import { useServiceLevels } from "@/hooks/use-service-levels";
import { useMe } from "@/hooks/use-users";
import { useMyProfile } from "@/hooks/use-accounts";
import { useRequestCorporateQuote } from "@/hooks/use-quotations";
import type { CorporateQuoteRequestDto } from "@/types/api.types";

type AddressParts = { address: string; coords: Coordinates | null; city: string; state: string; postcode: string };

const EMPTY_ADDRESS: AddressParts = { address: "", coords: null, city: "", state: "", postcode: "" };

export default function RequestCorporateQuotePage() {
  const router = useRouter();
  const { data: meRes } = useMe();
  const { data: myProfileRes } = useMyProfile();
  const { data: ratesRes } = useDeliveryRates();
  const rates = (ratesRes?.data ?? []).filter((r) => r.is_active);
  const { data: levelsRes } = useServiceLevels();
  const levels = (levelsRes?.data ?? []).filter((l) => l.is_active);

  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
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
  const [submitted, setSubmitted] = useState(false);

  const requestMut = useRequestCorporateQuote();

  useEffect(() => {
    if (!meRes?.data) return;
    setCustomerName((prev) => prev || meRes.data.fullName || "");
    setCustomerEmail((prev) => prev || meRes.data.email || "");
    setCustomerPhone((prev) => prev || meRes.data.phone || "");
  }, [meRes]);

  useEffect(() => {
    if (myProfileRes?.data?.account_name) {
      setCustomerCompany((prev) => prev || myProfileRes.data.account_name);
    }
  }, [myProfileRes]);

  useEffect(() => {
    if (!serviceLevel && levels.length > 0) {
      const standard = levels.find((l) => l.slug === "standard") ?? levels[0];
      setServiceLevel(standard.slug);
    }
  }, [levels, serviceLevel]);

  const distanceKm = origin.coords && destination.coords
    ? Math.round(haversineDistanceKm(origin.coords, destination.coords) * 10) / 10
    : null;

  async function handleAddressBlur(field: "origin" | "destination", address: string) {
    setGeocoding(field);
    const coords = await geocodeAddress(address);
    const setter = field === "origin" ? setOrigin : setDestination;
    setter((prev) => ({ ...prev, coords }));
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

  const canSubmit =
    customerName.trim() && customerEmail.trim() && customerPhone.trim() &&
    origin.address && origin.coords && origin.city && origin.state && origin.postcode &&
    destination.address && destination.coords && destination.city && destination.state && destination.postcode &&
    serviceType && serviceLevel && cargoDescription.trim().length >= 3 &&
    Number(pieces) >= 1 && Number(weightKg) > 0 && preferredDeliveryDate;

  async function handleSubmit() {
    if (!canSubmit) return;
    const dto: CorporateQuoteRequestDto = {
      customerName: customerName.trim(),
      customerCompany: customerCompany.trim() || null,
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      originAddress: origin.address, originLat: origin.coords!.lat, originLng: origin.coords!.lng,
      originCity: origin.city, originState: origin.state, originPostcode: origin.postcode,
      destinationAddress: destination.address, destinationLat: destination.coords!.lat, destinationLng: destination.coords!.lng,
      destinationCity: destination.city, destinationState: destination.state, destinationPostcode: destination.postcode,
      serviceType, serviceLevel,
      cargoDescription: cargoDescription.trim(),
      pieces: Number(pieces), weightKg: Number(weightKg),
      preferredDeliveryDate: dateInputValueToIso(preferredDeliveryDate)!,
      notes: notes.trim() || null,
    };
    try {
      await requestMut.mutateAsync(dto);
      setSubmitted(true);
      toast.success("Quote request submitted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-2">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-card-border bg-card p-10 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Request submitted</h1>
            <p className="max-w-sm text-sm text-muted">
              We&apos;ll review your request and send you a priced quotation shortly — you&apos;ll get a notification once it&apos;s ready to accept.
            </p>
            <Button
              type="button"
              onClick={() => router.push("/shipper/quotations")}
              className="mt-2 rounded-lg bg-primary text-sidebar hover:bg-primary/85"
            >
              Back to Quotations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Shipper Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Request a Quote</h1>
          <p className="mt-2 text-sm text-muted">
            Tell us about the delivery and we&apos;ll send you a priced quotation to review and accept.
          </p>
        </div>

        <div className="space-y-5 rounded-3xl border border-card-border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Customer Name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Contact name" className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)} placeholder="Company name" className="rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@example.com" className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" className="rounded-lg" />
            </div>
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
            <Label>What needs to be shipped?</Label>
            <Textarea
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder="Describe the freight — type, pallets, special handling…"
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
              placeholder="Preferred pickup window, access requirements, etc."
              rows={2}
              className="resize-none"
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || requestMut.isPending}
            className="w-full rounded-lg bg-primary text-sidebar hover:bg-primary/85"
          >
            {requestMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
