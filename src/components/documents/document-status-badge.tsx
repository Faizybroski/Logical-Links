"use client";

import type { QuotationStatus, InvoiceStatus, SupportCaseStatus, ContactMessageStatus } from "@/types/api.types";
import {
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  SUPPORT_CASE_STATUS_LABELS,
  SUPPORT_CASE_STATUS_COLORS,
  CONTACT_MESSAGE_STATUS_LABELS,
  CONTACT_MESSAGE_STATUS_COLORS,
} from "@/types/api.types";

// "Sent" is a corporate-only concept — it means an admin has priced and issued
// a quotation. Residential quotes are priced and returned instantly by the
// system, so a residential viewer sees "Ready to Accept" for the same
// underlying `sent` status instead of a label that implies someone sent it.
export function QuotationStatusBadge({ status, residential }: { status: QuotationStatus; residential?: boolean }) {
  const label = residential && status === "sent" ? "Ready to Accept" : QUOTATION_STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${QUOTATION_STATUS_COLORS[status]}`}
    >
      {label}
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

export function ContactMessageStatusBadge({ status }: { status: ContactMessageStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${CONTACT_MESSAGE_STATUS_COLORS[status]}`}
    >
      {CONTACT_MESSAGE_STATUS_LABELS[status]}
    </span>
  );
}
