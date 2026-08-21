"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useDeliveryRates,
  useCreateDeliveryRate,
  useUpdateDeliveryRate,
  useDeleteDeliveryRate,
} from "@/hooks/use-delivery-rates";
import { usePermission } from "@/hooks/use-permission";
import type { DeliveryRateCard } from "@/types/api.types";

function RateFormDialog({
  rate,
  onClose,
}: {
  rate: DeliveryRateCard | null; // null = create mode
  onClose: () => void;
}) {
  const [serviceType, setServiceType] = useState(rate?.service_type ?? "");
  const [label, setLabel] = useState(rate?.label ?? "");
  const [baseFee, setBaseFee] = useState(rate?.base_fee ?? 0);
  const [perKmRate, setPerKmRate] = useState(rate?.per_km_rate ?? 0);
  const [minimumCharge, setMinimumCharge] = useState(rate?.minimum_charge ?? 0);

  const createMut = useCreateDeliveryRate();
  const updateMut = useUpdateDeliveryRate(rate?.rate_id ?? "");
  const saving = createMut.isPending || updateMut.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (rate) {
        await updateMut.mutateAsync({ label, baseFee, perKmRate, minimumCharge });
        toast.success("Delivery rate updated");
      } else {
        await createMut.mutateAsync({ serviceType: serviceType.trim(), label: label.trim(), baseFee, perKmRate, minimumCharge });
        toast.success("Delivery rate created");
      }
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rate ? `Edit ${rate.label}` : "Add Delivery Rate"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {!rate && (
            <div className="space-y-1.5">
              <Label htmlFor="service-type">Service Type Key *</Label>
              <Input id="service-type" value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="e.g. same_day" required className="rounded-lg" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="label">Label *</Label>
            <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Same-Day Delivery" required className="rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="base-fee">Base Fee ($)</Label>
              <Input id="base-fee" type="number" min={0} step={0.01} value={baseFee} onChange={(e) => setBaseFee(Number(e.target.value))} required className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="per-km">Per KM ($)</Label>
              <Input id="per-km" type="number" min={0} step={0.01} value={perKmRate} onChange={(e) => setPerKmRate(Number(e.target.value))} required className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="min-charge">Minimum ($)</Label>
              <Input id="min-charge" type="number" min={0} step={0.01} value={minimumCharge} onChange={(e) => setMinimumCharge(Number(e.target.value))} required className="rounded-lg" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : rate ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DeliveryRateLibraryPage() {
  const canEdit = usePermission("pricing.edit");
  const { data, isLoading } = useDeliveryRates();
  const rates = data?.data ?? [];
  const deleteMut = useDeleteDeliveryRate();

  const [formTarget, setFormTarget] = useState<DeliveryRateCard | null | "new">(null);

  async function handleDelete(rate: DeliveryRateCard) {
    if (!window.confirm(`Delete the "${rate.label}" rate card? This cannot be undone.`)) return;
    try {
      await deleteMut.mutateAsync(rate.rate_id);
      toast.success("Delivery rate deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-2">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex gap-2">
          <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-sidebar">Delivery Rates</span>
          <Link href="/admin/settings/additional-charges" className="rounded-full border border-card-border px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground">
            Additional Charges
          </Link>
          <Link href="/admin/settings/service-levels" className="rounded-full border border-card-border px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground">
            Service Levels
          </Link>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">Delivery Rate Library</h1>
            <p className="mt-1 text-sm text-muted">
              Base fee, per-km rate, and minimum charge for each last-mile service type. Used automatically by the Pricing Calculator.
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => setFormTarget("new")} className="rounded-lg bg-primary text-sidebar hover:bg-primary/85">
              <Plus className="h-4 w-4" />
              Add Rate
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-card-border" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Base Fee</TableHead>
                    <TableHead>Per KM</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Active</TableHead>
                    {canEdit && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate) => (
                    <RateRow key={rate.rate_id} rate={rate} canEdit={canEdit} onEdit={() => setFormTarget(rate)} onDelete={() => handleDelete(rate)} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {formTarget && (
        <RateFormDialog rate={formTarget === "new" ? null : formTarget} onClose={() => setFormTarget(null)} />
      )}
    </div>
  );
}

function RateRow({
  rate,
  canEdit,
  onEdit,
  onDelete,
}: {
  rate: DeliveryRateCard;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const updateMut = useUpdateDeliveryRate(rate.rate_id);

  async function handleToggle(checked: boolean) {
    try {
      await updateMut.mutateAsync({ isActive: checked });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-muted" />
          <span className="font-medium text-foreground">{rate.label}</span>
        </div>
        <span className="text-xs text-muted">{rate.service_type}</span>
      </TableCell>
      <TableCell>${rate.base_fee.toFixed(2)}</TableCell>
      <TableCell>${rate.per_km_rate.toFixed(2)}/km</TableCell>
      <TableCell>${rate.minimum_charge.toFixed(2)}</TableCell>
      <TableCell>
        <Switch checked={rate.is_active} disabled={!canEdit || updateMut.isPending} onCheckedChange={handleToggle} />
      </TableCell>
      {canEdit && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg text-danger hover:bg-red-50" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
