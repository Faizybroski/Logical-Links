"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, Mail, Phone, Calendar, CheckCircle2, Clock, ShieldCheck, XCircle,
  ChevronRight, Building2, UserCircle2, Globe, Hash, MapPin, RotateCcw, Trash2,
  Briefcase, Factory, Package, Truck, FileText, DollarSign, Award, Users, Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { KpiCard } from "@/components/deliveries/kpi-card";
import { TierDetailsSheet } from "@/components/deliveries/sheets/tier-details-sheet";
import { getTierProgress } from "@/lib/tiers";
import {
  useAccount, useAccountStats, useAccountActivity,
  useReconsiderAccount, usePurgeAccount, useUpdateAccount,
} from "@/hooks/use-accounts";
import { useApproveUser } from "@/hooks/use-users";
import { useTiers } from "@/hooks/use-tiers";
import { usePermission } from "@/hooks/use-permission";
import { CorporateNotesSection } from "@/components/admin/CorporateNotesSection";
import { ActivityFeed } from "@/components/accounts/activity-feed";
import { RejectAccountDialog } from "@/components/accounts/reject-account-dialog";
import { CompanyLogo } from "@/components/ui/company-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Account, AccountProfile } from "@/types/api.types";

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

function StatusPill({ kind }: { kind: "active" | "pending" | "rejected" }) {
  const map = {
    active:   { cls: "border-success/25 bg-success/10 text-green-700", icon: <CheckCircle2 className="h-3 w-3" />, label: "Active" },
    pending:  { cls: "border-warning/25 bg-warning/10 text-yellow-700", icon: <Clock className="h-3 w-3" />, label: "Pending" },
    rejected: { cls: "border-danger/25 bg-danger/10 text-red-700", icon: <XCircle className="h-3 w-3" />, label: "Rejected" },
  }[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${map.cls}`}>
      {map.icon}{map.label}
    </span>
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
  const isRejected = !!account?.rejected_at;
  const isApproved = !!admin?.is_approved && !isRejected;
  const isPending = !isApproved && !isRejected;

  const { data: statsRes } = useAccountStats(isApproved ? id : "");
  const { data: activityRes, isLoading: activityLoading } = useAccountActivity(id);
  const { data: tiersRes } = useTiers();

  const activity = activityRes?.data ?? [];
  const stats = statsRes?.data;
  const tiers = tiersRes?.data ?? [];

  const reviewedByLabel = useMemo(
    () => activity.find((a) => a.event_type === "rejected" || a.event_type === "reviewed")?.actor_label ?? null,
    [activity],
  );

  const [rejectOpen, setRejectOpen] = useState(false);
  const [tierSheetOpen, setTierSheetOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

  const approveMut = useApproveUser(admin?.id ?? "");
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

  const handleApprove = async (approved: boolean) => {
    if (!admin) { toast.error("No company admin on this account"); return; }
    try {
      await approveMut.mutateAsync(approved);
      toast.success(approved ? `${account.account_name} approved` : `Approval revoked`);
    } catch (err) { toast.error((err as Error).message); }
  };

  const handleReconsider = async () => {
    try {
      await reconsiderMut.mutateAsync();
      toast.success("Request reopened for review");
    } catch (err) { toast.error((err as Error).message); }
  };

  const handlePurge = async () => {
    if (!confirm(`Permanently delete ${account.account_name} and ALL of its data now? This cannot be undone.`)) return;
    try {
      await purgeMut.mutateAsync();
      toast.success("Account permanently deleted");
      window.location.href = "/admin/corporate-customers";
    } catch (err) { toast.error((err as Error).message); }
  };

  const displayId = isApproved ? account.customer_id : account.request_id;
  const tierProgress = tiers.length > 0 ? getTierProgress(stats?.deliveredShipments ?? 0, tiers) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 py-4">
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
                <p className="text-xs text-muted">{isApproved ? "Corporate Customer" : "Corporate Account Request"} · {displayId}</p>
              </div>
            </div>
            <StatusPill kind={isApproved ? "active" : isRejected ? "rejected" : "pending"} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
        {/* Identity card */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
          <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
            <CompanyLogo name={account.account_name} logoUrl={account.logo_url} size="xl" rounded="2xl" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{account.account_name}</h2>
              <p className="mt-0.5 text-sm text-muted">{isApproved ? "Customer" : "Request"} ID: {displayId}</p>
              <p className="mt-0.5 text-sm text-muted">
                {isApproved ? "Customer since " : "Submitted "}{fmtDate(account.created_at, true)}
              </p>
              {isApproved && tierProgress && (
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-info/25 bg-info/10 px-3 py-1 text-xs font-semibold text-blue-700">
                  <Award className="h-3 w-3" /> {tierProgress.current.name}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {isPending && canEdit && (
                <>
                  <Button onClick={() => handleApprove(true)} disabled={approveMut.isPending}
                    className="rounded-lg bg-primary px-5 text-sm text-sidebar hover:bg-primary/85">
                    <ShieldCheck className="mr-1.5 h-4 w-4" /> Approve
                  </Button>
                  <Button variant="outline" onClick={() => setRejectOpen(true)}
                    className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50">
                    <XCircle className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              {isRejected && (
                <>
                  {canEdit && (
                    <Button onClick={handleReconsider} disabled={reconsiderMut.isPending}
                      className="rounded-lg bg-primary px-5 text-sm text-sidebar hover:bg-primary/85">
                      <RotateCcw className="mr-1.5 h-4 w-4" /> Reconsider
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="outline" onClick={handlePurge} disabled={purgeMut.isPending}
                      className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Purge now
                    </Button>
                  )}
                </>
              )}
              {isApproved && canEdit && (
                <>
                  <Button variant="outline" onClick={() => setAccessOpen(true)} className="rounded-lg px-5 text-sm">
                    <Users className="mr-1.5 h-4 w-4" /> Manage Access
                  </Button>
                  <Button variant="outline" onClick={() => handleApprove(false)} disabled={approveMut.isPending}
                    className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50">
                    <XCircle className="mr-1.5 h-4 w-4" /> Revoke Approval
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rejected: retention banner */}
        {isRejected && (
          <div className="rounded-2xl border border-danger/25 bg-danger/5 px-5 py-3 text-sm text-red-700">
            Portal access is revoked. This request and its data are scheduled for permanent deletion on{" "}
            <strong>{fmtDate(account.purge_after, true)}</strong>. Use <em>Reconsider</em> before then to restore it.
          </div>
        )}

        {/* Review Decision (shown once reviewed) */}
        {(isRejected || account.reviewed_at) && (
          <Card title="Review Decision">
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2"><dt className="w-36 shrink-0 text-muted">Status</dt>
                <dd className="font-medium text-foreground">{isRejected ? "Rejected" : "Reviewed"}</dd></div>
              {account.rejection_reason && (
                <div className="flex gap-2"><dt className="w-36 shrink-0 text-muted">Reason</dt>
                  <dd className="text-foreground">{account.rejection_reason}</dd></div>
              )}
              <div className="flex gap-2"><dt className="w-36 shrink-0 text-muted">Portal Access</dt>
                <dd className="text-foreground">{isApproved ? "Granted" : "Not granted"}</dd></div>
              {account.review_note && (
                <div className="flex gap-2"><dt className="w-36 shrink-0 text-muted">Note</dt>
                  <dd className="text-foreground">{account.review_note}</dd></div>
              )}
              <div className="flex gap-2"><dt className="w-36 shrink-0 text-muted">Reviewed By</dt>
                <dd className="text-foreground">{reviewedByLabel ?? "—"}</dd></div>
              <div className="flex gap-2"><dt className="w-36 shrink-0 text-muted">Decision Date</dt>
                <dd className="text-foreground">{fmtDate(account.rejected_at ?? account.reviewed_at, true)}</dd></div>
            </dl>
          </Card>
        )}

        {/* Approved: stats + tier */}
        {isApproved && (
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

        {/* Applicant (request mode) */}
        {!isApproved && (
          <Card title="Applicant">
            <div className="space-y-3">
              {admin?.full_name && <InfoRow icon={<UserCircle2 className="h-4 w-4" />} label="Applicant Name" value={admin.full_name} />}
              {account.contact_email && <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={account.contact_email} />}
              {(admin?.phone || account.contact_phone) && (
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={(admin?.phone || account.contact_phone)!} />
              )}
            </div>
          </Card>
        )}

        {/* Activity */}
        <ActivityFeed
          title={isApproved ? "Recent Activity" : "Application History"}
          items={activity}
          isLoading={activityLoading}
        />

        {/* Internal notes */}
        <CorporateNotesSection corporateId={id} />
      </div>

      <RejectAccountDialog
        accountId={id}
        accountName={account.account_name}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
      />

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

function LabeledInput({ icon, label, value, onChange, placeholder }: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-card-border bg-background px-5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <input
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

function ManageAccessSheet({ open, onClose, profiles }: {
  open: boolean; onClose: () => void; profiles: AccountProfile[];
}) {
  return (
    <Sheet open={open} onClose={onClose} size="md">
      <div className="flex h-full flex-col">
        <div className="shrink-0 border-b border-card-border px-6 py-4">
          <h2 className="text-base font-bold text-foreground">Manage Access</h2>
          <p className="mt-0.5 text-xs text-muted">Users who can sign in to this company&apos;s portal</p>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {profiles.length === 0 && <p className="p-4 text-sm text-muted">No users on this account.</p>}
          {profiles.map((p) => (
            <AccessRow key={p.id} profile={p} />
          ))}
        </div>
      </div>
    </Sheet>
  );
}

function AccessRow({ profile }: { profile: AccountProfile }) {
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
            {" · "}{profile.is_approved ? "Active" : "Pending"}
          </p>
        </div>
      </div>
      {profile.is_approved ? (
        <Button size="sm" variant="outline" onClick={() => toggle(false)} disabled={approveMut.isPending}
          className="border-red-200 text-red-600 hover:bg-red-50">Revoke</Button>
      ) : (
        <Button size="sm" onClick={() => toggle(true)} disabled={approveMut.isPending}>Approve</Button>
      )}
    </div>
  );
}
