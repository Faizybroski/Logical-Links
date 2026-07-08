import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiFetch, type ApiResponse } from "@/lib/api";
import { getAuthStore } from "@/store/auth.store";

const KEYS = {
  mfaStatus: ["security", "mfa-status"] as const,
  sessions:  ["security", "sessions"] as const,
};

// ── Password ──────────────────────────────────────────────────────────────────

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function useChangePassword() {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) =>
      api.post<ApiResponse<null>>("/api/v1/auth/change-password", dto),
  });
}

// ── MFA ───────────────────────────────────────────────────────────────────────

export type MfaStatus = {
  enabled: boolean;
  enrolledAt: string | null;
};

export type MfaEnrollResult = {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
};

export function useMfaStatus() {
  return useQuery({
    queryKey: KEYS.mfaStatus,
    queryFn:  () => api.get<ApiResponse<MfaStatus>>("/api/v1/auth/mfa/status"),
  });
}

export function useMfaEnroll() {
  return useMutation({
    mutationFn: () => api.post<ApiResponse<MfaEnrollResult>>("/api/v1/auth/mfa/enroll", {}),
  });
}

export function useMfaVerify() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      api.post<ApiResponse<null>>("/api/v1/auth/mfa/verify", { code }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.mfaStatus }),
  });
}

export function useMfaDisable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { password: string; code: string }) =>
      api.post<ApiResponse<null>>("/api/v1/auth/mfa/disable", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.mfaStatus }),
  });
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export type Session = {
  tokenId:    string;
  deviceInfo: string | null;
  ipAddress:  string | null;
  userAgent:  string | null;
  createdAt:  string;
  lastUsedAt: string | null;
  expiresAt:  string;
  isCurrent:  boolean;
};

export function useSessions() {
  return useQuery({
    queryKey: KEYS.sessions,
    queryFn: () => {
      const { refreshToken } = getAuthStore();
      return apiFetch<ApiResponse<Session[]>>("/api/v1/auth/sessions", {
        method: "GET",
        headers: refreshToken ? { "X-Refresh-Token": refreshToken } : undefined,
      });
    },
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tokenId: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/auth/sessions/${tokenId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.sessions }),
  });
}
