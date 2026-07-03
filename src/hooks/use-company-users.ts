import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type { CompanyUser } from "@/types/api.types";

const KEYS = {
  all:    ["company-users"] as const,
  list:   (q?: object) => ["company-users", "list", q] as const,
  detail: (id: string) => ["company-users", id] as const,
};

type ListQuery = { page?: number; limit?: number };

export function useEmployees(query: ListQuery = {}, options?: { enabled?: boolean }) {
  const params = new URLSearchParams();
  if (query.page)  params.set("page",  String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => api.get<PaginatedResponse<CompanyUser>>(`/api/v1/company/employees${qs}`),
    enabled:  options?.enabled ?? true,
    staleTime: 2 * 60_000,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<CompanyUser>>(`/api/v1/company/employees/${id}`),
    enabled:  !!id,
    staleTime: 2 * 60_000,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; fullName: string; phone?: string }) =>
      api.post<ApiResponse<CompanyUser>>("/api/v1/company/employees", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { fullName?: string; phone?: string; isActive?: boolean }) =>
      api.patch<ApiResponse<CompanyUser>>(`/api/v1/company/employees/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}
