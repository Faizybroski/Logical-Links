"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

type Props = {
  allowedRoles?: ("admin" | "shipper")[];
  children: React.ReactNode;
};

export default function AuthGuard({ allowedRoles, children }: Props) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait until Zustand has rehydrated from localStorage. Without this check,
    // the first render sees isAuthenticated=false (default) and redirects to
    // /login before persisted state is loaded — causing a logout-on-refresh.
    if (!_hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/shipper/dashboard");
    }
  }, [isAuthenticated, user, allowedRoles, router, _hasHydrated]);

  // Show nothing (no flash) until rehydration completes.
  if (!_hasHydrated) return null;

  if (!isAuthenticated || !user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
