"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { InvoiceEditor } from "@/components/documents/invoice-editor";
import { useAuthStore } from "@/store/auth.store";
import { useDelivery } from "@/hooks/use-deliveries";
import type { Delivery } from "@/types/api.types";

interface CreateInvoiceSheetProps {
  open: boolean;
  onClose: () => void;
  loadId?: string | null;
}

export function CreateInvoiceSheet({ open, onClose, loadId }: CreateInvoiceSheetProps) {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = user?.role === "admin";

  const { data: deliveryRes, isLoading: deliveryLoading } = useDelivery(loadId ?? "");
  const delivery = loadId ? (deliveryRes?.data as Delivery | undefined) : undefined;

  if (!user) return null;

  const loadPrefill = delivery
    ? {
        loadNumber:       delivery.load_number,
        originCity:       delivery.origin_city,
        originState:      delivery.origin_state,
        destinationCity:  delivery.destination_city,
        destinationState: delivery.destination_state,
        customerName:     delivery.accounts?.account_name ?? "",
        customerCompany:  delivery.accounts?.account_name ?? "",
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
              {isAdmin ? "Administration" : "Corporate Portal"}
            </p>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose} className="h-8 w-8 border-card-border">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {loadId && deliveryLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              // Keyed by loadId — see the identical comment in
              // create-quotation-sheet.tsx.
              <InvoiceEditor
                key={loadId ?? "new"}
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
