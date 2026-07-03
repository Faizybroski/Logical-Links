"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { InvoiceEditor } from "@/components/documents/invoice-editor";
import { InvoiceStatusBadge } from "@/components/documents/document-status-badge";
import { useInvoice } from "@/hooks/use-invoices";
import { useAuthStore } from "@/store/auth.store";

interface EditInvoiceSheetProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
}

export function EditInvoiceSheet({ open, onClose, invoiceId }: EditInvoiceSheetProps) {
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const { data: res, isLoading } = useInvoice(invoiceId);
  const invoice = res?.data;

  if (!user) return null;

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">
              {invoice ? `Edit ${invoice.invoice_number}` : "Edit Invoice"}
            </h2>
            {invoice && <InvoiceStatusBadge status={invoice.status} />}
          </div>
          <Button type="button" variant="outline" size="icon" onClick={onClose} className="h-8 w-8 border-card-border">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !invoice ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted">Invoice not found.</p>
            </div>
          ) : (
            <div className="px-6 py-6">
              <InvoiceEditor
                profileId={user.id}
                invoice={invoice}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
