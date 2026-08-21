import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { DeliveryRateCard, CreateDeliveryRateDto, UpdateDeliveryRateDto } from "@/types/api.types";

const KEYS = { all: ["delivery-rates"] as const };

export function useDeliveryRates(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => api.get<ApiResponse<DeliveryRateCard[]>>("/api/v1/delivery-rates"),
    enabled:  options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateDeliveryRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDeliveryRateDto) =>
      api.post<ApiResponse<DeliveryRateCard>>("/api/v1/delivery-rates", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateDeliveryRate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateDeliveryRateDto) =>
      api.patch<ApiResponse<DeliveryRateCard>>(`/api/v1/delivery-rates/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteDeliveryRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<null>>(`/api/v1/delivery-rates/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
