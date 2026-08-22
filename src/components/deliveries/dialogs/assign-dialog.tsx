"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_ROLE_LABELS } from "@/types/api.types";
import type { Delivery, AdminEmployee, AssignEmployeesDto } from "@/types/api.types";

interface Props {
  delivery:  Delivery;
  employees: AdminEmployee[];
  open:      boolean;
  onClose:   () => void;
  onConfirm: (dto: AssignEmployeesDto) => void;
  loading?:  boolean;
}

export function AssignDialog({ delivery, employees, open, onClose, onConfirm, loading }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch]     = useState("");

  // Pre-tick whoever's already assigned, each time the dialog is opened.
  useEffect(() => {
    if (open) setSelected(new Set((delivery.assignments ?? []).map((a) => a.employee_id)));
  }, [open, delivery.assignments]);

  function handleClose() {
    setSearch("");
    onClose();
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm({ employeeIds: Array.from(selected) });
  }

  const eligible = employees.filter((e) => e.is_active);
  const filtered = search.trim()
    ? eligible.filter((e) => e.full_name?.toLowerCase().includes(search.toLowerCase()))
    : eligible;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[90vh] max-w-md flex-col overflow-hidden border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 sm:px-7">
          <DialogTitle className="text-lg font-semibold text-foreground">Assign Employees</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Delivery {delivery.load_number} — select everyone who should be on this delivery. You can pick more than one.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto space-y-4 px-5 py-6 sm:px-7">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees…"
              className="h-9 rounded-[10px] border-card-border bg-background pl-9 text-sm focus-visible:ring-primary/30"
            />
          </div>

          <div className="max-h-72 overflow-y-auto rounded-[10px] border border-card-border bg-background">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted">No active employees found</div>
            ) : (
              filtered.map((e) => {
                const isSelected = selected.has(e.id);
                return (
                  <label
                    key={e.id}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 border-b border-card-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-primary/5",
                      isSelected && "bg-primary/10",
                    )}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggle(e.id)} />
                    <UserAvatar name={e.full_name} avatarUrl={e.avatar_url ?? null} size="sm" rounded="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{e.full_name ?? "Unnamed"}</p>
                      {e.admin_role && (
                        <p className="text-xs text-muted">{ADMIN_ROLE_LABELS[e.admin_role] ?? e.admin_role}</p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-3 border-t border-card-border px-5 py-4 sm:px-7">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="rounded-[10px] border-card-border">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-[10px] bg-primary px-6 text-sidebar hover:bg-primary/85"
          >
            {loading ? "Assigning…" : "Save Assignment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
