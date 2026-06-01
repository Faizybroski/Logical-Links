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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUsers, useApproveUser } from "@/hooks/use-users";
import { ShipperNotesSection } from "@/components/admin/ShipperNotesSection";
import type { UserProfile } from "@/types/api.types";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function initials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
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

export default function AdminShipperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading } = useUsers({ role: "shipper", limit: 100 });
  const user: UserProfile | undefined = (data?.data ?? []).find((u) => u.id === id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted">Shipper not found.</p>
        <Link href="/admin/shippers" className="text-sm text-primary underline">
          Back to shippers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 border-b border-card-border bg-card/95 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted">
            <Link href="/admin/shippers" className="hover:text-foreground transition-colors">
              Shippers
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{user.fullName ?? user.email}</span>
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
                  {user.fullName ?? user.email}
                </h1>
                <p className="text-xs text-muted">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="space-y-6">

          {/* Profile card */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                {initials(user.fullName, user.email)}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  {user.fullName ?? <span className="italic text-muted font-normal">No name set</span>}
                </h2>
                <p className="mt-0.5 text-sm text-muted">{user.email}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                      user.isApproved
                        ? "border-success/25 bg-success/10 text-green-700"
                        : "border-warning/25 bg-warning/10 text-yellow-700"
                    }`}
                  >
                    {user.isApproved ? (
                      <><CheckCircle2 className="h-3 w-3" /> Approved</>
                    ) : (
                      <><Clock className="h-3 w-3" /> Pending Approval</>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-info/25 bg-info/10 px-3 py-1 text-xs font-semibold text-blue-700">
                    Shipper
                  </span>
                </div>
              </div>

              {/* Actions */}
              <ApprovalActions user={user} />
            </div>
          </div>

          {/* Contact info */}
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
            <div className="border-b border-card-border px-6 py-4">
              <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            </div>
            <div className="space-y-3 p-6">
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email Address"
                value={user.email}
              />
              {user.phone && (
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone Number"
                  value={user.phone}
                />
              )}
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Member Since"
                value={new Date(user.createdAt).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            </div>
          </div>

          {/* Internal Notes */}
          <ShipperNotesSection shipperId={id} />

        </div>
      </div>
    </div>
  );
}

/* ─── Approval actions — needs own hook call per render ─────────────────── */

function ApprovalActions({ user }: { user: UserProfile }) {
  const approveMut = useApproveUser(user.id);

  async function handle(isApproved: boolean) {
    try {
      await approveMut.mutateAsync(isApproved);
      toast.success(
        isApproved
          ? `${user.fullName ?? user.email} approved`
          : `${user.fullName ?? user.email} approval revoked`,
      );
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  if (!user.isApproved) {
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
