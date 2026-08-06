import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { Tier, UpdateTierDto } from "@/types/api.types";

const KEYS = {
  all: ["tiers"] as const,
};

export function useTiers() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => api.get<ApiResponse<Tier[]>>("/api/v1/tiers"),
    staleTime: 60_000,
  });
}

export function useUpdateTier(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTierDto) =>
      api.patch<ApiResponse<Tier>>(`/api/v1/tiers/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
