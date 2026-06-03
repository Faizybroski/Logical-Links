"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuotationEditor } from "@/components/documents/quotation-editor";
import { useQuotation } from "@/hooks/use-quotations";
import { useAuthStore } from "@/store/auth.store";

export default function ShipperEditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user   = useAuthStore((s) => s.user);
  const { data: res, isLoading } = useQuotation(id);
  const quotation = res?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!quotation || !user) return null;

  if (quotation.status !== "draft") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted">Only draft quotations can be edited.</p>
        <Button variant="outline" asChild>
          <Link href={`/shipper/quotations/${id}`}>Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/shipper/quotations" className="hover:text-foreground transition-colors">Quotations</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/shipper/quotations/${id}`} className="hover:text-foreground transition-colors">{quotation.quotation_number}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Edit</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={`/shipper/quotations/${id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Edit {quotation.quotation_number}</h1>
              <p className="text-xs text-muted">Shipper Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-2 sm:py-8">
        <QuotationEditor profileId={user.id} quotation={quotation} redirectTo={`/shipper/quotations/${id}`} />
      </div>
    </div>
  );
}
