"use client";

import type { QuotationStatus, InvoiceStatus, SupportCaseStatus } from "@/types/api.types";
import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  SUPPORT_CASE_STATUS_LABELS,
  SUPPORT_CASE_STATUS_COLORS,
} from "@/types/api.types";

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${QUOTATION_STATUS_COLORS[status]}`}
    >
      {QUOTATION_STATUS_LABELS[status]}
    </span>
  );
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${INVOICE_STATUS_COLORS[status]}`}
    >
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}

export function SupportCaseStatusBadge({ status }: { status: SupportCaseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${SUPPORT_CASE_STATUS_COLORS[status]}`}
    >
      {SUPPORT_CASE_STATUS_LABELS[status]}
    </span>
  );
}
