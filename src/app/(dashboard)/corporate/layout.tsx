"use client";

import { Clock, XCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useMe } from "@/hooks/use-users";
import { useMyProfile } from "@/hooks/use-accounts";
import {
  CORPORATE_PIPELINE_STATUS_META,
  accountDisplayStatus,
  type AccountDisplayStatus,
} from "@/types/api.types";

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const { data: meRes, isLoading } = useMe();
  const { data: accountRes } = useMyProfile();

  // Admins bypass this layout (shouldn't reach corporate routes, but safe fallback)
  if (user?.role === "admin") return <>{children}</>;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const profile = meRes?.data;
  const account = accountRes?.data;

  if (profile && !profile.isApproved) {
    const stage: AccountDisplayStatus = account ? accountDisplayStatus(account) : "interested";
    return <PendingAccessScreen email={user?.email ?? ""} stage={stage} />;
  }

  return <>{children}</>;
}

function PendingAccessScreen({
  email,
  stage,
}: {
  email: string;
  stage: AccountDisplayStatus;
}) {
  const rejected = stage === "rejected";
  const meta = CORPORATE_PIPELINE_STATUS_META[stage];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-5 text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            rejected ? "bg-danger/10" : "bg-warning/10"
          }`}
        >
          {rejected ? (
            <XCircle className="h-8 w-8 text-red-600" />
          ) : (
            <Clock className="h-8 w-8 text-yellow-600" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {rejected ? "Application Not Approved" : "Account Being Set Up"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {rejected ? (
              <>
                Your application (<span className="font-medium text-foreground">{email}</span>) was not
                approved at this time. If you believe this is a mistake, please contact our support team.
              </>
            ) : (
              <>
                Your account (<span className="font-medium text-foreground">{email}</span>) is being
                reviewed by our team. You&apos;ll be able to access the portal once it&apos;s activated.
              </>
            )}
          </p>
        </div>

        {!rejected && (
          <div className="rounded-[12px] border border-warning/30 bg-warning/5 px-5 py-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">Current status</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{meta.label}</p>
            <p className="mt-0.5 text-xs text-muted">{meta.description}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              <li>• Our team reviews your details and gets your account set up</li>
              <li>• You&apos;ll be notified once your account is activated</li>
              <li>• You can then log back in to access your dashboard</li>
            </ul>
          </div>
        )}

        <p className="text-xs text-muted">
          Questions? Our Customer Support Team is here to help.
        </p>
      </div>
    </div>
  );
}
