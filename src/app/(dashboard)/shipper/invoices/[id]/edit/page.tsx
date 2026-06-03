"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceEditor } from "@/components/documents/invoice-editor";
import { useInvoice } from "@/hooks/use-invoices";
import { useAuthStore } from "@/store/auth.store";

export default function ShipperEditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user   = useAuthStore((s) => s.user);
  const { data: res, isLoading } = useInvoice(id);
  const invoice = res?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!invoice || !user) return null;

  if (invoice.status !== "draft") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted">Only draft invoices can be edited.</p>
        <Button variant="outline" asChild>
          <Link href={`/shipper/invoices/${id}`}>Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/shipper/invoices" className="hover:text-foreground transition-colors">Invoices</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/shipper/invoices/${id}`} className="hover:text-foreground transition-colors">{invoice.invoice_number}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Edit</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={`/shipper/invoices/${id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Edit {invoice.invoice_number}</h1>
              <p className="text-xs text-muted">Shipper Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-2 sm:py-8">
        <InvoiceEditor profileId={user.id} invoice={invoice} redirectTo={`/shipper/invoices/${id}`} />
      </div>
    </div>
  );
}
