import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type { Account, CreateAccountDto, UpdateAccountDto } from "@/types/api.types";

const KEYS = {
  all:       ["accounts"] as const,
  list:      (q?: object) => ["accounts", "list", q] as const,
  detail:    (id: string) => ["accounts", id] as const,
  myProfile: ["accounts", "me"] as const,
};

type ListQuery = { page?: number; limit?: number; search?: string; isActive?: string };

export function useAccounts(
  query: ListQuery = {},
  options?: { enabled?: boolean },
) {
  const params = new URLSearchParams();
  if (query.page)                      params.set("page",     String(query.page));
  if (query.limit)                     params.set("limit",    String(query.limit));
  if (query.search)                    params.set("search",   query.search);
  if (query.isActive !== undefined)    params.set("isActive", query.isActive);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => api.get<PaginatedResponse<Account>>(`/api/v1/accounts${qs}`),
    enabled:  options?.enabled ?? true,
    staleTime: 2 * 60_000, // 2 minutes
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<Account>>(`/api/v1/accounts/${id}`),
    enabled:  !!id,
    staleTime: 2 * 60_000,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: KEYS.myProfile,
    queryFn:  () => api.get<ApiResponse<Account>>("/api/v1/accounts/me"),
    staleTime: 5 * 60_000, // 5 minutes — profile changes rarely
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAccountDto) =>
      api.post<ApiResponse<Account>>("/api/v1/accounts", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateAccount(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateAccountDto) =>
      api.patch<ApiResponse<Account>>(`/api/v1/accounts/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/accounts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { fullName?: string; phone?: string }) =>
      api.patch<ApiResponse<{ id: string; full_name: string; phone: string }>>("/api/v1/accounts/me", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.myProfile }),
  });
}
