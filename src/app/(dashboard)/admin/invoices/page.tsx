"use client";

import { toast } from "sonner";
import { FileText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { KpiCard } from "@/components/loads/kpi-card";
import { InvoicesList } from "@/components/documents/documents-list";
import { useInvoices, useDuplicateInvoice, useDeleteInvoice } from "@/hooks/use-invoices";

export default function AdminInvoicesPage() {
  const { data: res, isLoading } = useInvoices({ limit: 100 });
  const invoices = res?.data ?? [];

  const duplicateMut = useDuplicateInvoice();
  const deleteMut    = useDeleteInvoice();

  const stats = {
    total:   invoices.length,
    unpaid:  invoices.filter((i) => i.status === "unpaid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    paid:    invoices.filter((i) => i.status === "paid").length,
  };

  async function handleDuplicate(id: string) {
    await duplicateMut.mutateAsync(id);
    toast.success("Invoice duplicated");
  }
  async function handleDelete(id: string) {
    await deleteMut.mutateAsync(id);
    toast.success("Invoice deleted");
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-2">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-7">

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Invoices</h1>
          <p className="mt-2 text-sm text-muted">Create and manage all customer invoices.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total"   value={stats.total}   icon={FileText}     chartColor="#C89B3C" isLoading={isLoading} />
          <KpiCard title="Unpaid"  value={stats.unpaid}  icon={Clock}        chartColor="#EAB308" isLoading={isLoading} />
          <KpiCard title="Overdue" value={stats.overdue} icon={AlertCircle}  chartColor="#EF4444" isLoading={isLoading} />
          <KpiCard title="Paid"    value={stats.paid}    icon={CheckCircle2} chartColor="#22C55E" isLoading={isLoading} />
        </div>

        <InvoicesList
          invoices={invoices}
          basePath="/admin/invoices"
          isLoading={isLoading}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
