"use client";

import { useMemo, useState } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";

import { useDeliveryRates } from "@/hooks/use-delivery-rates";
import { useServiceLevels } from "@/hooks/use-service-levels";
import { useAdditionalCharges } from "@/hooks/use-additional-charges";
import { useCalculatePrice } from "@/hooks/use-pricing";
import type { PriceBreakdown } from "@/types/api.types";

interface PricingCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill from the shipment/booking being priced, if known. */
  initialServiceType?: string | null;
  pickupAddress?: string;
  deliveryAddress?: string;
  /** When provided, shows an "Apply to Quotation" button that hands the calculated breakdown back to the caller instead of just closing. */
  onApply?: (breakdown: PriceBreakdown) => void;
}

export function PricingCalculatorDialog({
  open,
  onClose,
  initialServiceType,
  pickupAddress,
  deliveryAddress,
  onApply,
}: PricingCalculatorDialogProps) {
  const { data: ratesRes } = useDeliveryRates({ enabled: open });
  const rates = (ratesRes?.data ?? []).filter((r) => r.is_active);

  const { data: levelsRes } = useServiceLevels({ enabled: open });
  const levels = (levelsRes?.data ?? []).filter((l) => l.is_active);

  const { data: chargesRes } = useAdditionalCharges({ enabled: open });
  const charges = (chargesRes?.data ?? []).filter((c) => c.is_active);

  const [serviceType, setServiceType] = useState(initialServiceType ?? "");
  const [serviceLevel, setServiceLevel] = useState("standard");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");
  const [selectedCharges, setSelectedCharges] = useState<Set<string>>(new Set());
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);

  const calculateMut = useCalculatePrice();

  const selectedRate = useMemo(() => rates.find((r) => r.service_type === serviceType), [rates, serviceType]);

  function toggleCharge(key: string) {
    setSelectedCharges((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleCalculate() {
    if (!serviceType || !distanceKm) return;
    try {
      const res = await calculateMut.mutateAsync({
        serviceType,
        serviceLevel,
        distanceKm: Number(distanceKm),
        weightKg: weightKg ? Number(weightKg) : undefined,
        additionalChargeKeys: Array.from(selectedCharges),
      });
      setBreakdown(res.data);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function handleClose() {
    setBreakdown(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Pricing Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {(pickupAddress || deliveryAddress) && (
            <div className="rounded-lg border border-card-border bg-background p-3 text-xs text-muted">
              {pickupAddress && <p>Pickup: {pickupAddress}</p>}
              {deliveryAddress && <p>Delivery: {deliveryAddress}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <SearchableSelect
                value={serviceType}
                onValueChange={(v) => { setServiceType(v); setBreakdown(null); }}
                options={rates.map((r) => ({ value: r.service_type, label: r.label }))}
                placeholder="Select service type"
                searchPlaceholder="Search…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Service Level</Label>
              <SearchableSelect
                value={serviceLevel}
                onValueChange={(v) => { setServiceLevel(v); setBreakdown(null); }}
                options={levels.map((l) => ({ value: l.slug, label: l.label }))}
                placeholder="Select service level"
                searchPlaceholder="Search…"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="distance">Distance (KM)</Label>
              <Input
                id="distance"
                type="number"
                min={0}
                step={0.1}
                value={distanceKm}
                onChange={(e) => { setDistanceKm(e.target.value); setBreakdown(null); }}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                step={0.1}
                value={weightKg}
                onChange={(e) => { setWeightKg(e.target.value); setBreakdown(null); }}
                className="rounded-lg"
              />
            </div>
          </div>

          {selectedRate && (
            <p className="text-xs text-muted">
              Base ${selectedRate.base_fee.toFixed(2)} + ${selectedRate.per_km_rate.toFixed(2)}/km, minimum ${selectedRate.minimum_charge.toFixed(2)}
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Additional Charges</Label>
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-lg border border-card-border p-3">
              {charges.map((c) => (
                <label key={c.key} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={selectedCharges.has(c.key)}
                    onCheckedChange={() => { toggleCharge(c.key); setBreakdown(null); }}
                    disabled={c.amount == null}
                  />
                  <span className="flex-1">{c.label}</span>
                  <span className="text-xs text-muted">
                    {c.amount != null ? `$${c.amount.toFixed(2)}` : "admin controlled"}
                  </span>
                </label>
              ))}
              {charges.length === 0 && <p className="text-xs italic text-muted">No active charges.</p>}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleCalculate}
            disabled={!serviceType || !serviceLevel || !distanceKm || calculateMut.isPending}
            className="w-full rounded-lg bg-primary text-sidebar hover:bg-primary/85"
          >
            {calculateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate"}
          </Button>

          {breakdown && (
            <div className="space-y-1.5 rounded-lg border border-card-border bg-background p-4 text-sm">
              <Row label="Base Fee" value={breakdown.baseFee} />
              <Row label={`Distance Charge (${breakdown.distanceKm} km × $${breakdown.perKmRate.toFixed(2)})`} value={breakdown.distanceCharge} />
              <Row
                label={breakdown.serviceLevelMultiplier !== 1 ? `Delivery Charge (${breakdown.serviceLevelLabel} × ${breakdown.serviceLevelMultiplier})` : "Delivery Charge"}
                value={breakdown.deliveryCharge}
                bold
              />
              {breakdown.weightCharge > 0 && (
                <Row label={`Weight Surcharge (${breakdown.weightKg} kg × $${breakdown.weightPerKgRate.toFixed(2)}/kg)`} value={breakdown.weightCharge} />
              )}
              {breakdown.additionalCharges.map((c) => (
                <Row key={c.key} label={c.label} value={c.amount} />
              ))}
              <div className="border-t border-card-border pt-1.5">
                <Row label="Subtotal" value={breakdown.subtotal} bold />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-lg" onClick={handleClose}>
              Close
            </Button>
            {onApply && breakdown && (
              <Button
                type="button"
                className="rounded-lg bg-primary text-sidebar hover:bg-primary/85"
                onClick={() => { onApply(breakdown); handleClose(); }}
              >
                Apply to Quotation
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-foreground" : "text-muted"}`}>
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
