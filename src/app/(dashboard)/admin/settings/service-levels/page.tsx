"use client";

import { useState } from "react";
import Link from "next/link";
import { Gauge, Loader2, Pencil, Plus, Trash2, Weight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useServiceLevels,
  useCreateServiceLevel,
  useUpdateServiceLevel,
  useDeleteServiceLevel,
} from "@/hooks/use-service-levels";
import { useWeightRate, useUpdateWeightRate } from "@/hooks/use-pricing";
import { usePermission } from "@/hooks/use-permission";
import type { ServiceLevel } from "@/types/api.types";

function WeightRateCard({ canEdit }: { canEdit: boolean }) {
  const { data, isLoading } = useWeightRate();
  const rate = data?.data;
  const [value, setValue] = useState<string | null>(null);
  const updateMut = useUpdateWeightRate();

  async function handleSave() {
    if (value === null) return;
    try {
      await updateMut.mutateAsync(Number(value));
      toast.success("Weight surcharge rate updated");
      setValue(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (isLoading || !rate) {
    return <div className="h-20 animate-pulse rounded-2xl bg-card-border" />;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Weight className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{rate.label}</p>
          <p className="text-xs text-muted">Added to every quote based on the entered weight (kg).</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">$</span>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={value ?? rate.value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!canEdit}
          className="w-28 rounded-lg"
        />
        <span className="text-sm text-muted">/kg</span>
        {canEdit && value !== null && value !== String(rate.value) && (
          <Button type="button" size="sm" className="rounded-lg bg-primary text-sidebar hover:bg-primary/85" onClick={handleSave} disabled={updateMut.isPending}>
            {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        )}
      </div>
    </div>
  );
}

function LevelFormDialog({
  level,
  onClose,
}: {
  level: ServiceLevel | null; // null = create mode
  onClose: () => void;
}) {
  const [slug, setSlug] = useState(level?.slug ?? "");
  const [label, setLabel] = useState(level?.label ?? "");
  const [multiplier, setMultiplier] = useState(level?.multiplier ?? 1);

  const createMut = useCreateServiceLevel();
  const updateMut = useUpdateServiceLevel(level?.level_id ?? "");
  const saving = createMut.isPending || updateMut.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (level) {
        await updateMut.mutateAsync({ label, multiplier });
        toast.success("Service level updated");
      } else {
        await createMut.mutateAsync({ slug: slug.trim(), label: label.trim(), multiplier });
        toast.success("Service level created");
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
          <DialogTitle>{level ? `Edit ${level.label}` : "Add Service Level"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {!level && (
            <div className="space-y-1.5">
              <Label htmlFor="slug">Level Key *</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. overnight" required className="rounded-lg" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="label">Label *</Label>
            <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Overnight" required className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="multiplier">Price Multiplier *</Label>
            <Input id="multiplier" type="number" min={0} step={0.01} value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))} required className="rounded-lg" />
            <p className="text-xs text-muted">Applied to the base delivery charge — 1.0 = no change, 1.25 = +25%.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : level ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LevelRow({
  level,
  canEdit,
  onEdit,
  onDelete,
}: {
  level: ServiceLevel;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const updateMut = useUpdateServiceLevel(level.level_id);

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
          <Gauge className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{level.label}</p>
          <p className="text-xs text-muted">× {level.multiplier}</p>
          <p className="mt-0.5 text-xs text-muted-light">{level.slug}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Switch checked={level.is_active} disabled={!canEdit || updateMut.isPending} onCheckedChange={handleToggle} />
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

export default function ServiceLevelsPage() {
  const canEdit = usePermission("pricing.edit");
  const { data, isLoading } = useServiceLevels();
  const levels = data?.data ?? [];
  const deleteMut = useDeleteServiceLevel();

  const [formTarget, setFormTarget] = useState<ServiceLevel | null | "new">(null);

  async function handleDelete(level: ServiceLevel) {
    if (!window.confirm(`Delete the "${level.label}" service level? This cannot be undone.`)) return;
    try {
      await deleteMut.mutateAsync(level.level_id);
      toast.success("Service level deleted");
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
          <Link href="/admin/settings/additional-charges" className="rounded-full border border-card-border px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground">
            Additional Charges
          </Link>
          <span className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-sidebar">Service Levels</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">Service Levels</h1>
            <p className="mt-1 text-sm text-muted">
              Price multiplier per delivery speed, plus the weight surcharge rate. Used automatically by the Pricing Calculator and instant residential quotes.
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => setFormTarget("new")} className="rounded-lg bg-primary text-sidebar hover:bg-primary/85">
              <Plus className="h-4 w-4" />
              Add Level
            </Button>
          )}
        </div>

        <WeightRateCard canEdit={canEdit} />

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-2xl bg-card-border" />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="divide-y divide-card-border">
              {levels.map((level) => (
                <LevelRow key={level.level_id} level={level} canEdit={canEdit} onEdit={() => setFormTarget(level)} onDelete={() => handleDelete(level)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {formTarget && (
        <LevelFormDialog level={formTarget === "new" ? null : formTarget} onClose={() => setFormTarget(null)} />
      )}
    </div>
  );
}
