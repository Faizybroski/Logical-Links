"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { InvoiceEditor } from "@/components/documents/invoice-editor";
import { useAuthStore } from "@/store/auth.store";
import { useShipment } from "@/hooks/use-shipments";
import type { Shipment } from "@/types/api.types";

interface CreateInvoiceSheetProps {
  open: boolean;
  onClose: () => void;
  loadId?: string | null;
}

export function CreateInvoiceSheet({ open, onClose, loadId }: CreateInvoiceSheetProps) {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = user?.role === "admin";

  const { data: shipmentRes, isLoading: shipmentLoading } = useShipment(loadId ?? "");
  const shipment = loadId ? (shipmentRes?.data as Shipment | undefined) : undefined;

  if (!user) return null;

  const loadPrefill = shipment
    ? {
        loadNumber:       shipment.load_number,
        originCity:       shipment.origin_city,
        originState:      shipment.origin_state,
        destinationCity:  shipment.destination_city,
        destinationState: shipment.destination_state,
        customerName:     shipment.accounts?.account_name ?? "",
        customerCompany:  shipment.accounts?.account_name ?? "",
      }
    : undefined;

  const redirectTo = `${pathname}?details=[id]`;

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {loadPrefill ? `New Invoice for ${loadPrefill.loadNumber}` : "New Invoice"}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {isAdmin ? "Administration" : "Shipper Portal"}
            </p>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose} className="h-8 w-8 border-card-border">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {loadId && shipmentLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <InvoiceEditor
                profileId={user.id}
                redirectTo={redirectTo}
                isAdmin={isAdmin}
                loadId={loadId}
                loadPrefill={loadPrefill}
              />
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
