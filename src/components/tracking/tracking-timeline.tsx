"use client";

import { useState } from "react";
import { MapPin, Clock, Pencil, Trash2, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toast } from "sonner";
import { TrackingStatusBadge } from "./tracking-status-badge";
import { TrackingEventForm } from "./tracking-event-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteTrackingEvent } from "@/hooks/use-tracking";
import { formatDate } from "@/lib/utils/format-date";
import type { TrackingEvent } from "@/types/api.types";

interface Props {
  loadId:      string;
  events:      TrackingEvent[];
  canCreate:   boolean;
  canEdit:     (event: TrackingEvent) => boolean;
  canDelete:   (event: TrackingEvent) => boolean;
  onRefresh?:  () => void;
}

function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open:      boolean;
  onClose:   () => void;
  onConfirm: () => void;
  loading:   boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Tracking Event</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted">
          Are you sure you want to delete this tracking event? This action cannot be undone.
        </p>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-lg bg-danger text-white hover:bg-danger/85"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TrackingTimeline({ loadId, events, canCreate, canEdit, canDelete, onRefresh }: Props) {
  const [addOpen, setAddOpen]         = useState(false);
  const [editEvent, setEditEvent]     = useState<TrackingEvent | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<TrackingEvent | null>(null);

  const deleteMut = useDeleteTrackingEvent();

  async function handleDelete() {
    if (!deleteEvent) return;
    try {
      await deleteMut.mutateAsync(deleteEvent.id);
      toast.success("Tracking event deleted");
      setDeleteEvent(null);
      onRefresh?.();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Tracking History</h2>
        {canCreate && (
          <Button
            type="button"
            onClick={() => setAddOpen(true)}
            className="h-8 rounded-lg bg-primary px-3 text-xs text-sidebar hover:bg-primary/85"
          >
            + Add Update
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="px-6 py-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <MapPin className="h-8 w-8 text-muted-light" />
            <p className="text-sm font-medium text-muted">No tracking events yet</p>
            {canCreate && (
              <p className="text-xs text-muted-light">
                Add the first update using the button above.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {events.map((event, idx) => {
              const isLast = idx === events.length - 1;
              return (
                <div key={event.id} className="flex gap-4">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-primary bg-primary/20" />
                    {!isLast && <div className="mt-1 w-px flex-1 bg-card-border" />}
                  </div>

                  {/* Content */}
                  <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <TrackingStatusBadge status={event.tracking_status} />
                        {event.locations && (
                          <span className="flex items-center gap-1 text-xs text-muted">
                            <MapPin className="h-3 w-3" />
                            {event.locations.city}, {event.locations.province}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {canEdit(event) && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setEditEvent(event)}
                            className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canDelete(event) && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setDeleteEvent(event)}
                            className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {event.notes && (
                      <p className="mt-1.5 text-sm text-foreground">{event.notes}</p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(event.event_timestamp)}
                      </span>
                      {event.profiles?.full_name && (
                        <span className="flex items-center gap-1.5">
                          <UserAvatar
                            name={event.profiles.full_name}
                            avatarUrl={event.profiles.avatar_url}
                            size="xs"
                            rounded="full"
                          />
                          {event.profiles.full_name}
                          <span className="capitalize text-muted-light">
                            ({event.created_by_role.replace("_", " ")})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add event dialog */}
      {addOpen && (
        <TrackingEventForm
          loadId={loadId}
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={() => { setAddOpen(false); onRefresh?.(); }}
        />
      )}

      {/* Edit event dialog */}
      {editEvent && (
        <TrackingEventForm
          loadId={loadId}
          event={editEvent}
          open={!!editEvent}
          onClose={() => setEditEvent(null)}
          onSuccess={() => { setEditEvent(null); onRefresh?.(); }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDeleteDialog
        open={!!deleteEvent}
        onClose={() => setDeleteEvent(null)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
