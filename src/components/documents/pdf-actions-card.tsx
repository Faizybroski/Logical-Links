"use client";

import { useState } from "react";
import { FileDown, ExternalLink, Copy, Check, FileX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PdfActionsCardProps {
  pdfUrl: string | null;
  filename: string; // e.g. "invoice-INV-001.pdf"
}

/**
 * Sidebar card shown on Invoice and Quotation detail pages.
 * Displays PDF availability status and provides:
 *   - View PDF  (opens in new tab)
 *   - Download PDF  (fetches as blob → triggers browser download)
 *   - Copy Link  (copies URL to clipboard)
 *
 * The blob-download approach is required because the PDF is hosted on
 * Supabase Storage (a different origin). The HTML `download` attribute is
 * silently ignored for cross-origin URLs in modern browsers, so we fetch
 * the file ourselves, create an object URL, and click it programmatically.
 */
export function PdfActionsCard({ pdfUrl, filename }: PdfActionsCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownload() {
    if (!pdfUrl) return;
    setIsDownloading(true);
    try {
      const res = await fetch(pdfUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleCopy() {
    if (!pdfUrl) return;
    try {
      await navigator.clipboard.writeText(pdfUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("PDF link copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="border-b border-card-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">PDF Document</h3>
      </div>

      <div className="p-5">
        {pdfUrl ? (
          <div className="space-y-3">
            {/* Availability pill */}
            <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700">PDF Available</span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 w-full justify-start rounded-lg border-card-border px-3 text-xs gap-2"
              >
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View PDF
                </a>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="h-8 w-full justify-start rounded-lg border-card-border px-3 text-xs gap-2"
              >
                {isDownloading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <FileDown className="h-3.5 w-3.5" />}
                {isDownloading ? "Downloading…" : "Download PDF"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-full justify-start rounded-lg border-card-border px-3 text-xs gap-2"
              >
                {copied
                  ? <Check className="h-3.5 w-3.5 text-green-500" />
                  : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/10">
              <FileX className="h-5 w-5 text-muted" />
            </div>
            <p className="text-xs font-medium text-muted">No PDF generated yet</p>
            <p className="text-[11px] text-muted">Use "Generate PDF" above to create one</p>
          </div>
        )}
      </div>
    </div>
  );
}
