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
import { CompanyLogo } from "@/components/ui/company-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Search, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shipment, Account, AccountProfile, AssignShipmentDto } from "@/types/api.types";

interface Props {
  shipment:  Shipment;
  companies: Account[];
  open:      boolean;
  onClose:   () => void;
  onConfirm: (dto: AssignShipmentDto) => void;
  loading?:  boolean;
}

function getAdmin(profiles?: AccountProfile[]): AccountProfile | undefined {
  return profiles?.find((p) => p.company_role === "company_admin");
}

export function AssignDialog({ shipment, companies, open, onClose, onConfirm, loading }: Props) {
  const [accountId, setAccountId] = useState<string>("");
  const [search, setSearch]       = useState("");
  const [error, setError]         = useState("");

  function handleClose() {
    setAccountId("");
    setSearch("");
    setError("");
    onClose();
  }

  function handleConfirm() {
    if (!accountId) {
      setError("Please select a shipping company");
      return;
    }
    onConfirm({ accountId });
  }

  const eligibleCompanies = companies.filter((c) => c.is_active);
  const filtered = search.trim()
    ? eligibleCompanies.filter((c) =>
        c.account_name.toLowerCase().includes(search.toLowerCase()) ||
        getAdmin(c.profiles)?.full_name?.toLowerCase().includes(search.toLowerCase()),
      )
    : eligibleCompanies;

  const isShipperOwned = shipment.created_by_role === "shipper";
  const isLocked       = isShipperOwned || shipment.status !== "pending";
  const currentCompany = shipment.account_id
    ? companies.find((c) => c.account_id === shipment.account_id)
    : null;
  const isReassign = !!shipment.account_id && !isShipperOwned;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[90vh] max-w-md flex-col overflow-hidden border border-card-border bg-card p-0 shadow-2xl"
        style={{ borderRadius: "var(--radius-md, 16px)" }}
      >
        <DialogHeader className="shrink-0 border-b border-card-border px-5 py-5 sm:px-7">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {isReassign ? "Reassign Shipping Company" : "Assign to Shipping Company"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted">
            Load {shipment.load_number} — select the shipping company to assign this load to.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto space-y-4 px-5 py-6 sm:px-7">
          {isShipperOwned ? (
            <LockedCompanyCard
              company={currentCompany}
              message="This load was created by the shipping company and cannot be reassigned."
              variant="violet"
            />
          ) : isLocked ? (
            <LockedCompanyCard
              company={currentCompany}
              message={`This load cannot be reassigned because operational processing has already started (status: ${shipment.status.replace(/_/g, " ")}).`}
              variant="red"
            />
          ) : (
            <div className="space-y-3">
              {isReassign && currentCompany && (
                <div className="flex items-center gap-2 rounded-[10px] border border-card-border bg-background px-4 py-2.5">
                  <CompanyLogo
                    name={currentCompany.account_name}
                    logoUrl={currentCompany.logo_url}
                    size="xs"
                    rounded="lg"
                  />
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Currently assigned</p>
                    <p className="text-sm font-medium text-foreground">{currentCompany.account_name}</p>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search companies…"
                  className="h-9 rounded-[10px] border-card-border bg-background pl-9 text-sm focus-visible:ring-primary/30"
                />
              </div>

              {/* Company list */}
              <div className="max-h-56 overflow-y-auto rounded-[10px] border border-card-border bg-background">
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted">
                    No active companies found
                  </div>
                ) : (
                  filtered.map((c) => {
                    const admin    = getAdmin(c.profiles);
                    const selected = accountId === c.account_id;
                    return (
                      <button
                        key={c.account_id}
                        type="button"
                        onClick={() => { setAccountId(c.account_id); setError(""); }}
                        className={cn(
                          "flex w-full items-center gap-3 border-b border-card-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-primary/5",
                          selected && "bg-primary/10",
                        )}
                      >
                        <CompanyLogo
                          name={c.account_name}
                          logoUrl={c.logo_url}
                          size="sm"
                          rounded="lg"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{c.account_name}</p>
                          {admin && (
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <UserAvatar
                                name={admin.full_name}
                                avatarUrl={admin.avatar_url ?? null}
                                size="xs"
                                rounded="full"
                              />
                              <span className="text-xs text-muted truncate">{admin.full_name ?? "Company Admin"}</span>
                            </div>
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
          )}
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
            disabled={loading || isLocked}
            className="rounded-[10px] bg-primary px-6 text-sidebar hover:bg-primary/85"
          >
            {loading ? "Assigning…" : isReassign ? "Reassign Company" : "Assign Company"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LockedCompanyCard({
  company,
  message,
  variant,
}: {
  company: Account | null | undefined;
  message: string;
  variant: "violet" | "red";
}) {
  const colors = variant === "violet"
    ? "border-violet-200 bg-violet-50/60 text-violet-700"
    : "border-red-200 bg-red-50/60 text-red-700";

  return (
    <div className={cn("rounded-[10px] border px-4 py-3", colors)}>
      {company && (
        <div className="mb-2 flex items-center gap-2">
          <CompanyLogo
            name={company.account_name}
            logoUrl={company.logo_url}
            size="sm"
            rounded="lg"
          />
          <p className="text-sm font-medium text-foreground">{company.account_name}</p>
        </div>
      )}
      {!company && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
          {variant === "violet" ? "Assigned Company" : "Transfer Locked"}
        </p>
      )}
      <p className="text-xs">{message}</p>
    </div>
  );
}
