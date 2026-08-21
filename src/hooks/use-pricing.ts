import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { CalculatePriceDto, PriceBreakdown, WeightRate } from "@/types/api.types";

const KEYS = { weightRate: ["pricing", "weight-rate"] as const };

export function useCalculatePrice() {
  return useMutation({
    mutationFn: (dto: CalculatePriceDto) =>
      api.post<ApiResponse<PriceBreakdown>>("/api/v1/pricing/calculate", dto),
  });
}

export function useWeightRate(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.weightRate,
    queryFn:  () => api.get<ApiResponse<WeightRate>>("/api/v1/pricing/weight-rate"),
    enabled:  options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useUpdateWeightRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (value: number) =>
      api.patch<ApiResponse<WeightRate>>("/api/v1/pricing/weight-rate", { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.weightRate }),
  });
}
