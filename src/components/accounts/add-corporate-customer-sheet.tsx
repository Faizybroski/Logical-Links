"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAccount } from "@/hooks/use-accounts";
import {
  CORPORATE_PIPELINE_STATUSES,
  CORPORATE_PIPELINE_STATUS_META,
  type CorporatePipelineStatus,
  type CreateAccountDto,
} from "@/types/api.types";

type Props = { open: boolean; onClose: () => void };

const EMPTY = {
  accountName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  website: "",
  addressCity: "",
  addressState: "",
};

export function AddCorporateCustomerSheet({ open, onClose }: Props) {
  const router = useRouter();
  const createMut = useCreateAccount();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<CorporatePipelineStatus>("prospect");

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm(EMPTY);
    setStatus("prospect");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.accountName.trim().length < 2) {
      toast.error("Company name is required");
      return;
    }
    const dto: CreateAccountDto = {
      accountName: form.accountName.trim(),
      pipelineStatus: status,
      ...(form.contactName.trim() && { contactName: form.contactName.trim() }),
      ...(form.contactEmail.trim() && { contactEmail: form.contactEmail.trim() }),
      ...(form.contactPhone.trim() && { contactPhone: form.contactPhone.trim() }),
      ...(form.website.trim() && { website: form.website.trim() }),
      ...(form.addressCity.trim() && { addressCity: form.addressCity.trim() }),
      ...(form.addressState.trim() && { addressState: form.addressState.trim() }),
    };
    try {
      const res = await createMut.mutateAsync(dto);
      toast.success(`${dto.accountName} added`);
      reset();
      onClose();
      const id = res?.data?.account_id;
      if (id) router.push(`/admin/corporate-customers/${id}`);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to add corporate customer");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="shrink-0 border-b border-card-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Building2 className="h-4 w-4 text-muted" />
            Add Corporate Customer
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Create a company record — no login is created. Move it through the pipeline as the
            relationship develops.
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="space-y-1.5">
            <Label htmlFor="acc-name">Company name *</Label>
            <Input
              id="acc-name"
              value={form.accountName}
              onChange={(e) => set("accountName", e.target.value)}
              className="rounded-lg"
              autoFocus
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Pipeline stage</Label>
            <div className="flex flex-wrap gap-2">
              {CORPORATE_PIPELINE_STATUSES.map((s) => {
                const meta = CORPORATE_PIPELINE_STATUS_META[s];
                const selected = s === status;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      selected ? meta.badge : "border-card-border bg-card text-muted hover:text-foreground"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted">{CORPORATE_PIPELINE_STATUS_META[status].description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="acc-contact-name">Contact name</Label>
              <Input id="acc-contact-name" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-contact-email">Contact email</Label>
              <Input id="acc-contact-email" type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-contact-phone">Contact phone</Label>
              <Input id="acc-contact-phone" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-website">Website</Label>
              <Input id="acc-website" placeholder="https://" value={form.website} onChange={(e) => set("website", e.target.value)} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-city">City</Label>
              <Input id="acc-city" value={form.addressCity} onChange={(e) => set("addressCity", e.target.value)} className="rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-state">State</Label>
              <Input id="acc-state" value={form.addressState} onChange={(e) => set("addressState", e.target.value)} className="rounded-lg" />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-card-border px-6 py-4">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-lg" onClick={onClose} disabled={createMut.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={createMut.isPending}>
              {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add customer"}
            </Button>
          </div>
        </div>
      </form>
    </Sheet>
  );
}
