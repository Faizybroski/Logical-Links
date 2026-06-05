"use client";

import { useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Tag,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableSortHeader } from "@/components/ui/table-sort-header";
import { TableFilters } from "@/components/ui/table-filters";
import type { FilterDef } from "@/components/ui/table-filters";

import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from "@/hooks/use-locations";
import { CANADIAN_PROVINCES, type Location, type CreateLocationDto } from "@/types/api.types";
import { useStatuses, useCreateStatus, useUpdateStatus, useDeleteStatus } from "@/hooks/use-statuses";
import type { Status, CreateStatusDto } from "@/types/api.types";
import type { SortDir } from "@/hooks/use-table-filters";

/* ─── Location Dialogs ───────────────────────────────────────────────────── */

function LocationFormDialog({ open, onClose, location }: { open: boolean; onClose: () => void; location?: Location }) {
  const isEditing = !!location;
  const [city, setCity]         = useState(location?.city ?? "");
  const [province, setProvince] = useState(location?.province ?? "");
  const createMut = useCreateLocation();
  const updateMut = useUpdateLocation(location?.id ?? "");
  const isPending = createMut.isPending || updateMut.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateMut.mutateAsync({ city: city.trim(), province });
        toast.success("Location updated");
      } else {
        await createMut.mutateAsync({ city: city.trim(), province } as CreateLocationDto);
        toast.success("Location created");
      }
      onClose();
    } catch (err) { toast.error((err as Error).message); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isEditing ? "Edit Location" : "Create Location"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="city-name">City Name *</Label>
            <Input id="city-name" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Toronto" required className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label>Province / Territory *</Label>
            <SearchableSelect value={province} onValueChange={setProvince} options={CANADIAN_PROVINCES.map((p) => ({ value: p, label: p }))} placeholder="Select province…" searchPlaceholder="Search province…" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={isPending || !city.trim() || !province}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteLocationDialog({ open, onClose, location }: { open: boolean; onClose: () => void; location: Location | null }) {
  const deleteMut = useDeleteLocation();
  async function handleDelete() {
    if (!location) return;
    try { await deleteMut.mutateAsync(location.id); toast.success("Location deleted"); onClose(); }
    catch (err) { toast.error((err as Error).message); }
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete Location</DialogTitle></DialogHeader>
        <p className="text-sm text-muted">Delete <strong>{location?.city}, {location?.province}</strong>? This cannot be undone. Locations used by tracking events cannot be deleted.</p>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose}>Cancel</Button>
          <Button type="button" className="flex-1 rounded-lg bg-danger text-white hover:bg-danger/85" disabled={deleteMut.isPending} onClick={handleDelete}>
            {deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Status Dialogs ─────────────────────────────────────────────────────── */

function StatusFormDialog({ open, onClose, status }: { open: boolean; onClose: () => void; status?: Status }) {
  const isEditing = !!status;
  const [name, setName]               = useState(status?.name ?? "");
  const [description, setDescription] = useState(status?.description ?? "");
  const createMut = useCreateStatus();
  const updateMut = useUpdateStatus(status?.id ?? "");
  const isPending = createMut.isPending || updateMut.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateMut.mutateAsync({ name: name.trim(), description: description.trim() || null });
        toast.success("Status updated");
      } else {
        await createMut.mutateAsync({ name: name.trim(), description: description.trim() || undefined } as CreateStatusDto);
        toast.success("Status created");
      }
      onClose();
    } catch (err) { toast.error((err as Error).message); }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{isEditing ? "Edit Status" : "Create Custom Status"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="status-name">Status Name *</Label>
            <Input id="status-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weather Hold" required className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status-desc">Description</Label>
            <Input id="status-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional explanation" className="rounded-lg" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-lg bg-primary text-sidebar hover:bg-primary/85" disabled={isPending || !name.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteStatusDialog({ open, onClose, status }: { open: boolean; onClose: () => void; status: Status | null }) {
  const deleteMut = useDeleteStatus();
  async function handleDelete() {
    if (!status) return;
    try { await deleteMut.mutateAsync(status.id); toast.success("Status deleted"); onClose(); }
    catch (err) { toast.error((err as Error).message); }
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Delete Status</DialogTitle></DialogHeader>
        <p className="text-sm text-muted">Delete <strong>{status?.name}</strong>? This cannot be undone. Statuses in use by active loads cannot be deleted.</p>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose}>Cancel</Button>
          <Button type="button" className="flex-1 rounded-lg bg-danger text-white hover:bg-danger/85" disabled={deleteMut.isPending} onClick={handleDelete}>
            {deleteMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Locations Tab ──────────────────────────────────────────────────────── */

const LOC_PAGE_SIZE = 25;

const PROVINCE_OPTIONS = CANADIAN_PROVINCES.map((p) => ({ value: p, label: p }));
const LOC_FILTER_DEFS: FilterDef[] = [
  { type: "select", key: "province", label: "Province", options: PROVINCE_OPTIONS },
];

function LocationsTab() {
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [province, setProvince]         = useState("");
  const [sortBy, setSortBy]             = useState<string>("");
  const [sortDir, setSortDir]           = useState<SortDir>(null);
  const [createOpen, setCreateOpen]     = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [deleteLocation, setDeleteLocation] = useState<Location | null>(null);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setTimeout(() => setDebouncedSearch(v), 300);
    setPage(1);
  };

  function handleSort(key: string, dir: SortDir) {
    setSortBy(key && dir ? key : "");
    setSortDir(dir);
    setPage(1);
  }

  function sh(label: string, key: string) {
    return <TableSortHeader label={label} sortKey={key} currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />;
  }

  const activeCount = (province ? 1 : 0);
  const filterChips = province ? [{ key: "province", label: "Province", value: province, onRemove: () => { setProvince(""); setPage(1); } }] : [];

  const { data: res, isLoading } = useLocations({
    page,
    limit:    LOC_PAGE_SIZE,
    search:   debouncedSearch || undefined,
    province: province || undefined,
    sortBy:   (sortBy as any) || undefined,
    sortDir:  (sortDir as "asc" | "desc") || undefined,
  });

  const locations: Location[] = (res?.data as Location[] | undefined) ?? [];
  const total      = (res as any)?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / LOC_PAGE_SIZE);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Manage Canadian cities and provinces used in tracking events and load forms.</p>
        <Button type="button" onClick={() => setCreateOpen(true)} className="h-9 rounded-xl bg-primary px-4 text-sm text-sidebar hover:bg-primary/85">
          <Plus className="mr-1.5 h-4 w-4" />New Location
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search city or province…" className="rounded-xl pl-9" />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <TableFilters
          defs={LOC_FILTER_DEFS}
          getValue={(key) => key === "province" ? province : ""}
          onChange={(key, val) => { if (key === "province") { setProvince(val); setPage(1); } }}
          onClearAll={() => { setProvince(""); setPage(1); }}
          activeCount={activeCount}
          chips={filterChips}
        />
      </div>

      {filterChips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filterChips.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">
              <span className="font-normal text-muted-light">{chip.label}:</span>{chip.value}
              <button type="button" onClick={chip.onRemove} className="ml-0.5 rounded-full p-px hover:bg-primary/20">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-primary">
                <th className="px-6 py-3 text-left">{sh("City", "city")}</th>
                <th className="px-6 py-3 text-left">{sh("Province", "province")}</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-sidebar">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={3} className="px-6 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></td></tr>
              )}
              {!isLoading && locations.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-12 text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-light" />
                  <p className="text-sm text-muted">{debouncedSearch ? `No locations matching "${debouncedSearch}"` : "No locations yet."}</p>
                </td></tr>
              )}
              {locations.map((loc, idx) => (
                <tr key={loc.id} className={`border-b border-card-border transition-colors hover:bg-primary/3 ${idx === locations.length - 1 ? "border-b-0" : ""}`}>
                  <td className="px-6 py-3.5 font-medium text-foreground">{loc.city}</td>
                  <td className="px-6 py-3.5 text-muted">{loc.province}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => setEditLocation(loc)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border text-muted transition-colors hover:border-primary/30 hover:text-primary" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => setDeleteLocation(loc)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border text-muted transition-colors hover:border-danger/30 hover:text-danger" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-card-border px-6 py-3">
            <p className="text-xs text-muted">{total} location{total !== 1 ? "s" : ""} total</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="h-7 w-7 rounded-lg p-0" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <span className="text-xs text-muted">{page} / {totalPages}</span>
              <Button type="button" variant="outline" className="h-7 w-7 rounded-lg p-0" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        )}
      </div>

      {createOpen && <LocationFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />}
      {editLocation && <LocationFormDialog open={!!editLocation} onClose={() => setEditLocation(null)} location={editLocation} />}
      <DeleteLocationDialog open={!!deleteLocation} onClose={() => setDeleteLocation(null)} location={deleteLocation} />
    </>
  );
}

/* ─── Statuses Tab ───────────────────────────────────────────────────────── */

const ST_PAGE_SIZE = 50;

const STATUS_TYPE_OPTIONS = [{ value: "system", label: "System" }, { value: "custom", label: "Custom" }];
const STATUS_ACTIVE_OPTIONS = [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }];
const ST_FILTER_DEFS: FilterDef[] = [
  { type: "select", key: "type",     label: "Type",   options: STATUS_TYPE_OPTIONS },
  { type: "select", key: "isActive", label: "Active", options: STATUS_ACTIVE_OPTIONS },
];

function StatusesTab() {
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter]   = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [sortBy, setSortBy]           = useState<string>("");
  const [sortDir, setSortDir]         = useState<SortDir>(null);
  const [createOpen, setCreateOpen]   = useState(false);
  const [editStatus, setEditStatus]   = useState<Status | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<Status | null>(null);

  const updateMut = useUpdateStatus(editStatus?.id ?? "");

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setTimeout(() => setDebouncedSearch(v), 300);
    setPage(1);
  };

  function handleSort(key: string, dir: SortDir) {
    setSortBy(key && dir ? key : "");
    setSortDir(dir);
    setPage(1);
  }

  function sh(label: string, key: string) {
    return <TableSortHeader label={label} sortKey={key} currentSort={sortBy} currentDir={sortDir} onSort={handleSort} />;
  }

  const filterChips = [
    ...(typeFilter   ? [{ key: "type",     label: "Type",   value: typeFilter === "system" ? "System" : "Custom", onRemove: () => { setTypeFilter("");   setPage(1); } }] : []),
    ...(activeFilter ? [{ key: "isActive", label: "Active", value: activeFilter === "true" ? "Active" : "Inactive", onRemove: () => { setActiveFilter(""); setPage(1); } }] : []),
  ];

  const { data: res, isLoading } = useStatuses({
    page,
    limit:    ST_PAGE_SIZE,
    search:   debouncedSearch || undefined,
    type:     (typeFilter as any)   || undefined,
    isActive: (activeFilter as any) || undefined,
    sortBy:   (sortBy as any) || undefined,
    sortDir:  (sortDir as "asc" | "desc") || undefined,
  });

  const statuses: Status[] = (res?.data as Status[] | undefined) ?? [];
  const total      = (res as any)?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / ST_PAGE_SIZE);

  async function handleToggleActive(status: Status) {
    try {
      await updateMut.mutateAsync({ is_active: !status.is_active });
      toast.success(status.is_active ? "Status disabled" : "Status enabled");
    } catch (err) { toast.error((err as Error).message); }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Manage load statuses. System statuses are protected. Custom statuses are fully editable.</p>
        <Button type="button" onClick={() => setCreateOpen(true)} className="h-9 rounded-xl bg-primary px-4 text-sm text-sidebar hover:bg-primary/85">
          <Plus className="mr-1.5 h-4 w-4" />New Status
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search statuses…" className="rounded-xl pl-9" />
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <TableFilters
          defs={ST_FILTER_DEFS}
          getValue={(key) => key === "type" ? typeFilter : key === "isActive" ? activeFilter : ""}
          onChange={(key, val) => {
            if (key === "type")     { setTypeFilter(val);   setPage(1); }
            if (key === "isActive") { setActiveFilter(val); setPage(1); }
          }}
          onClearAll={() => { setTypeFilter(""); setActiveFilter(""); setPage(1); }}
          activeCount={filterChips.length}
          chips={filterChips}
        />
      </div>

      {filterChips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filterChips.map((chip) => (
            <span key={chip.key} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">
              <span className="font-normal text-muted-light">{chip.label}:</span>{chip.value}
              <button type="button" onClick={chip.onRemove} className="ml-0.5 rounded-full p-px hover:bg-primary/20">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-primary">
                <th className="px-6 py-3 text-left">{sh("Status", "name")}</th>
                <th className="px-6 py-3 text-left">{sh("Type", "type")}</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-sidebar">Description</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-sidebar">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></td></tr>
              )}
              {!isLoading && statuses.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center">
                  <Tag className="mx-auto mb-2 h-8 w-8 text-muted-light" />
                  <p className="text-sm text-muted">{debouncedSearch ? `No statuses matching "${debouncedSearch}"` : "No statuses yet."}</p>
                </td></tr>
              )}
              {statuses.map((s, idx) => (
                <tr key={s.id} className={`border-b border-card-border transition-colors hover:bg-primary/3 ${idx === statuses.length - 1 ? "border-b-0" : ""} ${!s.is_active ? "opacity-50" : ""}`}>
                  <td className="px-6 py-3.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-6 py-3.5">
                    {s.is_system ? (
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">System</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary">Custom</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-muted">{s.description ?? "—"}</td>
                  <td className="px-6 py-3.5 text-right">
                    {s.is_system ? (
                      <span className="text-xs text-muted">Protected</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => handleToggleActive(s)} className={`flex h-7 w-7 items-center justify-center rounded-lg border border-card-border transition-colors hover:border-primary/30 ${s.is_active ? "text-muted hover:text-primary" : "text-primary"}`} title={s.is_active ? "Disable" : "Enable"}>
                          {s.is_active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        </button>
                        <button type="button" onClick={() => setEditStatus(s)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border text-muted transition-colors hover:border-primary/30 hover:text-primary" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => setDeleteStatus(s)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border text-muted transition-colors hover:border-danger/30 hover:text-danger" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-card-border px-6 py-3">
            <p className="text-xs text-muted">{total} status{total !== 1 ? "es" : ""} total</p>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="h-7 w-7 rounded-lg p-0" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
              <span className="text-xs text-muted">{page} / {totalPages}</span>
              <Button type="button" variant="outline" className="h-7 w-7 rounded-lg p-0" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        )}
      </div>

      {createOpen && <StatusFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />}
      {editStatus && <StatusFormDialog open={!!editStatus} onClose={() => setEditStatus(null)} status={editStatus} />}
      <DeleteStatusDialog open={!!deleteStatus} onClose={() => setDeleteStatus(null)} status={deleteStatus} />
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

type Tab = "locations" | "statuses";

export default function AdminSystemDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>("locations");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Data</h1>
        <p className="mt-0.5 text-sm text-muted">Manage locations and statuses used across the platform.</p>
      </div>

      <div className="flex gap-1 rounded-xl border border-card-border bg-background/50 p-1 w-fit">
        <button type="button" onClick={() => setActiveTab("locations")} className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === "locations" ? "bg-card shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
          <MapPin className="h-4 w-4" />Locations
        </button>
        <button type="button" onClick={() => setActiveTab("statuses")} className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === "statuses" ? "bg-card shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}>
          <Tag className="h-4 w-4" />Statuses
        </button>
      </div>

      {activeTab === "locations" ? <LocationsTab /> : <StatusesTab />}
    </div>
  );
}
