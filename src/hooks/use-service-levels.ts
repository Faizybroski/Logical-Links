import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { ServiceLevel, CreateServiceLevelDto, UpdateServiceLevelDto } from "@/types/api.types";

const KEYS = { all: ["service-levels"] as const };

export function useServiceLevels(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => api.get<ApiResponse<ServiceLevel[]>>("/api/v1/service-levels"),
    enabled:  options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateServiceLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateServiceLevelDto) =>
      api.post<ApiResponse<ServiceLevel>>("/api/v1/service-levels", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateServiceLevel(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateServiceLevelDto) =>
      api.patch<ApiResponse<ServiceLevel>>(`/api/v1/service-levels/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteServiceLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<null>>(`/api/v1/service-levels/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
