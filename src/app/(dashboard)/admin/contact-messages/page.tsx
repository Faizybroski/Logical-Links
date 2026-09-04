"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, X } from "lucide-react";
import { DataTable } from "@/components/deliveries/deliveries-table";
import { ContactMessageStatusBadge } from "@/components/documents/document-status-badge";
import { Sheet } from "@/components/ui/sheet";
import { usePermission } from "@/hooks/use-permission";
import { useContactMessages, useUpdateContactMessageStatus } from "@/hooks/use-contact";
import {
  CONTACT_MESSAGE_STATUS_LABELS,
  type ContactMessage,
  type ContactMessageStatus,
} from "@/types/api.types";

const STATUS_OPTIONS: ContactMessageStatus[] = ["new", "in_progress", "resolved"];

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-AU", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function MessageDetailsSheet({
  message,
  onClose,
  canReply,
}: {
  message: ContactMessage | null;
  onClose: () => void;
  canReply: boolean;
}) {
  const statusMut = useUpdateContactMessageStatus();

  return (
    <Sheet open={!!message} onClose={onClose} size="lg">
      {message && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Contact Message
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{message.subject}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-card-border/40"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">From</p>
                <p className="mt-1 text-foreground">{message.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Status</p>
                <div className="mt-1"><ContactMessageStatusBadge status={message.status} /></div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Email</p>
                <p className="mt-1 text-foreground">{message.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Phone</p>
                <p className="mt-1 text-foreground">{message.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Received</p>
                <p className="mt-1 text-foreground">{fmtDateTime(message.created_at)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Message</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {message.message}
              </p>
            </div>

            {canReply && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Update status</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={statusMut.isPending || s === message.status}
                      onClick={() => statusMut.mutate({ id: message.id, dto: { status: s } })}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-default ${
                        s === message.status
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-card-border text-muted hover:bg-card-border/30"
                      }`}
                    >
                      {CONTACT_MESSAGE_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
}

export default function AdminContactMessagesPage() {
  const canView = usePermission("support.view");
  const canReply = usePermission("support.reply");

  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);

  const { data: res, isLoading } = useContactMessages({ page: 1, limit: 50 });
  const messages = res?.data ?? [];

  const columns: ColumnDef<ContactMessage>[] = [
    {
      id: "name",
      header: "From",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-foreground">{row.original.name}</span>
      ),
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="text-sm text-foreground truncate block max-w-xs">{row.original.subject}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <ContactMessageStatusBadge status={row.original.status} />,
    },
    {
      id: "created_at",
      header: "Received",
      cell: ({ row }) => (
        <span className="text-xs text-muted tabular-nums">{fmtDateTime(row.original.created_at)}</span>
      ),
    },
  ];

  if (!canView) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">You do not have access to Contact Messages.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-2">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Support</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Contact Messages</h1>
          <p className="mt-2 text-sm text-muted">
            Messages submitted through the public &quot;Contact Support&quot; form.
          </p>
        </div>

        <DataTable<ContactMessage>
          title="Inbox"
          columns={columns}
          data={messages}
          isLoading={isLoading}
          onRowClick={(m) => setActiveMessage(m)}
          pageSize={50}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-8">
              <Mail className="h-8 w-8 text-muted-light" />
              <p className="text-sm font-medium text-muted">No contact messages yet</p>
              <p className="text-xs text-muted-light">Messages from the public contact form will appear here</p>
            </div>
          }
        />
      </div>

      <MessageDetailsSheet
        message={activeMessage}
        onClose={() => setActiveMessage(null)}
        canReply={canReply}
      />
    </div>
  );
}
