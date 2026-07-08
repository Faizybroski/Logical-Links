"use client";

import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  ChevronRight,
  Building2,
  Users,
  UserCircle2,
  BadgeCheck,
  Globe,
  Hash,
  MapPin,
  Receipt,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/use-accounts";
import { useApproveUser } from "@/hooks/use-users";
import { ShipperNotesSection } from "@/components/admin/ShipperNotesSection";
import { CompanyLogo } from "@/components/ui/company-logo";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Account, AccountProfile } from "@/types/api.types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(d: string, long = false) {
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric",
    month: long ? "long" : "short",
    day: "numeric",
  });
}

function initials(name: string | null, fallback = "CO"): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return fallback.slice(0, 2).toUpperCase();
}

function getAdmin(profiles?: AccountProfile[]): AccountProfile | undefined {
  return profiles?.find((p) => p.company_role === "company_admin");
}

function getEmployees(profiles?: AccountProfile[]): AccountProfile[] {
  return profiles?.filter((p) => p.company_role === "employee") ?? [];
}

function formatAddress(account: Account): string | null {
  const parts = [
    account.address_line1,
    account.address_city,
    account.address_state,
    account.address_postcode,
    account.address_country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-card-border bg-background px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: res, isLoading } = useAccount(id);
  const account: Account | undefined = res?.data;

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
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">Company Not Found</p>
          <p className="mt-1 text-sm text-muted">
            This shipping company does not exist or may have been removed.
          </p>
        </div>
        <Link
          href="/admin/shippers"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Company Listing
        </Link>
      </div>
    );
  }

  const admin = getAdmin(account.profiles);
  const employees = getEmployees(account.profiles);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
            <Link
              href="/admin/shippers"
              className="hover:text-foreground transition-colors"
            >
              Shipping Companies
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{account.account_name}</span>
          </nav>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/shippers"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {account.account_name}
                </h1>
                {account.contact_email && (
                  <p className="text-xs text-muted">{account.contact_email}</p>
                )}
              </div>
            </div>

            {/* Company status badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                account.is_active
                  ? "border-success/25 bg-success/10 text-green-700"
                  : "border-danger/25 bg-danger/10 text-red-700"
              }`}
            >
              {account.is_active ? (
                <><CheckCircle2 className="h-3 w-3" /> Active</>
              ) : (
                <><XCircle className="h-3 w-3" /> Inactive</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">

          {/* ── Company overview card ── */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
              <CompanyLogo
                name={account.account_name}
                logoUrl={account.logo_url}
                size="xl"
                rounded="2xl"
              />

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  {account.account_name}
                </h2>
                {account.abn && (
                  <p className="mt-0.5 text-sm text-muted">ABN: {account.abn}</p>
                )}
                {account.website && (
                  <a
                    href={account.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 flex items-center justify-center gap-1 text-sm text-primary hover:underline sm:justify-start"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {account.website}
                  </a>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-info/25 bg-info/10 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Building2 className="h-3 w-3" />
                    Shipping Company
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-background px-3 py-1 text-xs font-semibold text-muted">
                    <Users className="h-3 w-3" />
                    {employees.length} {employees.length === 1 ? "Employee" : "Employees"}
                  </span>
                </div>
              </div>

              {/* Admin approval actions */}
              {admin && <ApprovalActions admin={admin} companyName={account.account_name} />}
            </div>
          </div>

          {/* ── Company Information ── */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="border-b border-card-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Company Information</h3>
            </div>
            <div className="space-y-3 p-6">
              {account.abn && (
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="Business Number"
                  value={account.abn}
                />
              )}
              {account.website && (
                <InfoRow
                  icon={<Globe className="h-4 w-4" />}
                  label="Website"
                  value={account.website}
                />
              )}
              {formatAddress(account) && (
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="Address"
                  value={formatAddress(account)!}
                />
              )}
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Registered"
                value={formatDate(account.created_at, true)}
              />
            </div>
          </div>

          {/* ── Primary Contact ── */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="border-b border-card-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Primary Contact</h3>
            </div>
            <div className="space-y-3 p-6">
              {account.contact_name && (
                <InfoRow
                  icon={<UserCircle2 className="h-4 w-4" />}
                  label="Contact Name"
                  value={account.contact_name}
                />
              )}
              {account.contact_email && (
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Contact Email"
                  value={account.contact_email}
                />
              )}
              {account.contact_phone && (
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Contact Phone"
                  value={account.contact_phone}
                />
              )}
              {!account.contact_name && !account.contact_email && !account.contact_phone && (
                <p className="py-2 text-sm italic text-muted">No primary contact on file</p>
              )}
            </div>
          </div>

          {/* ── Billing Contact ── */}
          {(account.billing_email || account.accounts_payable_email) && (
            <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
              <div className="border-b border-card-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">Billing Contact</h3>
              </div>
              <div className="space-y-3 p-6">
                {account.billing_email && (
                  <InfoRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Billing Email"
                    value={account.billing_email}
                  />
                )}
                {account.accounts_payable_email && (
                  <InfoRow
                    icon={<Receipt className="h-4 w-4" />}
                    label="Accounts Payable Email"
                    value={account.accounts_payable_email}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Company Admin card ── */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="border-b border-card-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Company Admin</h3>
              <p className="mt-0.5 text-xs text-muted">
                Primary administrator for this shipping company
              </p>
            </div>
            <div className="p-6">
              {admin ? (
                <div className="flex items-center gap-4">
                  <UserAvatar
                    name={admin.full_name}
                    avatarUrl={admin.avatar_url}
                    size="lg"
                    rounded="xl"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {admin.full_name ?? (
                        <span className="italic font-normal text-muted">No name set</span>
                      )}
                    </p>
                    {admin.phone && (
                      <p className="flex items-center gap-1 text-xs text-muted mt-0.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        {admin.phone}
                      </p>
                    )}
                    <div className="mt-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                          admin.is_approved
                            ? "border-success/25 bg-success/10 text-green-700"
                            : "border-warning/25 bg-warning/10 text-yellow-700"
                        }`}
                      >
                        {admin.is_approved ? (
                          <><BadgeCheck className="h-3 w-3" /> Approved</>
                        ) : (
                          <><Clock className="h-3 w-3" /> Pending Approval</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-card-border py-6 px-5">
                  <UserCircle2 className="h-5 w-5 text-muted-light" />
                  <p className="text-sm text-muted italic">No admin assigned to this company</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Employees list ── */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="border-b border-card-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">
                Employees
                {employees.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {employees.length}
                  </span>
                )}
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Staff members assigned to this shipping company
              </p>
            </div>
            <div className="p-6">
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/20">
                    <Users className="h-6 w-6 text-muted" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No employees yet</p>
                  <p className="mt-1 text-xs text-muted">
                    Employees will appear here once they are added to this company.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-card-border">
                  {employees.map((emp) => (
                    <EmployeeRow key={emp.id} employee={emp} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Internal Notes ── */}
          <ShipperNotesSection shipperId={id} />

        </div>
      </div>
    </div>
  );
}

/* ─── Employee row ───────────────────────────────────────────────────────── */

function EmployeeRow({ employee }: { employee: AccountProfile }) {
  return (
    <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
      <UserAvatar
        name={employee.full_name}
        avatarUrl={employee.avatar_url}
        size="md"
        rounded="xl"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {employee.full_name ?? (
            <span className="italic font-normal text-muted">No name set</span>
          )}
        </p>
        {employee.phone && (
          <p className="flex items-center gap-1 text-xs text-muted mt-0.5">
            <Phone className="h-3 w-3 shrink-0" />
            {employee.phone}
          </p>
        )}
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
          employee.is_active !== false
            ? "border-success/25 bg-success/10 text-green-700"
            : "border-danger/25 bg-danger/10 text-red-700"
        }`}
      >
        {employee.is_active !== false ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

/* ─── Approval actions ───────────────────────────────────────────────────── */

function ApprovalActions({
  admin,
  companyName,
}: {
  admin: AccountProfile;
  companyName: string;
}) {
  const approveMut = useApproveUser(admin.id);

  async function handle(isApproved: boolean) {
    try {
      await approveMut.mutateAsync(isApproved);
      toast.success(
        isApproved
          ? `${companyName} approved`
          : `${companyName} approval revoked`,
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (!admin.is_approved) {
    return (
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Button
          type="button"
          onClick={() => handle(true)}
          disabled={approveMut.isPending}
          className="rounded-lg bg-primary px-5 text-sm text-sidebar hover:bg-primary/85"
        >
          <ShieldCheck className="mr-1.5 h-4 w-4" />
          Approve
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handle(false)}
          disabled={approveMut.isPending}
          className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50"
        >
          <XCircle className="mr-1.5 h-4 w-4" />
          Reject
        </Button>
      </div>
    );
  }

  return (
    <div className="shrink-0">
      <Button
        type="button"
        variant="outline"
        onClick={() => handle(false)}
        disabled={approveMut.isPending}
        className="rounded-lg border-red-200 px-5 text-sm text-red-600 hover:bg-red-50"
      >
        <XCircle className="mr-1.5 h-4 w-4" />
        Revoke Approval
      </Button>
    </div>
  );
}
