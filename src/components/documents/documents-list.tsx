"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MoreVertical,
  Plus,
  FileText,
  Copy,
  Trash2,
  Eye,
  Pencil,
  FileDown,
  FileCheck2,
  FileX,
  Loader2,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/loads/loads-table";
import {
  QuotationStatusBadge,
  InvoiceStatusBadge,
} from "./document-status-badge";
import type { Quotation, Invoice } from "@/types/api.types";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(n);
}

// ── Blob-download helper ──────────────────────────────────────────────────────
// The HTML `download` attribute is ignored for cross-origin URLs in modern
// browsers, so we fetch the PDF ourselves and trigger a programmatic download.
async function downloadPdfBlob(url: string, filename: string): Promise<void> {
  const res = await fetch(url, { cache: "no-store" });
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
}

// ── PDF status chip shown in the listing column ───────────────────────────────
function PdfChip({ url }: { url: string | null }) {
  if (url) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/8 px-2 py-0.5 text-[11px] font-medium text-green-700">
        <FileCheck2 className="h-3 w-3" />
        PDF
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-card-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted">
      <FileX className="h-3 w-3" />
      No PDF
    </span>
  );
}

/* ── Quotation list ────────────────────────────────────────────────────────── */

interface QuotationListProps {
  quotations: Quotation[];
  basePath: string;
  isLoading?: boolean;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function QuotationsList({
  quotations,
  basePath,
  isLoading,
  onDuplicate,
  onDelete,
}: QuotationListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search
    ? quotations.filter(
        (q) =>
          q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
          q.customer_name.toLowerCase().includes(search.toLowerCase()) ||
          (q.customer_company ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : quotations;

  const columns: ColumnDef<Quotation>[] = [
    {
      id: "number",
      header: "Quotation #",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.original.quotation_number}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.customer_name}
          </p>
          {row.original.customer_company && (
            <p className="text-xs text-muted">
              {row.original.customer_company}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <QuotationStatusBadge status={row.original.status} />,
    },
    {
      id: "date",
      header: "Issue Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted tabular-nums">
          {fmtDate(row.original.issue_date)}
        </span>
      ),
    },
    {
      id: "expiry",
      header: "Expiry",
      cell: ({ row }) => (
        <span className="text-xs text-muted tabular-nums">
          {row.original.expiry_date ? fmtDate(row.original.expiry_date) : "—"}
        </span>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-foreground">
          {fmtCurrency(row.original.total)}
        </span>
      ),
    },
    {
      id: "pdf",
      header: "PDF",
      cell: ({ row }) => <PdfChip url={row.original.pdf_url ?? null} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <QuotationActions
          quotation={row.original}
          basePath={basePath}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable<Quotation>
      title="Quotations"
      columns={columns}
      data={filtered}
      isLoading={isLoading}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by number, customer…"
      onRowClick={(q) => router.push(`${basePath}/${q.id}`)}
      pageSize={20}
      headerActions={
        <Button
          asChild
          size="sm"
          className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85 gap-1.5"
        >
          <Link href={`${basePath}/create`}>
            <Plus className="h-3.5 w-3.5" /> New Quotation
          </Link>
        </Button>
      }
      emptyState={
        <div className="flex flex-col items-center gap-2 py-8">
          <FileText className="h-8 w-8 text-muted-light" />
          <p className="text-sm font-medium text-muted">No quotations found</p>
          <p className="text-xs text-muted-light">
            Create a new quotation to get started
          </p>
        </div>
      }
    />
  );
}

function QuotationActions({
  quotation,
  basePath,
  onDuplicate,
  onDelete,
}: {
  quotation: Quotation;
  basePath: string;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    if (!quotation.pdf_url) return;
    setIsDownloading(true);
    try {
      await downloadPdfBlob(
        quotation.pdf_url,
        `quotation-${quotation.quotation_number}.pdf`,
      );
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={busy || isDownloading}
          className="h-8 w-8 border-card-border bg-transparent text-foreground hover:bg-background"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-xl border-card-border bg-card shadow-lg"
      >
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg">
          <Link href={`${basePath}/${quotation.id}`}>
            <Eye className="h-4 w-4" /> View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg">
          <Link href={`${basePath}/${quotation.id}/edit`}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>
        {quotation.pdf_url && (
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-lg"
            onClick={handleDownload}
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-lg"
          onClick={() => act(() => onDuplicate(quotation.id))}
        >
          <Copy className="h-4 w-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger"
          onClick={() => act(() => onDelete(quotation.id))}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ── Invoice list ──────────────────────────────────────────────────────────── */

interface InvoiceListProps {
  invoices: Invoice[];
  basePath: string;
  isLoading?: boolean;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function InvoicesList({
  invoices,
  basePath,
  isLoading,
  onDuplicate,
  onDelete,
}: InvoiceListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search
    ? invoices.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
          inv.customer_name.toLowerCase().includes(search.toLowerCase()) ||
          (inv.customer_company ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : invoices;

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "number",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.original.invoice_number}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.customer_name}
          </p>
          {row.original.customer_company && (
            <p className="text-xs text-muted">
              {row.original.customer_company}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
    },
    {
      id: "due",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="text-xs text-muted tabular-nums">
          {row.original.due_date ? fmtDate(row.original.due_date) : "—"}
        </span>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-foreground">
          {fmtCurrency(row.original.total)}
        </span>
      ),
    },
    {
      id: "balance",
      header: "Balance Due",
      cell: ({ row }) => (
        <span
          className={`font-semibold tabular-nums ${row.original.balance_due > 0 ? "text-danger" : "text-green-600"}`}
        >
          {fmtCurrency(row.original.balance_due)}
        </span>
      ),
    },
    {
      id: "pdf",
      header: "PDF",
      cell: ({ row }) => <PdfChip url={row.original.pdf_url ?? null} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <InvoiceActions
          invoice={row.original}
          basePath={basePath}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <DataTable<Invoice>
      title="Invoices"
      columns={columns}
      data={filtered}
      isLoading={isLoading}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by number, customer…"
      onRowClick={(inv) => router.push(`${basePath}/${inv.id}`)}
      pageSize={20}
      headerActions={
        <Button
          asChild
          size="sm"
          className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85 gap-1.5"
        >
          <Link href={`${basePath}/create`}>
            <Plus className="h-3.5 w-3.5" /> New Invoice
          </Link>
        </Button>
      }
      emptyState={
        <div className="flex flex-col items-center gap-2 py-8">
          <FileText className="h-8 w-8 text-muted-light" />
          <p className="text-sm font-medium text-muted">No invoices found</p>
          <p className="text-xs text-muted-light">
            Create a new invoice to get started
          </p>
        </div>
      }
    />
  );
}

function InvoiceActions({
  invoice,
  basePath,
  onDuplicate,
  onDelete,
}: {
  invoice: Invoice;
  basePath: string;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    if (!invoice.pdf_url) return;
    setIsDownloading(true);
    try {
      await downloadPdfBlob(
        invoice.pdf_url,
        `invoice-${invoice.invoice_number}.pdf`,
      );
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={busy || isDownloading}
          className="h-8 w-8 border-card-border bg-transparent text-foreground hover:bg-background"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreVertical className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 rounded-xl border-card-border bg-card shadow-lg"
      >
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg">
          <Link href={`${basePath}/${invoice.id}`}>
            <Eye className="h-4 w-4" /> View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-lg">
          <Link href={`${basePath}/${invoice.id}/edit`}>
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        </DropdownMenuItem>
        {invoice.pdf_url && (
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-lg"
            onClick={handleDownload}
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-lg"
          onClick={() => act(() => onDuplicate(invoice.id))}
        >
          <Copy className="h-4 w-4" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 rounded-lg text-danger focus:text-danger"
          onClick={() => act(() => onDelete(invoice.id))}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
