"use client";

import { useState } from "react";
import { Gift, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRewardsRules, useUpdateRewardsRule } from "@/hooks/use-rewards";
import { usePermission } from "@/hooks/use-permission";
import { formatRewardsRuleDescription } from "@/lib/utils/format-rewards-rule";
import type { RewardsRule } from "@/types/api.types";

function EditRewardsRuleDialog({ open, onClose, rule }: { open: boolean; onClose: () => void; rule: RewardsRule }) {
  const [value, setValue] = useState(rule.value ?? 0);
  const updateMut = useUpdateRewardsRule(rule.rule_id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateMut.mutateAsync({ value });
      toast.success(`${rule.title} updated`);
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit {rule.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="rule-value">
              {rule.unit === "usd" ? "Amount ($)" : rule.unit === "percent" ? "Percentage (%)" : "Value"} *
            </Label>
            <Input
              id="rule-value"
              type="number"
              min={0}
              max={rule.unit === "percent" ? 100 : undefined}
              step={rule.unit === "usd" ? 0.01 : 1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              required
              className="rounded-lg"
              autoFocus
            />
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

export default function AdminRewardsPage() {
  const { data, isLoading } = useRewardsRules();
  const rules = data?.data ?? [];
  const canEdit = usePermission("rewards.edit");
  const [editRule, setEditRule] = useState<RewardsRule | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 lg:p-2">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Rewards
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage the residential customer Rewards Credit program.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-card-border" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="border-b border-card-border px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">Rewards Rules</h2>
            </div>
            <div className="divide-y divide-card-border">
              {rules.map((rule) => (
                <div key={rule.rule_id} className="flex items-start justify-between gap-4 px-6 py-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Gift className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{rule.title}</h3>
                      <p className="mt-0.5 text-sm text-muted">{formatRewardsRuleDescription(rule)}</p>
                    </div>
                  </div>

                  {canEdit && rule.is_editable && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-lg"
                      onClick={() => setEditRule(rule)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editRule && (
        <EditRewardsRuleDialog open={!!editRule} onClose={() => setEditRule(null)} rule={editRule} />
      )}
    </div>
  );
}
