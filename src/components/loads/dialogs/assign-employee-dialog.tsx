"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Search, CheckCircle2, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shipment, AssignEmployeeDto, CompanyUser } from "@/types/api.types";

const UNASSIGN_VALUE = "__unassign__";

interface Props {
  shipment:   Shipment;
  employees:  CompanyUser[];
  open:       boolean;
  onClose:    () => void;
  onConfirm:  (dto: AssignEmployeeDto) => void;
  loading?:   boolean;
}

export function AssignEmployeeDialog({ shipment, employees, open, onClose, onConfirm, loading }: Props) {
  const currentEmployeeId = shipment.assigned_employee_id ?? "";
  const [employeeId, setEmployeeId] = useState<string>(currentEmployeeId);
  const [search, setSearch]         = useState("");
  const [error, setError]           = useState("");

  function handleClose() {
    setEmployeeId(currentEmployeeId);
    setSearch("");
    setError("");
    onClose();
  }

  function handleConfirm() {
    if (employeeId === UNASSIGN_VALUE) {
      onConfirm({ employeeId: null });
    } else if (employeeId) {
      onConfirm({ employeeId });
    } else {
      setError("Please select an employee or choose to unassign");
    }
  }

  const activeEmployees = employees.filter((e) => e.is_active);
  const filtered = search.trim()
    ? activeEmployees.filter(
        (e) =>
          (e.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase()),
      )
    : activeEmployees;

  const currentEmployee = activeEmployees.find((e) => e.id === currentEmployeeId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[90vh] max-w-md flex-col overflow-hidden border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 sm:px-7">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Assign Employee
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Load {shipment.load_number} — assign to an employee or leave unassigned.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto space-y-3 px-5 py-6 sm:px-7">
          {/* Current assignment */}
          {currentEmployee && (
            <div className="flex items-center gap-2 rounded-[10px] border border-card-border bg-background px-4 py-2.5">
              <UserAvatar
                name={currentEmployee.full_name}
                avatarUrl={currentEmployee.avatar_url}
                size="xs"
                rounded="full"
              />
              <div>
                <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Currently assigned</p>
                <p className="text-sm font-medium text-foreground">{currentEmployee.full_name ?? currentEmployee.email}</p>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees…"
              className="h-9 rounded-[10px] border-card-border bg-background pl-9 text-sm focus-visible:ring-primary/30"
            />
          </div>

          {/* Employee list */}
          <div className="max-h-56 overflow-y-auto rounded-[10px] border border-card-border bg-background">
            {/* Unassign option */}
            <button
              type="button"
              onClick={() => { setEmployeeId(UNASSIGN_VALUE); setError(""); }}
              className={cn(
                "flex w-full items-center gap-3 border-b border-card-border px-4 py-3 text-left transition-colors hover:bg-primary/5",
                employeeId === UNASSIGN_VALUE && "bg-primary/10",
              )}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-card-border bg-background text-muted">
                <UserMinus className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm italic text-muted">Unassigned</span>
              {employeeId === UNASSIGN_VALUE && (
                <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary" />
              )}
            </button>

            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted">No active employees found</div>
            ) : (
              filtered.map((e) => {
                const selected = employeeId === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => { setEmployeeId(e.id); setError(""); }}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-card-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-primary/5",
                      selected && "bg-primary/10",
                    )}
                  >
                    <UserAvatar
                      name={e.full_name}
                      avatarUrl={e.avatar_url}
                      size="sm"
                      rounded="full"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {e.full_name ?? e.email}
                      </p>
                      {e.full_name && (
                        <p className="text-xs text-muted truncate">{e.email}</p>
                      )}
                    </div>
                    {selected && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 border-t border-card-border px-5 py-4 sm:px-7">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="rounded-[10px] border-card-border"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-[10px] bg-primary px-6 text-sidebar hover:bg-primary/85"
          >
            {loading ? "Saving…" : "Save Assignment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
