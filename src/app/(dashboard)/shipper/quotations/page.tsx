"use client";

import { toast } from "sonner";
import { FileText, CheckCircle2, Send, Clock } from "lucide-react";
import { KpiCard } from "@/components/loads/kpi-card";
import { QuotationsList } from "@/components/documents/documents-list";
import { useQuotations, useDuplicateQuotation, useDeleteQuotation } from "@/hooks/use-quotations";
import { useAuthStore } from "@/store/auth.store";

export default function ShipperQuotationsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: res, isLoading } = useQuotations({ profileId: user?.id, limit: 200 });
  const quotations = res?.data ?? [];

  const duplicateMut = useDuplicateQuotation();
  const deleteMut    = useDeleteQuotation();

  const stats = {
    total:    quotations.length,
    draft:    quotations.filter((q) => q.status === "draft").length,
    sent:     quotations.filter((q) => q.status === "sent").length,
    accepted: quotations.filter((q) => q.status === "accepted").length,
  };

  async function handleDuplicate(id: string) {
    await duplicateMut.mutateAsync(id);
    toast.success("Quotation duplicated");
  }
  async function handleDelete(id: string) {
    await deleteMut.mutateAsync(id);
    toast.success("Quotation deleted");
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-2">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-7">

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Shipper Portal</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">My Quotations</h1>
          <p className="mt-2 text-sm text-muted">View and manage your freight quotations.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total"    value={stats.total}    icon={FileText}     chartColor="#C89B3C" isLoading={isLoading} />
          <KpiCard title="Draft"    value={stats.draft}    icon={Clock}        chartColor="#6B7280" isLoading={isLoading} />
          <KpiCard title="Sent"     value={stats.sent}     icon={Send}         chartColor="#3B82F6" isLoading={isLoading} />
          <KpiCard title="Accepted" value={stats.accepted} icon={CheckCircle2} chartColor="#22C55E" isLoading={isLoading} />
        </div>

        <QuotationsList
          quotations={quotations}
          basePath="/shipper/quotations"
          isLoading={isLoading}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
