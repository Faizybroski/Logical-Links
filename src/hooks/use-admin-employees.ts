import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type { AdminEmployee, CreateAdminEmployeeDto, UpdateAdminEmployeeDto } from "@/types/api.types";

const KEYS = {
  all:    ["admin-employees"] as const,
  list:   (q?: object) => ["admin-employees", "list", q] as const,
  detail: (id: string) => ["admin-employees", id] as const,
};

type ListQuery = { page?: number; limit?: number };

export function useAdminEmployees(query: ListQuery = {}, options?: { enabled?: boolean }) {
  const params = new URLSearchParams();
  if (query.page)  params.set("page",  String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => api.get<PaginatedResponse<AdminEmployee>>(`/api/v1/admin/employees${qs}`),
    enabled:  options?.enabled ?? true,
    staleTime: 2 * 60_000,
  });
}

export function useAdminEmployee(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<AdminEmployee>>(`/api/v1/admin/employees/${id}`),
    enabled:  !!id,
    staleTime: 2 * 60_000,
  });
}

export function useCreateAdminEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdminEmployeeDto) =>
      api.post<ApiResponse<AdminEmployee>>("/api/v1/admin/employees", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateAdminEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAdminEmployeeDto) =>
      api.patch<ApiResponse<AdminEmployee>>(`/api/v1/admin/employees/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}
