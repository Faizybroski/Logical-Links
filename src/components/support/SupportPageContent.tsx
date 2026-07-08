"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Phone, Mail, LifeBuoy, ChevronDown, ChevronUp } from "lucide-react";
import { DataTable } from "@/components/loads/loads-table";
import { SupportCaseStatusBadge } from "@/components/documents/document-status-badge";
import { NewCaseDialog } from "@/components/support/new-case-dialog";
import { CaseDetailsSheet } from "@/components/support/case-details-sheet";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useSupportCases } from "@/hooks/use-support";
import { useAuthStore } from "@/store/auth.store";
import { KNOWLEDGE_BASE_ARTICLES } from "@/lib/knowledge-base";
import type { SupportCase } from "@/types/api.types";

const SUPPORT_PHONE = "1300 000 000";
const SUPPORT_EMAIL = "support@logicallinks.com.au";

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function KnowledgeBaseCard({ slug, title, summary, body }: (typeof KNOWLEDGE_BASE_ARTICLES)[number]) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{summary}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted" />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-card-border px-5 py-4">
          {body.map((paragraph, i) => (
            <p key={`${slug}-${i}`} className="text-sm leading-relaxed text-muted">{paragraph}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function SupportPageContent() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [createOpen, setCreateOpen] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  const { data: res, isLoading } = useSupportCases({ page: 1, limit: 50 });
  const cases = res?.data ?? [];

  const columns: ColumnDef<SupportCase>[] = [
    {
      id: "case_number",
      header: "Case #",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{row.original.case_number}</span>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="text-sm text-foreground truncate block max-w-xs">{row.original.subject}</span>
      ),
    },
    // Admin manages cases system-wide, so surface who/which company raised each one.
    ...(isAdmin
      ? [
          {
            id: "requester",
            header: "Requester",
            cell: ({ row }: { row: { original: SupportCase } }) => (
              <div className="flex items-center gap-2">
                <UserAvatar
                  name={row.original.author?.fullName ?? null}
                  avatarUrl={row.original.author?.avatarUrl ?? null}
                  size="xs"
                  rounded="full"
                />
                <span className="text-sm text-foreground truncate max-w-[120px]">
                  {row.original.author?.fullName ?? "—"}
                </span>
              </div>
            ),
          },
          {
            id: "company",
            header: "Company",
            cell: ({ row }: { row: { original: SupportCase } }) =>
              row.original.accounts?.account_name ? (
                <div className="flex items-center gap-2">
                  <CompanyLogo
                    name={row.original.accounts.account_name}
                    logoUrl={row.original.accounts.logo_url ?? null}
                    size="xs"
                    rounded="lg"
                  />
                  <span className="text-sm text-foreground truncate max-w-[120px]">
                    {row.original.accounts.account_name}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted">—</span>
              ),
          },
        ]
      : []),
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <SupportCaseStatusBadge status={row.original.status} />,
    },
    {
      id: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => (
        <span className="text-xs text-muted tabular-nums">{fmtDate(row.original.updated_at)}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-2">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Support</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Support &amp; Ticketing</h1>
          <p className="mt-2 text-sm text-muted">
            {isAdmin
              ? "Manage and respond to all customer support cases."
              : "Get help, track your support cases, and find answers."}
          </p>
        </div>

        {/* Top row — customer-facing help actions, not shown to support staff */}
        {!isAdmin && (
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">New Support Request</p>
                <p className="text-xs text-muted">Open a new case</p>
              </div>
            </button>

            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`}
              className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Call Support</p>
                <p className="text-xs text-muted">{SUPPORT_PHONE}</p>
              </div>
            </a>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Email Support</p>
                <p className="text-xs text-muted">{SUPPORT_EMAIL}</p>
              </div>
            </a>
          </div>
        )}

        {/* Open cases */}
        <DataTable<SupportCase>
          title="Open Cases"
          columns={columns}
          data={cases}
          isLoading={isLoading}
          onRowClick={(c) => setActiveCaseId(c.case_id)}
          pageSize={50}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-8">
              <LifeBuoy className="h-8 w-8 text-muted-light" />
              <p className="text-sm font-medium text-muted">No support cases yet</p>
              <p className="text-xs text-muted-light">Raise a new support request to get started</p>
            </div>
          }
        />

        {/* Knowledge base — customer-facing help content, not shown to support staff */}
        {!isAdmin && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Knowledge Base</h2>
            <div className="space-y-3">
              {KNOWLEDGE_BASE_ARTICLES.map((article) => (
                <KnowledgeBaseCard key={article.slug} {...article} />
              ))}
            </div>
          </div>
        )}
      </div>

      {!isAdmin && (
        <NewCaseDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(caseId) => { setCreateOpen(false); setActiveCaseId(caseId); }}
        />
      )}

      <CaseDetailsSheet
        open={!!activeCaseId}
        onClose={() => setActiveCaseId(null)}
        caseId={activeCaseId ?? ""}
      />
    </div>
  );
}
