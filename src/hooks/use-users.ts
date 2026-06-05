import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type { UserProfile } from "@/types/api.types";

const KEYS = {
  all:    ["users"] as const,
  list:   (q?: object) => ["users", "list", q] as const,
  detail: (id: string) => ["users", id] as const,
  me:     ["users", "me"] as const,
};

type ListQuery = { page?: number; limit?: number; role?: string };

export function useUsers(
  query: ListQuery = {},
  options?: { enabled?: boolean },
) {
  const params = new URLSearchParams();
  if (query.page)  params.set("page",  String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.role)  params.set("role",  query.role);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => api.get<PaginatedResponse<UserProfile>>(`/api/v1/users${qs}`),
    enabled:  options?.enabled ?? true,
    staleTime: 2 * 60_000,
  });
}

export function useMe() {
  return useQuery({
    queryKey: KEYS.me,
    queryFn:  () => api.get<ApiResponse<UserProfile>>("/api/v1/users/me"),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fullName?: string; phone?: string; avatarUrl?: string | null }) =>
      api.patch<ApiResponse<UserProfile>>("/api/v1/users/me", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.me }),
  });
}

export function useApproveUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isApproved: boolean) =>
      api.patch<ApiResponse<UserProfile>>(`/api/v1/users/${id}/approve`, { isApproved }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}
