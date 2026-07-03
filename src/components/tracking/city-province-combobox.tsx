"use client";

import { useState, useRef } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Check, ChevronsUpDown, Plus, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useLocationSearch, useCreateLocation } from "@/hooks/use-locations";
import { CANADIAN_PROVINCES, type Location } from "@/types/api.types";
import { toast } from "sonner";

interface Props {
  value:     string | null;
  onChange:  (locationId: string | null, location: Location | null) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Text to show in the trigger when no location has been actively selected (e.g. pre-filled city+province on an edit form). */
  fallbackDisplay?: string;
}

export function CityProvinceCombobox({ value, onChange, disabled, placeholder = "Search city…", fallbackDisplay }: Props) {
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Location | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCity, setNewCity]       = useState("");
  const [newProvince, setNewProvince] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchRes, isLoading } = useLocationSearch(search);
  const createMut = useCreateLocation();

  const results: Location[] = (searchRes?.data as Location[] | undefined) ?? [];

  function handleOpenChange(next: boolean) {
    if (!next) setSearch("");
    setOpen(next);
  }

  function handleSelect(loc: Location) {
    setSelected(loc);
    onChange(loc.id, loc);
    setSearch("");
    setOpen(false);
  }

  function handleClear() {
    setSelected(null);
    onChange(null, null);
    setSearch("");
  }

  async function handleCreate() {
    if (!newCity.trim() || !newProvince) return;
    try {
      const res = await createMut.mutateAsync({ city: newCity.trim(), province: newProvince });
      const loc = res.data as Location;
      handleSelect(loc);
      setCreateOpen(false);
      setNewCity("");
      setNewProvince("");
      toast.success(`${loc.city}, ${loc.province} added`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const displayLabel = selected
    ? `${selected.city}, ${selected.province}`
    : value
    ? "Loading…"
    : fallbackDisplay ?? null;

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
                <MapPin className="h-3.5 w-3.5 text-primary" />
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
                placeholder="Type to search cities…"
                className="h-8 rounded-lg border-card-border text-sm"
              />
            </div>

            <div className="max-h-[min(14rem,var(--radix-popover-content-available-height,14rem))] overflow-y-auto">
              {isLoading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching…
                </div>
              )}

              {!isLoading && results.length === 0 && search.length >= 1 && (
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCity(search);
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

              {!isLoading && results.length === 0 && search.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted">Start typing to search cities…</p>
              )}

              {results.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-primary/5"
                >
                  <Check className={cn("h-4 w-4 shrink-0", selected?.id === loc.id ? "text-primary" : "opacity-0")} />
                  <span className="font-medium text-foreground">{loc.city}</span>
                  <span className="ml-auto text-xs text-muted">{loc.province}</span>
                </button>
              ))}

              {results.length > 0 && search.length >= 1 && (
                <div className="border-t border-card-border p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCity(search);
                      setOpen(false);
                      setSearch("");
                      setCreateOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create &ldquo;{search}&rdquo; if not listed
                  </button>
                </div>
              )}
            </div>

            {selected && (
              <div className="border-t border-card-border p-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:text-danger"
                >
                  Clear selection
                </button>
              </div>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-city">City Name</Label>
              <Input
                id="new-city"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="e.g. Milton Heights"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Province / Territory *</Label>
              <SearchableSelect
                value={newProvince}
                onValueChange={setNewProvince}
                options={CANADIAN_PROVINCES.map((p) => ({ value: p, label: p }))}
                placeholder="Select province…"
                searchPlaceholder="Search province…"
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
                disabled={!newCity.trim() || !newProvince || createMut.isPending}
                onClick={handleCreate}
              >
                {createMut.isPending ? "Saving…" : "Add City"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
