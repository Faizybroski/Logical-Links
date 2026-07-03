"use client";

import { Clock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useMe } from "@/hooks/use-users";

export default function ShipperLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const { data: meRes, isLoading } = useMe();

  // Admins bypass this layout (shouldn't reach shipper routes, but safe fallback)
  if (user?.role === "admin") return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const profile = meRes?.data;

  if (profile && !profile.isApproved) {
    return <PendingApprovalScreen email={user?.email ?? ""} />;
  }

  return <>{children}</>;
}

function PendingApprovalScreen({ email }: { email: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Pending Approval</h1>
          <p className="mt-2 text-sm text-muted">
            Your account (<span className="font-medium text-foreground">{email}</span>) is awaiting
            admin approval. You will be able to access the platform once an administrator approves
            your registration.
          </p>
        </div>
        <div className="rounded-[12px] border border-warning/30 bg-warning/5 px-5 py-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">What happens next?</p>
          <ul className="mt-2 space-y-1.5 text-sm text-muted">
            <li>• Our team will review your registration details</li>
            <li>• You&apos;ll receive an email notification once approved</li>
            <li>• You can then log back in to access your dashboard</li>
          </ul>
        </div>
        <p className="text-xs text-muted">
          If you believe this is a mistake, please contact support.
        </p>
      </div>
    </div>
  );
}
