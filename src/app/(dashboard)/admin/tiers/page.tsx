"use client";

import { useState } from "react";
import { Award, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTiers, useUpdateTier } from "@/hooks/use-tiers";
import { usePermission } from "@/hooks/use-permission";
import type { Tier } from "@/types/api.types";

function EditTierDialog({ open, onClose, tier }: { open: boolean; onClose: () => void; tier: Tier }) {
  const [minDeliveries, setMinDeliveries] = useState(tier.min_deliveries);
  const [quoteTurnaround, setQuoteTurnaround] = useState(tier.quote_turnaround);
  const [benefits, setBenefits] = useState<string[]>(tier.benefits);
  const updateMut = useUpdateTier(tier.tier_id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMut.mutateAsync({
        min_deliveries: minDeliveries,
        quote_turnaround: quoteTurnaround.trim(),
        benefits: benefits.map((b) => b.trim()).filter(Boolean),
      });
      toast.success("Tier updated");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {tier?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="min-deliveries">Deliveries required to reach this tier *</Label>
            <Input
              id="min-deliveries"
              type="number"
              min={0}
              value={minDeliveries}
              onChange={(e) => setMinDeliveries(Number(e.target.value))}
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quote-turnaround">Quote turnaround SLA *</Label>
            <Input
              id="quote-turnaround"
              value={quoteTurnaround}
              onChange={(e) => setQuoteTurnaround(e.target.value)}
              placeholder="e.g. Within 6 hours"
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Benefits (this tier's own additions)</Label>
            <div className="space-y-2">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) =>
                      setBenefits((prev) => prev.map((b, idx) => (idx === i ? e.target.value : b)))
                    }
                    className="rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-lg"
                    onClick={() => setBenefits((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-1 rounded-lg"
              onClick={() => setBenefits((prev) => [...prev, ""])}
            >
              <Plus className="h-4 w-4" />
              Add benefit
            </Button>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={updateMut.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={updateMut.isPending}>
              {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTiersPage() {
  const { data, isLoading } = useTiers();
  const tiers = data?.data ?? [];
  const canEdit = usePermission("tiers.edit");
  const [editTier, setEditTier] = useState<Tier | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 lg:p-2">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Partner Tiers
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage the delivery thresholds and benefits corporate customers unlock at each tier.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-card-border" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {tiers.map((tier) => (
              <div
                key={tier.tier_id}
                className="rounded-2xl border border-card-border bg-card p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{tier.name}</h3>
                      <p className="mt-0.5 text-xs text-muted">
                        {tier.min_deliveries.toLocaleString()} deliveries required · Quote turnaround: {tier.quote_turnaround}
                      </p>
                    </div>
                  </div>

                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setEditTier(tier)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </div>

                <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-muted">
                      • {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {editTier && (
        <EditTierDialog open={!!editTier} onClose={() => setEditTier(null)} tier={editTier} />
      )}
    </div>
  );
}
