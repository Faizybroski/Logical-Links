"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  X, Clock, MessageSquare, Paperclip, ShieldCheck, FileDown, Loader2,
  PlusCircle, History, Send, Pencil, Trash2, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SupportCaseStatusBadge } from "@/components/documents/document-status-badge";
import {
  useSupportCase,
  useUpdateSupportCase,
  useDeleteSupportCase,
  useUpdateCaseStatus,
  useAddCaseComment,
  useUploadCaseAttachment,
} from "@/hooks/use-support";
import { useAuthStore } from "@/store/auth.store";
import { usePermission } from "@/hooks/use-permission";
import { ApiError } from "@/lib/api";
import {
  SUPPORT_CASE_STATUS_LABELS,
  type SupportCaseStatus,
  type SupportCaseEvent,
} from "@/types/api.types";

const STATUS_OPTIONS: SupportCaseStatus[] = ["open", "in_progress", "resolved", "closed"];
const OPEN_STATUSES = new Set<SupportCaseStatus>(["open", "in_progress"]);

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-AU", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function eventLabel(event: SupportCaseEvent): string {
  switch (event.event_type) {
    case "created":
      return "Case opened";
    case "status_changed":
      return `Status changed: ${event.from_status ? SUPPORT_CASE_STATUS_LABELS[event.from_status] : "—"} → ${event.to_status ? SUPPORT_CASE_STATUS_LABELS[event.to_status] : "—"}`;
    case "attachment_added":
      return `Attachment added${event.note ? `: ${event.note}` : ""}`;
    default:
      return "Update";
  }
}

interface CaseDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  caseId: string;
}

export function CaseDetailsSheet({ open, onClose, caseId }: CaseDetailsSheetProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const canReply = usePermission("support.reply");
  const canClose = usePermission("support.close");

  const { data: res, isLoading } = useSupportCase(caseId);
  const supportCase = res?.data;

  const statusMut  = useUpdateCaseStatus(caseId);
  const updateMut  = useUpdateSupportCase(caseId);
  const deleteMut  = useDeleteSupportCase();
  const commentMut = useAddCaseComment(caseId);
  const uploadMut  = useUploadCaseAttachment(caseId);

  const [commentText, setCommentText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing]         = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Sheet stays mounted across cases (only `caseId`/`open` change) — reset any
  // per-case draft state so it doesn't leak into the next case opened.
  useEffect(() => {
    setEditing(false);
    setEditSubject("");
    setEditDescription("");
    setCommentText("");
  }, [caseId]);

  const isOwner = !!supportCase && supportCase.created_by === user?.id;
  const canEdit = !!supportCase && ((isAdmin && canReply) || (isOwner && OPEN_STATUSES.has(supportCase.status)));
  const canComment = !isAdmin || canReply;

  function startEditing() {
    if (!supportCase) return;
    setEditSubject(supportCase.subject);
    setEditDescription(supportCase.description);
    setEditing(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editSubject.trim() || !editDescription.trim()) return;
    try {
      await updateMut.mutateAsync({ subject: editSubject.trim(), description: editDescription.trim() });
      toast.success("Case updated");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update case");
    }
  }

  async function handleDeleteCase() {
    if (!supportCase) return;
    if (!window.confirm(`Delete case ${supportCase.case_number}? This cannot be undone.`)) return;
    try {
      await deleteMut.mutateAsync(supportCase.case_id);
      toast.success("Case deleted");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete case");
    }
  }

  async function handleStatusChange(status: SupportCaseStatus) {
    try {
      await statusMut.mutateAsync({ status });
      toast.success("Case status updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await commentMut.mutateAsync(commentText.trim());
      setCommentText("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to post comment");
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadMut.mutateAsync(file);
      toast.success("Attachment uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload attachment");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} size="xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">
              {supportCase?.case_number ?? "Support Case"}
            </h2>
            {supportCase && <SupportCaseStatusBadge status={supportCase.status} />}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && canClose && supportCase && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleDeleteCase}
                disabled={deleteMut.isPending}
                className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={onClose} className="h-8 w-8 border-card-border">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !supportCase ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-sm text-muted">Case not found.</p>
            </div>
          ) : (
            <div className="space-y-5 p-6">
              {/* Subject / description */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                {editing ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3 p-5">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted">Subject</label>
                      <input
                        type="text"
                        required
                        maxLength={200}
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted">Description</label>
                      <textarea
                        required
                        maxLength={5000}
                        rows={4}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full resize-none rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(false)}
                        disabled={updateMut.isPending}
                        className="h-8 rounded-lg border-card-border text-xs text-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updateMut.isPending || !editSubject.trim() || !editDescription.trim()}
                        className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85 gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {updateMut.isPending ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-foreground">{supportCase.subject}</h3>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={startEditing}
                          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                      {supportCase.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-light">
                      Opened {fmtDateTime(supportCase.created_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-card-border px-5 py-4">
                  <ShieldCheck className="h-4 w-4 text-muted" />
                  <h3 className="text-sm font-semibold text-foreground">Status</h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 p-5">
                  <SupportCaseStatusBadge status={supportCase.status} />
                  {isAdmin && canClose ? (
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.filter((s) => s !== supportCase.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleStatusChange(s)}
                          disabled={statusMut.isPending}
                          className="rounded-lg border border-card-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-50"
                        >
                          Mark as {SUPPORT_CASE_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">Only support staff can change the case status.</p>
                  )}
                </div>
              </div>

              {/* Case history */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-card-border px-5 py-4">
                  <History className="h-4 w-4 text-muted" />
                  <h3 className="text-sm font-semibold text-foreground">Case History</h3>
                </div>
                <div className="divide-y divide-card-border">
                  {supportCase.events.length === 0 ? (
                    <p className="px-5 py-4 text-sm italic text-muted">No history yet.</p>
                  ) : (
                    supportCase.events.map((event) => (
                      <div key={event.event_id} className="flex items-start gap-3 px-5 py-3">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">{eventLabel(event)}</p>
                          <p className="text-xs text-muted-light">
                            {fmtDateTime(event.created_at)}
                            {event.author?.fullName ? ` · ${event.author.fullName}` : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b border-card-border px-5 py-4">
                  <MessageSquare className="h-4 w-4 text-muted" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Comments {supportCase.comments.length > 0 && `(${supportCase.comments.length})`}
                  </h3>
                </div>
                <div className="divide-y divide-card-border">
                  {supportCase.comments.length === 0 ? (
                    <p className="px-5 py-4 text-sm italic text-muted">No comments yet.</p>
                  ) : (
                    supportCase.comments.map((comment) => (
                      <div key={comment.comment_id} className="flex items-start gap-3 px-5 py-4">
                        <UserAvatar
                          name={comment.author?.fullName ?? null}
                          avatarUrl={comment.author?.avatarUrl ?? null}
                          size="sm"
                          rounded="full"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {comment.author?.fullName ?? "Unknown"}
                            </p>
                            <p className="text-xs text-muted-light">{fmtDateTime(comment.created_at)}</p>
                          </div>
                          <p className="mt-1 whitespace-pre-line text-sm text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {canComment && (
                  <form onSubmit={handlePostComment} className="border-t border-card-border p-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment…"
                      rows={2}
                      className="w-full resize-none rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={commentMut.isPending || !commentText.trim()}
                        className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85 gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Post Comment
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Attachments */}
              <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-muted" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Attachments {supportCase.attachments.length > 0 && `(${supportCase.attachments.length})`}
                    </h3>
                  </div>
                  {canComment && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadMut.isPending}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                    >
                      {uploadMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
                      Add file
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
                </div>
                <div className="divide-y divide-card-border">
                  {supportCase.attachments.length === 0 ? (
                    <p className="px-5 py-4 text-sm italic text-muted">No attachments yet.</p>
                  ) : (
                    supportCase.attachments.map((att) => (
                      <div key={att.attachment_id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{att.file_name}</p>
                          <p className="text-xs text-muted-light">{fmtDateTime(att.created_at)}</p>
                        </div>
                        {att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-card-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            Download
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
