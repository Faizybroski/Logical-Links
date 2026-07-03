"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

type Props = {
  allowedRoles?: ("admin" | "shipper")[];
  children: React.ReactNode;
};

const authLog = {
  info:  (...args: unknown[]) => console.info( "[Auth][Guard]", ...args),
  warn:  (...args: unknown[]) => console.warn( "[Auth][Guard]", ...args),
};

export default function AuthGuard({ allowedRoles, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const loggedOnce = useRef(false);

  useEffect(() => {
    // Wait until Zustand has rehydrated from localStorage. Without this check,
    // the first render sees isAuthenticated=false (default) and redirects to
    // /login before persisted state is loaded — causing a logout-on-refresh.
    if (!_hasHydrated) return;

    if (!isAuthenticated || !user) {
      authLog.warn(`Unauthenticated access to "${pathname}" — redirecting to /login`);
      router.replace("/login");
      return;
    }

    if (!loggedOnce.current) {
      authLog.info(`Session active — user=${user.email} role=${user.role} path="${pathname}"`);
      loggedOnce.current = true;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      const dest = user.role === "admin" ? "/admin/dashboard" : "/shipper/dashboard";
      authLog.warn(`Role "${user.role}" not allowed on "${pathname}" — redirecting to ${dest}`);
      router.replace(dest);
    }
  }, [isAuthenticated, user, allowedRoles, router, _hasHydrated, pathname]);

  // Show nothing (no flash) until rehydration completes.
  if (!_hasHydrated) return null;

  if (!isAuthenticated || !user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
