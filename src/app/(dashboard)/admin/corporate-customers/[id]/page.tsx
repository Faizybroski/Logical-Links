"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Phone, Calendar, XCircle, RotateCcw, PauseCircle, PowerOff,
  ChevronRight, Building2, UserCircle2, Globe, Hash, MapPin, Trash2,
  Briefcase, Factory, Package, Truck, FileText, DollarSign, Award, Users, Pencil,
  CalendarClock, UserCog, PhoneCall,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { KpiCard } from "@/components/deliveries/kpi-card";
import { TierDetailsSheet } from "@/components/deliveries/sheets/tier-details-sheet";
import { getTierProgress } from "@/lib/tiers";
import {
  useAccount, useAccountStats, useAccountActivity,
  useUpdateAccount, useDeleteAccount, useSetAccountPipelineStatus,
  useReconsiderAccount, usePurgeAccount,
} from "@/hooks/use-accounts";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useApproveUser } from "@/hooks/use-users";
import { useAdminEmployees } from "@/hooks/use-admin-employees";
import { useTiers } from "@/hooks/use-tiers";
import { usePermission } from "@/hooks/use-permission";
import { CorporateNotesSection } from "@/components/admin/CorporateNotesSection";
import { ActivityFeed } from "@/components/accounts/activity-feed";
import { PipelineStatusBadge } from "@/components/accounts/pipeline-status-badge";
import { PipelineStatusSelect } from "@/components/accounts/pipeline-status-select";
import { RejectAccountDialog } from "@/components/accounts/reject-account-dialog";
import { CompanyLogo } from "@/components/ui/company-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  CORPORATE_PIPELINE_STATUS_META,
  CORPORATE_PORTAL_ACCESS_STATUSES,
  accountDisplayStatus,
  type Account, type AccountProfile, type CorporatePipelineStatus,
} from "@/types/api.types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function fmtDate(d: string | null, long = false) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric", month: long ? "long" : "short", day: "numeric",
  });
}

function money(n: number) {
  return n.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function getAdmin(profiles?: AccountProfile[]): AccountProfile | undefined {
  return profiles?.find((p) => p.company_role === "company_admin");
}

function formatAddress(a: Account): string | null {
  const parts = [a.address_line1, a.address_city, a.address_state, a.address_postcode, a.address_country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function Card({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-card-border px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-card-border bg-background px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function AdminCorporateCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: res, isLoading } = useAccount(id);
  const account = res?.data;
  const canEdit = usePermission("customers.edit");
  const canDelete = usePermission("customers.delete");

  const admin = getAdmin(account?.profiles);
  const status = (account?.pipeline_status ?? "prospect") as CorporatePipelineStatus;
  const isRejected = !!account?.rejected_at;
  const isActive = status === "active" && !isRejected;
  const hasPortalAccess = CORPORATE_PORTAL_ACCESS_STATUSES.includes(status) && !isRejected;
  const displayStatus = account ? accountDisplayStatus(account) : status;

  const { data: statsRes } = useAccountStats(isActive ? id : "");
  const { data: activityRes, isLoading: activityLoading } = useAccountActivity(id);
  const { data: tiersRes } = useTiers();

  const activity = activityRes?.data ?? [];
  const stats = statsRes?.data;
  const tiers = tiersRes?.data ?? [];

  const lastStatusChange = useMemo(
    () => activity.find((a) => a.event_type === "status_changed" || a.event_type === "admin_added") ?? null,
    [activity],
  );

  const [tierSheetOpen, setTierSheetOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  const statusMut = useSetAccountPipelineStatus(id);
  const deleteMut = useDeleteAccount();
  const reconsiderMut = useReconsiderAccount(id);
  const purgeMut = usePurgeAccount(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20">
          <Building2 className="h-8 w-8 text-muted" />
        </div>
        <p className="text-base font-semibold text-foreground">Corporate customer not found</p>
        <Link href="/admin/corporate-customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Corporate Customers
        </Link>
      </div>
    );
  }

  const handleSetStatus = async (next: CorporatePipelineStatus) => {
    if (next === status) return;
    try {
      await statusMut.mutateAsync(next);
      toast.success(`Stage: ${CORPORATE_PIPELINE_STATUS_META[next].label}`);
    } catch (err) { toast.error((err as Error).message); }
  };

  const handleSuspend = async () => {
    try {
      await statusMut.mutateAsync("inactive");
      toast.success(`${account.account_name} suspended`);
      setSuspendOpen(false);
    } catch (err) { toast.error((err as Error).message); }
  };

  const handleDeactivate = async () => {
    try {
      await statusMut.mutateAsync("lost");
      toast.success(`${account.account_name} deactivated`);
      setDeactivateOpen(false);
    } catch (err) { toast.error((err as Error).message); }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Corporate customer removed");
      window.location.href = "/admin/corporate-customers";
    } catch (err) { toast.error((err as Error).message); }
  };

  const handleReconsider = async () => {
    try {
      await reconsiderMut.mutateAsync();
      toast.success("Application reopened for review");
    } catch (err) { toast.error((err as Error).message); }
  };

  const handlePurge = async () => {
    try {
      await purgeMut.mutateAsync();
      toast.success("Account permanently deleted");
      window.location.href = "/admin/corporate-customers";
    } catch (err) { toast.error((err as Error).message); }
  };

  const displayId = isActive ? account.customer_id : account.request_id;
  const tierProgress = tiers.length > 0 ? getTierProgress(stats?.deliveredShipments ?? 0, tiers) : null;

  return (
    <div className="w-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl py-4">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/admin/corporate-customers" className="hover:text-foreground">Corporate Customers</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{account.account_name}</span>
          </nav>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/corporate-customers" className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted hover:bg-primary/5 hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">{account.account_name}</h1>
                <p className="text-xs text-muted">{isRejected ? "Corporate Application" : "Corporate Customer"} · {displayId}</p>
              </div>
            </div>
            <PipelineStatusBadge status={displayStatus} />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-6 py-6">
        {/* Identity card */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
          <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
            <CompanyLogo name={account.account_name} logoUrl={account.logo_url} size="xl" rounded="2xl" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{account.account_name}</h2>
              <p className="mt-0.5 text-sm text-muted">Customer ID: {displayId}</p>
              <p className="mt-0.5 text-sm text-muted">Added {fmtDate(account.created_at, true)}</p>
              {isActive && tierProgress && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-info/25 bg-info/10 px-3 py-1 text-xs font-semibold text-blue-700">
                  <Award className="h-3 w-3" /> {tierProgress.current.name}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              {isRejected ? (
                <>
                  {canEdit && (
                    <Button onClick={handleReconsider} disabled={reconsiderMut.isPending}
                      className="rounded-lg bg-primary px-5 text-sm text-sidebar hover:bg-primary/85">
                      <RotateCcw className="mr-1.5 h-4 w-4" /> Reconsider
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="outline" onClick={() => setPurgeOpen(true)} disabled={purgeMut.isPending}
                      className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Purge now
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {canEdit ? (
                    <PipelineStatusSelect value={status} onChange={handleSetStatus} loading={statusMut.isPending} />
                  ) : (
                    <PipelineStatusBadge status={status} />
                  )}
                  {canEdit && (
                    <Button variant="outline" onClick={() => setAccessOpen(true)} className="rounded-lg px-5 text-sm">
                      <Users className="mr-1.5 h-4 w-4" /> Manage Access
                    </Button>
                  )}
                  {/* Application phase (no portal access yet) → Reject.
                      Portal phase (onboarding/active) → Suspend (pause) + Deactivate (they're gone). */}
                  {canEdit && !hasPortalAccess && (
                    <Button variant="outline" onClick={() => setRejectOpen(true)}
                      className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50">
                      <XCircle className="mr-1.5 h-4 w-4" /> Reject application
                    </Button>
                  )}
                  {canEdit && hasPortalAccess && (
                    <Button variant="outline" onClick={() => setSuspendOpen(true)} disabled={statusMut.isPending}
                      className="rounded-lg border-amber-200 px-5 text-sm text-amber-700 hover:bg-amber-50">
                      <PauseCircle className="mr-1.5 h-4 w-4" /> Suspend
                    </Button>
                  )}
                  {canEdit && status !== "lost" && (
                    <Button variant="outline" onClick={() => setDeactivateOpen(true)} disabled={statusMut.isPending}
                      className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50">
                      <PowerOff className="mr-1.5 h-4 w-4" /> Deactivate account
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="outline" onClick={() => setDeleteOpen(true)} disabled={deleteMut.isPending}
                      className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rejected: retention banner + decision */}
        {isRejected ? (
          <Card title="Application Rejected">
            <div className="space-y-3 text-sm">
              <p className="text-red-700">
                Portal access is revoked. Data is retained until{" "}
                <strong>{fmtDate(account.purge_after, true)}</strong>, then permanently deleted.
                Use <em>Reconsider</em> before then to restore it.
              </p>
              {account.rejection_reason && (
                <p><span className="text-muted">Reason:</span> <span className="text-foreground">{account.rejection_reason}</span></p>
              )}
              {account.review_note && (
                <p><span className="text-muted">Internal note:</span> <span className="text-foreground">{account.review_note}</span></p>
              )}
              <p className="text-xs text-muted">Rejected {fmtDate(account.rejected_at, true)}</p>
            </div>
          </Card>
        ) : (
          <Card title="Pipeline">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <PipelineStatusBadge status={status} />
                <span className="text-muted">{CORPORATE_PIPELINE_STATUS_META[status].description}</span>
              </div>
              <p className="text-xs text-muted">
                Portal access is {hasPortalAccess ? (
                  <span className="font-medium text-green-700">granted</span>
                ) : (
                  <span className="font-medium text-red-700">not granted</span>
                )} at this stage
                {admin ? "" : " — no login is attached to this company yet"}.
              </p>
              {lastStatusChange && (
                <p className="text-xs text-muted">
                  Last change: {lastStatusChange.description}
                  {lastStatusChange.actor_label ? ` · ${lastStatusChange.actor_label}` : ""}
                  {" · "}{fmtDate(lastStatusChange.created_at, true)}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Follow-up tracking (internal, admin-only) */}
        {!isRejected && <FollowUpCard account={account} canEdit={canEdit} />}

        {/* Active: stats + tier */}
        {isActive && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KpiCard title="Total Shipments" value={stats?.totalShipments ?? 0} icon={Package} chartColor="#C89B3C" isLoading={!stats} subtitle="" />
              <KpiCard title="Active Shipments" value={stats?.activeShipments ?? 0} icon={Truck} chartColor="#3B82F6" isLoading={!stats} subtitle="" />
              <KpiCard title="Open Quotes" value={stats?.openQuotes ?? 0} icon={FileText} chartColor="#8B5CF6" isLoading={!stats} subtitle="" />
              <KpiCard title="Total Spend" value={stats ? money(stats.totalSpend) : "—"} icon={DollarSign} chartColor="#22C55E" valueColor="#7B1E3A" isLoading={!stats} subtitle="" />
            </div>

            {tierProgress && (
              <Card title="Partner Tier" action={
                <Button variant="outline" size="sm" onClick={() => setTierSheetOpen(true)}>View Tier Details</Button>
              }>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <p className="text-lg font-semibold text-foreground">{tierProgress.current.name}</p>
                    <p className="text-sm text-muted">
                      {(stats?.deliveredShipments ?? 0)}{tierProgress.next ? ` / ${tierProgress.next.min_deliveries}` : ""} shipments
                    </p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tierProgress.progressPct}%` }} />
                  </div>
                  <p className="text-xs text-muted">
                    {tierProgress.next ? `Next tier: ${tierProgress.next.name}` : "Highest tier reached"}
                  </p>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Company / Application information */}
        <CompanyInfoCard account={account} canEdit={canEdit} />

        {/* Primary contact */}
        {(admin?.full_name || account.contact_email || admin?.phone || account.contact_phone) && (
          <Card title="Primary contact">
            <div className="space-y-3">
              {admin?.full_name && <InfoRow icon={<UserCircle2 className="h-4 w-4" />} label="Contact Name" value={admin.full_name} />}
              {account.contact_email && <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={account.contact_email} />}
              {(admin?.phone || account.contact_phone) && (
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={(admin?.phone || account.contact_phone)!} />
              )}
            </div>
          </Card>
        )}

        {/* Activity */}
        <ActivityFeed
          title="Activity"
          items={activity}
          isLoading={activityLoading}
        />

        {/* Internal notes */}
        <CorporateNotesSection corporateId={id} />
      </div>

      <TierDetailsSheet
        open={tierSheetOpen}
        onClose={() => setTierSheetOpen(false)}
        delivered={stats?.deliveredShipments ?? 0}
        tiers={tiers}
      />

      <ManageAccessSheet
        open={accessOpen}
        onClose={() => setAccessOpen(false)}
        profiles={account.profiles ?? []}
        stageGrantsAccess={hasPortalAccess}
      />

      <RejectAccountDialog
        accountId={id}
        accountName={account.account_name}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteMut.isPending}
        title="Delete corporate customer"
        description={
          <>
            {account.account_name} will be removed from the dashboard and its logins
            disabled. Deliveries, invoices and history are kept, and this can be undone
            by an administrator. Use <em>Purge</em> for a permanent wipe.
          </>
        }
        confirmLabel="Delete"
      />

      <ConfirmDialog
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        onConfirm={handleSuspend}
        loading={statusMut.isPending}
        tone="default"
        title="Suspend account"
        description={
          <>
            Suspend {account.account_name}? Portal access is paused; move them back to
            Active to restore it.
          </>
        }
        confirmLabel="Suspend"
      />

      <ConfirmDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        loading={statusMut.isPending}
        title="Deactivate account"
        description={
          <>
            Deactivate {account.account_name}? The account is marked Lost and portal
            access ends. This is reversible.
          </>
        }
        confirmLabel="Deactivate"
      />

      <ConfirmDialog
        open={purgeOpen}
        onClose={() => setPurgeOpen(false)}
        onConfirm={handlePurge}
        loading={purgeMut.isPending}
        title="Purge account permanently"
        description={
          <>
            Permanently delete {account.account_name} and ALL of its data now? This
            cannot be undone.
          </>
        }
        confirmLabel="Purge now"
      />
    </div>
  );
}

/* ─── Company information card (inline edit for business type / industry) ──── */

function CompanyInfoCard({ account, canEdit }: { account: Account; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [businessType, setBusinessType] = useState(account.business_type ?? "");
  const [industry, setIndustry] = useState(account.industry ?? "");
  const updateMut = useUpdateAccount(account.account_id);

  async function save() {
    try {
      await updateMut.mutateAsync({ businessType, industry });
      toast.success("Company information updated");
      setEditing(false);
    } catch (err) { toast.error((err as Error).message); }
  }

  return (
    <Card
      title="Company Information"
      action={canEdit && (
        editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={updateMut.isPending}>Save</Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        )
      )}
    >
      <div className="space-y-3">
        <InfoRow icon={<Building2 className="h-4 w-4" />} label="Legal Business Name" value={account.account_name} />
        {editing ? (
          <>
            <LabeledInput icon={<Briefcase className="h-4 w-4" />} label="Business Type" value={businessType} onChange={setBusinessType} placeholder="e.g. Corporation" />
            <LabeledInput icon={<Factory className="h-4 w-4" />} label="Industry" value={industry} onChange={setIndustry} placeholder="e.g. Logistics" />
          </>
        ) : (
          <>
            <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Business Type" value={account.business_type || "—"} />
            <InfoRow icon={<Factory className="h-4 w-4" />} label="Industry" value={account.industry || "—"} />
          </>
        )}
        {account.abn && <InfoRow icon={<Hash className="h-4 w-4" />} label="Business Number" value={account.abn} />}
        {account.website && <InfoRow icon={<Globe className="h-4 w-4" />} label="Website" value={account.website} />}
        {formatAddress(account) && <InfoRow icon={<MapPin className="h-4 w-4" />} label="Business Address" value={formatAddress(account)!} />}
        <InfoRow icon={<Calendar className="h-4 w-4" />} label="Registered" value={fmtDate(account.created_at, true)} />
      </div>
    </Card>
  );
}

/* ─── Follow-up tracking card (internal CRM — last/next contact, owner) ────── */

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

function FollowUpCard({ account, canEdit }: { account: Account; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [lastContactedAt, setLastContactedAt] = useState(toDateInputValue(account.last_contacted_at));
  const [nextFollowUpAt, setNextFollowUpAt] = useState(toDateInputValue(account.next_follow_up_at));
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(account.assigned_employee_id ?? "");
  const updateMut = useUpdateAccount(account.account_id);

  const { data: employeesRes } = useAdminEmployees({ limit: 200 }, { enabled: editing });
  const employees = (employeesRes?.data ?? []).filter((e) => e.is_active);
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.full_name ?? e.email,
    icon: <UserAvatar name={e.full_name} avatarUrl={e.avatar_url} size="xs" rounded="lg" />,
  }));

  function startEditing() {
    setLastContactedAt(toDateInputValue(account.last_contacted_at));
    setNextFollowUpAt(toDateInputValue(account.next_follow_up_at));
    setAssignedEmployeeId(account.assigned_employee_id ?? "");
    setEditing(true);
  }

  async function save() {
    try {
      await updateMut.mutateAsync({
        lastContactedAt:    lastContactedAt || null,
        nextFollowUpAt:     nextFollowUpAt  || null,
        assignedEmployeeId: assignedEmployeeId || null,
      });
      toast.success("Follow-up details updated");
      setEditing(false);
    } catch (err) { toast.error((err as Error).message); }
  }

  const assignedEmployee = account.assigned_employee;
  const overdue = !!account.next_follow_up_at && new Date(account.next_follow_up_at).getTime() < Date.now();

  return (
    <Card
      title="Follow-up"
      subtitle="Internal CRM tracking — not visible to the customer"
      action={canEdit && (
        editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={updateMut.isPending}>Save</Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={startEditing}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
        )
      )}
    >
      <div className="space-y-3">
        {editing ? (
          <>
            <LabeledInput
              icon={<PhoneCall className="h-4 w-4" />}
              label="Last Contacted"
              type="date"
              value={lastContactedAt}
              onChange={setLastContactedAt}
            />
            <LabeledInput
              icon={<CalendarClock className="h-4 w-4" />}
              label="Next Follow Up"
              type="date"
              value={nextFollowUpAt}
              onChange={setNextFollowUpAt}
            />
            <div className="flex items-center gap-4 rounded-xl border border-card-border bg-background px-5 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCog className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Assigned To</p>
                <SearchableSelect
                  value={assignedEmployeeId}
                  onValueChange={setAssignedEmployeeId}
                  options={employeeOptions}
                  placeholder="Unassigned"
                  searchPlaceholder="Search employees…"
                  emptyText="No active employees"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <InfoRow icon={<PhoneCall className="h-4 w-4" />} label="Last Contacted" value={fmtDate(account.last_contacted_at)} />
            <InfoRow
              icon={<CalendarClock className="h-4 w-4" />}
              label="Next Follow Up"
              value={account.next_follow_up_at ? `${fmtDate(account.next_follow_up_at)}${overdue ? " (overdue)" : ""}` : "—"}
            />
            <div className="flex items-center gap-4 rounded-xl border border-card-border bg-background px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCog className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Assigned To</p>
                {assignedEmployee ? (
                  <div className="mt-1 flex items-center gap-2">
                    <UserAvatar name={assignedEmployee.full_name} avatarUrl={assignedEmployee.avatar_url} size="xs" rounded="lg" />
                    <span className="text-sm font-medium text-foreground">{assignedEmployee.full_name ?? "No name"}</span>
                  </div>
                ) : (
                  <p className="mt-0.5 truncate text-sm font-medium text-muted">Unassigned</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function LabeledInput({ icon, label, value, onChange, placeholder, type = "text" }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-card-border bg-background px-5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-0.5 w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ─── Manage Access sheet ─────────────────────────────────────────────────── */

function ManageAccessSheet({ open, onClose, profiles, stageGrantsAccess }: {
  open: boolean; onClose: () => void; profiles: AccountProfile[]; stageGrantsAccess: boolean;
}) {
  return (
    <Sheet open={open} onClose={onClose} size="md">
      <div className="flex h-full flex-col">
        <div className="shrink-0 border-b border-card-border px-6 py-4">
          <h2 className="text-base font-bold text-foreground">Manage Access</h2>
          <p className="mt-0.5 text-xs text-muted">Users who can sign in to this company&apos;s portal</p>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {!stageGrantsAccess && (
            <p className="rounded-xl border border-warning/25 bg-warning/5 px-4 py-3 text-xs text-yellow-700">
              Portal access is controlled by the pipeline stage. Move this company to
              <span className="font-medium"> Onboarding</span> or <span className="font-medium">Active</span> to
              enable logins.
            </p>
          )}
          {profiles.length === 0 && <p className="p-4 text-sm text-muted">No users on this account.</p>}
          {profiles.map((p) => (
            <AccessRow key={p.id} profile={p} canToggle={stageGrantsAccess} />
          ))}
        </div>
      </div>
    </Sheet>
  );
}

function AccessRow({ profile, canToggle }: { profile: AccountProfile; canToggle: boolean }) {
  const approveMut = useApproveUser(profile.id);
  async function toggle(approved: boolean) {
    try {
      await approveMut.mutateAsync(approved);
      toast.success(approved ? "Access granted" : "Access revoked");
    } catch (err) { toast.error((err as Error).message); }
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" rounded="xl" />
        <div>
          <p className="text-sm font-medium text-foreground">{profile.full_name ?? "No name"}</p>
          <p className="text-xs text-muted">
            {profile.company_role === "company_admin" ? "Company Admin" : "Employee"}
            {" · "}{profile.is_approved ? "Can sign in" : "No access"}
          </p>
        </div>
      </div>
      {canToggle && (profile.is_approved ? (
        <Button size="sm" variant="outline" onClick={() => toggle(false)} disabled={approveMut.isPending}
          className="border-red-200 text-red-600 hover:bg-red-50">Revoke</Button>
      ) : (
        <Button size="sm" onClick={() => toggle(true)} disabled={approveMut.isPending}>Grant</Button>
      ))}
    </div>
  );
}
