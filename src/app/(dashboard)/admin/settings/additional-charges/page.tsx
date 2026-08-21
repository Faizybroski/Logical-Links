"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Receipt, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdditionalCharges,
  useCreateCharge,
  useUpdateCharge,
  useDeleteCharge,
} from "@/hooks/use-additional-charges";
import { usePermission } from "@/hooks/use-permission";
import type { AdditionalCharge, AdditionalChargeUnit } from "@/types/api.types";

const UNIT_LABELS: Record<AdditionalChargeUnit, string> = {
  flat:     "Flat",
  per_hour: "Per hour",
  per_stop: "Per stop",
  per_km:   "Per km",
};

function ChargeFormDialog({ charge, onClose }: { charge: AdditionalCharge | null; onClose: () => void }) {
  const [key, setKey] = useState(charge?.key ?? "");
  const [category, setCategory] = useState(charge?.category ?? "accessorial");
  const [label, setLabel] = useState(charge?.label ?? "");
  const [amount, setAmount] = useState<string>(charge?.amount != null ? String(charge.amount) : "");
  const [unit, setUnit] = useState<AdditionalChargeUnit>(charge?.unit ?? "flat");
  const [purpose, setPurpose] = useState(charge?.purpose ?? "");

  const createMut = useCreateCharge();
  const updateMut = useUpdateCharge(charge?.charge_id ?? "");
  const saving = createMut.isPending || updateMut.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = amount === "" ? undefined : Number(amount);
    try {
      if (charge) {
        await updateMut.mutateAsync({ label, amount: amountNum, unit, purpose });
        toast.success("Charge updated");
      } else {
        await createMut.mutateAsync({ key: key.trim(), category: category.trim(), label: label.trim(), amount: amountNum, unit, purpose });
        toast.success("Charge created");
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
          <DialogTitle>{charge ? `Edit ${charge.label}` : "Add Charge"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {!charge && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="key">Key *</Label>
                <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. white_glove" required className="rounded-lg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="accessorial / medical / adjustment" required className="rounded-lg" />
              </div>
            </>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="charge-label">Label *</Label>
            <Input id="charge-label" value={label} onChange={(e) => setLabel(e.target.value)} required className="rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount ($, blank = admin controlled)</Label>
              <Input id="amount" type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as AdditionalChargeUnit)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="rounded-lg" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : charge ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChargeRow({ charge, canEdit, onEdit, onDelete }: { charge: AdditionalCharge; canEdit: boolean; onEdit: () => void; onDelete: () => void }) {
  const updateMut = useUpdateCharge(charge.charge_id);

  async function handleToggle(checked: boolean) {
    try {
      await updateMut.mutateAsync({ isActive: checked });
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 px-6 py-4">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Receipt className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{charge.label}</p>
          <p className="text-xs text-muted">
            {charge.amount != null ? `$${charge.amount.toFixed(2)}` : "Admin controlled"} · {UNIT_LABELS[charge.unit]}
          </p>
          {charge.purpose && <p className="mt-0.5 text-xs text-muted-light">{charge.purpose}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Switch checked={charge.is_active} disabled={!canEdit || updateMut.isPending} onCheckedChange={handleToggle} />
        {canEdit && (
          <>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-lg text-danger hover:bg-red-50" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdditionalChargesLibraryPage() {
  const canEdit = usePermission("pricing.edit");
  const { data, isLoading } = useAdditionalCharges();
  const charges = data?.data ?? [];
  const deleteMut = useDeleteCharge();

  const [formTarget, setFormTarget] = useState<AdditionalCharge | null | "new">(null);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, AdditionalCharge[]>();
    charges.forEach((c) => {
      const list = byCategory.get(c.category) ?? [];
      list.push(c);
      byCategory.set(c.category, list);
    });
    return Array.from(byCategory.entries());
  }, [charges]);

  async function handleDelete(charge: AdditionalCharge) {
    if (!window.confirm(`Delete the "${charge.label}" charge? This cannot be undone.`)) return;
    try {
      await deleteMut.mutateAsync(charge.charge_id);
      toast.success("Charge deleted");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-2">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex gap-2">
          <Link href="/admin/settings/delivery-rates" className="rounded-full border border-card-border px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground">
            Delivery Rates
          </Link>
          <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-sidebar">Additional Charges</span>
          <Link href="/admin/settings/service-levels" className="rounded-full border border-card-border px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground">
            Service Levels
          </Link>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">Additional Charges Library</h1>
            <p className="mt-1 text-sm text-muted">
              Accessorial, medical, and delivery-adjustment fees admins can select when quoting a delivery.
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => setFormTarget("new")} className="rounded-lg bg-primary text-sidebar hover:bg-primary/85">
              <Plus className="h-4 w-4" />
              Add Charge
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-card-border" />
        ) : (
          <div className="space-y-6">
            {grouped.map(([category, items]) => (
              <div key={category} className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="border-b border-card-border px-6 py-3">
                  <h2 className="text-sm font-semibold capitalize text-foreground">{category}</h2>
                </div>
                <div className="divide-y divide-card-border">
                  {items.map((charge) => (
                    <ChargeRow
                      key={charge.charge_id}
                      charge={charge}
                      canEdit={canEdit}
                      onEdit={() => setFormTarget(charge)}
                      onDelete={() => handleDelete(charge)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formTarget && (
        <ChargeFormDialog charge={formTarget === "new" ? null : formTarget} onClose={() => setFormTarget(null)} />
      )}
    </div>
  );
}
