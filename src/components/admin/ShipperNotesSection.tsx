"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  PlusCircle,
  Pencil,
  Trash2,
  StickyNote,
  Check,
  X,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useShipperNotes,
  useCreateShipperNote,
  useUpdateShipperNote,
  useDeleteShipperNote,
} from "@/hooks/use-shipper-notes";
import type { ShipperNote } from "@/types/api.types";

/* ─── helpers ──────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function wasEdited(note: ShipperNote): boolean {
  return (
    note.updated_by !== null &&
    Math.abs(
      new Date(note.updated_at).getTime() - new Date(note.created_at).getTime(),
    ) > 2000
  );
}

/* ─── NoteCard ──────────────────────────────────────────────────────────────── */

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: ShipperNote;
  onEdit: (note: ShipperNote) => void;
  onDelete: (note: ShipperNote) => void;
}) {
  const edited = wasEdited(note);

  return (
    <div className="group relative rounded-xl border border-card-border bg-background px-5 py-4 transition-colors hover:border-primary/30">
      {/* Author + actions row */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {(note.profiles?.full_name ?? "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">
              {note.profiles?.full_name ?? "Administrator"}
            </span>
            <span className="mx-2 text-muted">·</span>
            <span className="text-xs text-muted">{formatDate(note.created_at)}</span>
            {edited && (
              <span className="ml-2 text-xs italic text-muted">
                (edited {formatDate(note.updated_at)})
              </span>
            )}
          </div>
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Edit note"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Delete note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Note content */}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {note.content}
      </p>
    </div>
  );
}

/* ─── EditNoteInline ────────────────────────────────────────────────────────── */

function EditNoteInline({
  note,
  shipperId,
  onDone,
}: {
  note: ShipperNote;
  shipperId: string;
  onDone: () => void;
}) {
  const [content, setContent] = useState(note.content);
  const [error, setError] = useState("");
  const updateMut = useUpdateShipperNote(shipperId);

  async function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) { setError("Note content is required"); return; }
    if (trimmed === note.content) { onDone(); return; }

    try {
      await updateMut.mutateAsync({ id: note.note_id, dto: { content: trimmed } });
      toast.success("Note updated");
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-background px-5 py-4 shadow-sm">
      <Textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(""); }}
        rows={4}
        className="resize-none rounded-lg border-card-border bg-card text-sm focus-visible:ring-primary/30"
        autoFocus
        maxLength={2000}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">{content.length}/2000</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDone}
            disabled={updateMut.isPending}
            className="h-8 rounded-lg border-card-border text-xs"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={updateMut.isPending}
            className="h-8 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85"
          >
            {updateMut.isPending ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="mr-1 h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── AddNoteForm ───────────────────────────────────────────────────────────── */

function AddNoteForm({
  shipperId,
  onDone,
}: {
  shipperId: string;
  onDone: () => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const createMut = useCreateShipperNote(shipperId);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) { setError("Note content is required"); return; }

    try {
      await createMut.mutateAsync({ content: trimmed });
      toast.success("Note added");
      setContent("");
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-background px-5 py-4 shadow-sm">
      <Textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); setError(""); }}
        placeholder="Add an internal note about this shipper…"
        rows={4}
        className="resize-none rounded-lg border-card-border bg-card text-sm focus-visible:ring-primary/30"
        autoFocus
        maxLength={2000}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">{content.length}/2000</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDone}
            disabled={createMut.isPending}
            className="h-8 rounded-lg border-card-border text-xs"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={createMut.isPending}
            className="h-8 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85"
          >
            {createMut.isPending ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlusCircle className="mr-1 h-3.5 w-3.5" />
            )}
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── DeleteNoteDialog ──────────────────────────────────────────────────────── */

function DeleteNoteDialog({
  note,
  shipperId,
  open,
  onClose,
}: {
  note: ShipperNote | null;
  shipperId: string;
  open: boolean;
  onClose: () => void;
}) {
  const deleteMut = useDeleteShipperNote(shipperId);

  async function handleConfirm() {
    if (!note) return;
    try {
      await deleteMut.mutateAsync(note.note_id);
      toast.success("Note deleted");
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="border-b border-card-border px-7 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Delete Note
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="px-7 py-6 space-y-5">
          {note && (
            <div className="rounded-[10px] border border-red-100 bg-red-50 px-4 py-3">
              <p className="line-clamp-3 text-sm text-red-700">{note.content}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleteMut.isPending}
              className="rounded-[10px] border-card-border text-foreground hover:bg-background"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={deleteMut.isPending}
              className="rounded-[10px] bg-red-600 px-5 text-white hover:bg-red-700"
            >
              {deleteMut.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── ShipperNotesSection (main export) ─────────────────────────────────────── */

export function ShipperNotesSection({ shipperId }: { shipperId: string }) {
  const [page] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<ShipperNote | null>(null);
  const [deletingNote, setDeletingNote] = useState<ShipperNote | null>(null);

  const { data, isLoading, isError } = useShipperNotes(shipperId, page);
  const notes = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  function handleEdit(note: ShipperNote) {
    setShowAddForm(false);
    setEditingNote(note);
  }

  function handleDelete(note: ShipperNote) {
    setDeletingNote(note);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Internal Notes</h3>
          {total > 0 && (
            <p className="mt-0.5 text-xs text-muted">
              {total} {total === 1 ? "note" : "notes"} — visible to admins only
            </p>
          )}
        </div>
        {!showAddForm && (
          <Button
            type="button"
            size="sm"
            onClick={() => { setShowAddForm(true); setEditingNote(null); }}
            className="h-8 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Add Note
          </Button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Add form */}
        {showAddForm && (
          <AddNoteForm
            shipperId={shipperId}
            onDone={() => setShowAddForm(false)}
          />
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-card-border p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex items-center justify-center rounded-xl border border-red-100 bg-red-50 py-8">
            <p className="text-sm text-red-600">Failed to load notes. Please refresh.</p>
          </div>
        )}

        {/* Notes list */}
        {!isLoading && !isError && notes.length > 0 && (
          <div className="space-y-3">
            {notes.map((note) =>
              editingNote?.note_id === note.note_id ? (
                <EditNoteInline
                  key={note.note_id}
                  note={note}
                  shipperId={shipperId}
                  onDone={() => setEditingNote(null)}
                />
              ) : (
                <NoteCard
                  key={note.note_id}
                  note={note}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ),
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && notes.length === 0 && !showAddForm && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20">
              <StickyNote className="h-6 w-6 text-muted" />
            </div>
            <p className="text-sm font-medium text-foreground">No notes yet</p>
            <p className="mt-1 text-xs text-muted">
              No notes have been added for this shipper.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-4 h-8 rounded-lg bg-primary px-4 text-xs text-sidebar hover:bg-primary/85"
            >
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Add First Note
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <DeleteNoteDialog
        note={deletingNote}
        shipperId={shipperId}
        open={deletingNote !== null}
        onClose={() => setDeletingNote(null)}
      />
    </div>
  );
}
