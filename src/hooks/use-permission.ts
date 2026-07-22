"use client";

import { useAuthStore } from "@/store/auth.store";

export function usePermission(key: string): boolean {
  return useAuthStore((s) => {
    const user = s.user;
    if (!user) return false;
    // Admin permission matrix only governs internal admin staff — shipper-side
    // users aren't subject to it, mirroring the backend's requirePermissionIfAdmin.
    if (user.role !== "admin") return true;
    return user.permissions?.includes(key) ?? false;
  });
}
