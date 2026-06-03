"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { QuotationEditor } from "@/components/documents/quotation-editor";
import { useAuthStore } from "@/store/auth.store";
import { useShipment } from "@/hooks/use-shipments";
import type { Shipment } from "@/types/api.types";

function CreateQuotationContent() {
  const user         = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const loadId       = searchParams.get("loadId");

  const { data: shipmentRes, isLoading: shipmentLoading } = useShipment(loadId ?? "");
  const shipment = loadId ? (shipmentRes?.data as Shipment | undefined) : undefined;

  if (!user) return null;
  if (loadId && shipmentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const loadPrefill = shipment ? {
    loadNumber:       shipment.load_number,
    originCity:       shipment.origin_city,
    originState:      shipment.origin_state,
    destinationCity:  shipment.destination_city,
    destinationState: shipment.destination_state,
    customerName:     shipment.accounts?.account_name ?? "",
    customerCompany:  shipment.accounts?.account_name ?? "",
  } : undefined;

  const title = loadPrefill
    ? `New Quotation for ${loadPrefill.loadNumber}`
    : "New Quotation";

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/admin/quotations" className="hover:text-foreground transition-colors">Quotations</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{title}</span>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/quotations"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              <p className="text-xs text-muted">Administration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <QuotationEditor
          profileId={user.id}
          redirectTo="/admin/quotations/[id]"
          isAdmin
          loadId={loadId}
          loadPrefill={loadPrefill}
        />
      </div>
    </div>
  );
}

export default function AdminCreateQuotationPage() {
  return (
    <Suspense>
      <CreateQuotationContent />
    </Suspense>
  );
}
