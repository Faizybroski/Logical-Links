"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, FileDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAuthStore } from "@/store/auth.store";

export const TERMS_VERSION = "1.0";
const TERMS_EFFECTIVE_DATE = "June 23, 2026";

const SHORT_TERMS_POINTS = [
  "Pricing is as stated in this quotation unless scope changes",
  "Additional work requires written approval and may incur additional charges",
  "Payment terms apply as outlined in the quotation",
  "The Client confirms they are authorized to accept this agreement",
  "Services are limited to the scope described in the quotation",
  "Liability is limited to the extent permitted by applicable law",
  "Full Terms & Conditions apply and are available for review",
];

const ACKNOWLEDGEMENT_POINTS = [
  "You have reviewed the quotation details in full",
  "You understand that pricing and scope are based strictly on this quotation",
  "You acknowledge that any changes may result in additional charges",
  "You confirm you are authorized to accept this quotation on behalf of the client/company",
  "You agree that acceptance will make this quotation binding under the Terms & Conditions",
];

const FULL_TERMS_SECTIONS: { heading: string; body: string }[] = [
  { heading: "1. Agreement", body: "By accepting a quotation, the Client agrees to these Terms and Conditions." },
  { heading: "2. Definitions", body: "“Company” refers to the service provider. “Client” refers to the party accepting the quotation. “Services” refers to all work described in the quotation." },
  { heading: "3. Scope of Services", body: "Services are limited strictly to the accepted quotation. Any additional work requires written approval and may incur additional charges." },
  { heading: "4. Pricing & Payment", body: "Pricing is as stated in the quotation. Payment terms apply as specified. Late payments may result in suspension of services." },
  { heading: "5. Changes & Cancellations", body: "Any changes or cancellations may result in charges for work already performed or committed resources." },
  { heading: "6. Client Responsibilities", body: "The Client is responsible for providing accurate information and ensuring compliance of any goods, instructions, or data provided for execution of services." },
  { heading: "7. Liability", body: "To the maximum extent permitted by applicable law, total liability is limited to the amount paid for the specific quotation. The Company is not liable for indirect, incidental, or consequential damages." },
  { heading: "8. No Warranty", body: "Services are provided without warranties of any kind unless expressly stated in writing." },
  { heading: "9. Force Majeure", body: "The Company is not liable for delays or failure caused by events beyond reasonable control." },
  { heading: "10. Data & Audit Records", body: "The Company may record acceptance details including user identity, company, timestamp, IP address, and Terms version for audit and compliance purposes." },
  { heading: "11. Intellectual Property", body: "Unless otherwise agreed in writing, all Company systems, methods, and materials remain the property of the Company." },
  { heading: "12. Governing Law", body: "These Terms are governed by the laws of Ontario and Canada." },
  { heading: "13. Entire Agreement", body: "These Terms, together with the accepted quotation, constitute the entire agreement between the parties." },
];

interface TermsAcceptanceModalProps {
  open: boolean;
  /** Modal's own "Decline" (cancel) — closes without saving anything. */
  onClose: () => void;
  /** Fired once the checkbox is ticked and Accept is clicked. */
  onAccept: () => void;
  loading?: boolean;
}

export function TermsAcceptanceModal({ open, onClose, onAccept, loading }: TermsAcceptanceModalProps) {
  const [showFull, setShowFull] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Fresh state every time the modal is (re)opened.
  useEffect(() => {
    if (open) {
      setShowFull(false);
      setAcknowledged(false);
    }
  }, [open]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const { accessToken } = getAuthStore();
      const base = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
      const res = await fetch(`${base}/api/v1/legal/terms.pdf`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to download Terms & Conditions");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "logical-links-terms-and-conditions.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl rounded-2xl border border-card-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Accept Quotation — Terms &amp; Conditions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Acknowledgement list */}
          <div className="rounded-xl border border-card-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">
              Before accepting this quotation, you confirm that:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
              {ACKNOWLEDGEMENT_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Short terms + expandable full terms */}
          <div className="rounded-xl border border-card-border bg-background p-4 text-sm text-foreground">
            <p className="font-bold">LOGICAL LINKS TERMS &amp; CONDITIONS (SUMMARY)</p>
            <p className="mt-0.5 text-xs text-muted">
              Version: {TERMS_VERSION} &middot; Effective Date: {TERMS_EFFECTIVE_DATE}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
              {SHORT_TERMS_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setShowFull((s) => !s)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              {showFull ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              View Full Terms &amp; Conditions
            </button>

            {showFull && (
              <div className="mt-3 space-y-3 border-t border-card-border pt-3 text-xs leading-relaxed text-muted">
                <div>
                  <p className="font-bold text-foreground">LOGICAL LINKS MASTER TERMS &amp; CONDITIONS</p>
                  <p>Version: {TERMS_VERSION} &middot; Effective Date: {TERMS_EFFECTIVE_DATE}</p>
                </div>
                {FULL_TERMS_SECTIONS.map((section) => (
                  <div key={section.heading}>
                    <p className="font-semibold text-foreground">{section.heading}</p>
                    <p>{section.body}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
              Download PDF version of the Terms
            </button>
          </div>

          {/* Required checkbox */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-card-border bg-background p-4">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-card-border text-primary focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-sm text-foreground">
              I acknowledge the above and agree to the Terms &amp; Conditions (including full version)
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border-card-border text-foreground hover:bg-background"
          >
            Decline
          </Button>
          <Button
            type="button"
            onClick={onAccept}
            disabled={!acknowledged || loading}
            className="rounded-lg bg-primary text-sidebar hover:bg-primary/85"
          >
            {loading ? "Accepting…" : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
