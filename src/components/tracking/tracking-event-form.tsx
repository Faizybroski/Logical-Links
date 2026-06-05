"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CityProvinceCombobox } from "./city-province-combobox";
import { useCreateTrackingEvent, useUpdateTrackingEvent } from "@/hooks/use-tracking";
import {
  TRACKING_STATUS_LABELS,
  type TrackingStatus,
  type TrackingEvent,
  type Location,
} from "@/types/api.types";

const STATUS_OPTIONS = (Object.entries(TRACKING_STATUS_LABELS) as [TrackingStatus, string][]).map(
  ([value, label]) => ({ value, label }),
);

interface Props {
  loadId:    string;
  event?:    TrackingEvent;
  open:      boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

export function TrackingEventForm({ loadId, event, open, onClose, onSuccess }: Props) {
  const isEditing = !!event;

  const [status, setStatus]           = useState<TrackingStatus>(event?.tracking_status ?? "in_transit");
  const [locationId, setLocationId]   = useState<string | null>(event?.location_id ?? null);
  const [notes, setNotes]             = useState(event?.notes ?? "");
  const [timestamp, setTimestamp]     = useState(() => {
    if (event?.event_timestamp) {
      return new Date(event.event_timestamp).toISOString().slice(0, 16);
    }
    return new Date().toISOString().slice(0, 16);
  });

  const createMut = useCreateTrackingEvent();
  const updateMut = useUpdateTrackingEvent(event?.id ?? "");
  const isPending = createMut.isPending || updateMut.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateMut.mutateAsync({
          trackingStatus: status,
          locationId:     locationId ?? null,
          notes:          notes.trim() || null,
          eventTimestamp: new Date(timestamp).toISOString(),
        });
        toast.success("Tracking event updated");
      } else {
        await createMut.mutateAsync({
          loadId,
          trackingStatus: status,
          locationId:     locationId ?? undefined,
          notes:          notes.trim() || undefined,
          eventTimestamp: new Date(timestamp).toISOString(),
        });
        toast.success("Tracking event added");
      }
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-md flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 sm:px-6">
          <DialogTitle>{isEditing ? "Edit Tracking Event" : "Add Tracking Update"}</DialogTitle>
        </DialogHeader>

        <form id="tracking-event-form" onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto space-y-4 px-5 py-5 sm:px-6">
          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status *</Label>
            <SearchableSelect
              value={status}
              onValueChange={(v) => setStatus(v as TrackingStatus)}
              options={STATUS_OPTIONS}
              searchPlaceholder="Search status…"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label>Location</Label>
            <CityProvinceCombobox
              value={locationId}
              onChange={(id, _loc) => setLocationId(id)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="tracking-notes">Notes</Label>
            <Textarea
              id="tracking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shipment departed sorting facility"
              rows={3}
              className="resize-none rounded-lg text-sm"
              maxLength={1000}
            />
          </div>

          {/* Timestamp */}
          <div className="space-y-1.5">
            <Label htmlFor="event-timestamp">Event Timestamp</Label>
            <Input
              id="event-timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="rounded-lg"
            />
          </div>
        </form>

        {/* Sticky footer */}
        <div className="shrink-0 flex gap-2 border-t border-card-border px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            form="tracking-event-form"
            type="submit"
            className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Update"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
