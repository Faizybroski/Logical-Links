"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateSupportCase } from "@/hooks/use-support";
import { ApiError } from "@/lib/api";

interface NewCaseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (caseId: string) => void;
}

const inputClass =
  "w-full rounded-xl border border-card-border bg-background py-2.5 px-4 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20";

export function NewCaseDialog({ open, onClose, onCreated }: NewCaseDialogProps) {
  const createMut = useCreateSupportCase();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  function reset() {
    setSubject("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await createMut.mutateAsync({ subject: subject.trim(), description: description.trim() });
      toast.success("Support request submitted");
      reset();
      onCreated(res.data.case_id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit support request");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg rounded-2xl border border-card-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">New Support Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Subject</label>
            <input
              type="text"
              required
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe your issue"
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              required
              maxLength={5000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give us as much detail as you can — what happened, which load/invoice it relates to, and what you need."
              className={`${inputClass} resize-none`}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMut.isPending}
              className="rounded-lg border-card-border text-foreground hover:bg-background"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending || !subject.trim() || !description.trim()}
              className="rounded-lg bg-primary text-sidebar hover:bg-primary/85"
            >
              {createMut.isPending ? "Submitting…" : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
