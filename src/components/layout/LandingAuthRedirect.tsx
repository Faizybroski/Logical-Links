"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

/**
 * Drop into the root landing page to silently redirect authenticated users to
 * their role-specific dashboard. Renders nothing — purely a side-effect component.
 *
 * Must wait for Zustand to rehydrate from localStorage (_hasHydrated) before
 * making any redirect decision; otherwise a page refresh races the hydration
 * and incorrectly keeps authenticated users on the landing page.
 */
export default function LandingAuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (isAuthenticated && user) {
      const dest = user.role === "admin" ? "/admin/dashboard" : "/shipper/dashboard";
      router.replace(dest);
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  return null;
}
