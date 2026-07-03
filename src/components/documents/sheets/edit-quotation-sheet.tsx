"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { QuotationEditor } from "@/components/documents/quotation-editor";
import { QuotationStatusBadge } from "@/components/documents/document-status-badge";
import { useQuotation } from "@/hooks/use-quotations";
import { useAuthStore } from "@/store/auth.store";

interface EditQuotationSheetProps {
  open: boolean;
  onClose: () => void;
  quotationId: string;
}

export function EditQuotationSheet({ open, onClose, quotationId }: EditQuotationSheetProps) {
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const { data: res, isLoading } = useQuotation(quotationId);
  const quotation = res?.data;

  if (!user) return null;

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-foreground">
              {quotation ? `Edit ${quotation.quotation_number}` : "Edit Quotation"}
            </h2>
            {quotation && <QuotationStatusBadge status={quotation.status} />}
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
          ) : !quotation ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted">Quotation not found.</p>
            </div>
          ) : (
            <div className="px-6 py-6">
              <QuotationEditor
                profileId={user.id}
                quotation={quotation}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
