import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { AdditionalCharge, CreateChargeDto, UpdateChargeDto } from "@/types/api.types";

const KEYS = { all: ["additional-charges"] as const };

export function useAdditionalCharges(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => api.get<ApiResponse<AdditionalCharge[]>>("/api/v1/additional-charges"),
    enabled:  options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateChargeDto) =>
      api.post<ApiResponse<AdditionalCharge>>("/api/v1/additional-charges", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateCharge(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateChargeDto) =>
      api.patch<ApiResponse<AdditionalCharge>>(`/api/v1/additional-charges/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<null>>(`/api/v1/additional-charges/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
