"use client";

import { useState, useRef } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Check, ChevronsUpDown, Plus, Tag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAllStatuses, useStatusSearch, useCreateStatus } from "@/hooks/use-statuses";
import type { Status } from "@/types/api.types";
import { toast } from "sonner";

interface StatusRowProps {
  s:          Status;
  isSelected: boolean;
  onSelect:   (s: Status) => void;
}

function StatusRow({ s, isSelected, onSelect }: StatusRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(s)}
      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-primary/5"
    >
      <Check className={cn("h-4 w-4 shrink-0", isSelected ? "text-primary" : "opacity-0")} />
      <span className="font-medium text-foreground">{s.name}</span>
      {!s.is_system && (
        <span className="ml-auto rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary">
          Custom
        </span>
      )}
    </button>
  );
}

interface Props {
  value?:        string | null;
  onChange:      (slug: string, status: Status) => void;
  disabled?:     boolean;
  placeholder?:  string;
  allowedSlugs?: string[];
}

export function StatusCombobox({
  value,
  onChange,
  disabled,
  placeholder = "Select status…",
  allowedSlugs,
}: Props) {
  const [open, setOpen]             = useState(false);
  const [search, setSearch]         = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName]       = useState("");
  const [newDescription, setNewDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allRes,    isLoading: allLoading }    = useAllStatuses();
  const { data: searchRes, isLoading: searchLoading } = useStatusSearch(search);
  const createMut = useCreateStatus();

  const allStatuses: Status[]    = (allRes?.data    as Status[] | undefined) ?? [];
  const searchResults: Status[]  = (searchRes?.data as Status[] | undefined) ?? [];

  const displayed = search.length >= 1 ? searchResults : allStatuses;
  const isLoading = search.length >= 1 ? searchLoading : allLoading;

  const filtered = allowedSlugs
    ? displayed.filter((s) => allowedSlugs.includes(s.slug))
    : displayed;

  const systemStatuses = filtered.filter((s) => s.is_system);
  const customStatuses = filtered.filter((s) => !s.is_system);

  const selectedStatus = allStatuses.find((s) => s.slug === value);
  const displayLabel   = selectedStatus?.name ?? value ?? null;

  function handleOpenChange(next: boolean) {
    if (!next) setSearch("");
    setOpen(next);
  }

  function handleSelect(status: Status) {
    onChange(status.slug, status);
    setSearch("");
    setOpen(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      const res    = await createMut.mutateAsync({ name: newName.trim(), description: newDescription.trim() || undefined });
      const status = res.data as Status;
      handleSelect(status);
      setCreateOpen(false);
      setNewName("");
      setNewDescription("");
      toast.success(`"${status.name}" status created`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const showCreateOption =
    search.length >= 1 &&
    !isLoading &&
    !filtered.some((s) => s.name.toLowerCase() === search.toLowerCase());

  return (
    <>
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            className="w-full justify-between rounded-lg border-card-border bg-background text-sm font-normal text-foreground hover:bg-primary/5"
          >
            {displayLabel ? (
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                {displayLabel}
              </span>
            ) : (
              <span className="text-muted">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            avoidCollisions
            collisionPadding={12}
            style={{ width: "var(--radix-popover-trigger-width)" }}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              inputRef.current?.focus();
            }}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="z-[200] overflow-hidden rounded-xl border border-card-border bg-card shadow-lg"
          >
            <div className="border-b border-card-border p-2">
              <Input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search statuses…"
                className="h-8 rounded-lg border-card-border text-sm"
              />
            </div>

            <div className="max-h-[min(18rem,var(--radix-popover-content-available-height,18rem))] overflow-y-auto">
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading…
                </div>
              )}

              {!isLoading && filtered.length === 0 && search.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted">No statuses available.</p>
              )}

              {!isLoading && systemStatuses.length > 0 && (
                <>
                  {search.length === 0 && (
                    <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      System
                    </p>
                  )}
                  {systemStatuses.map((s) => (
                    <StatusRow key={s.id} s={s} isSelected={s.slug === value} onSelect={handleSelect} />
                  ))}
                </>
              )}

              {!isLoading && customStatuses.length > 0 && (
                <>
                  {search.length === 0 && (
                    <p className="px-4 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted border-t border-card-border mt-1">
                      Custom
                    </p>
                  )}
                  {customStatuses.map((s) => (
                    <StatusRow key={s.id} s={s} isSelected={s.slug === value} onSelect={handleSelect} />
                  ))}
                </>
              )}

              {showCreateOption && (
                <div className="border-t border-card-border p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewName(search);
                      setOpen(false);
                      setSearch("");
                      setCreateOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4" />
                    Create &ldquo;{search}&rdquo;
                  </button>
                </div>
              )}

              {!isLoading && search.length === 0 && (
                <div className="border-t border-card-border p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setCreateOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create custom status…
                  </button>
                </div>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Custom Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-status-name">Status Name *</Label>
              <Input
                id="new-status-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Weather Hold"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-status-desc">Description (optional)</Label>
              <Input
                id="new-status-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Brief explanation of this status"
                className="rounded-lg"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85"
                disabled={!newName.trim() || createMut.isPending}
                onClick={handleCreate}
              >
                {createMut.isPending ? "Saving…" : "Create Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
