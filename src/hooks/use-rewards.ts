import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { RewardsRule, UpdateRewardsRuleDto } from "@/types/api.types";

const KEYS = {
  all: ["rewards-rules"] as const,
};

export function useRewardsRules() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn:  () => api.get<ApiResponse<RewardsRule[]>>("/api/v1/rewards"),
    staleTime: 60_000,
  });
}

export function useUpdateRewardsRule(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateRewardsRuleDto) =>
      api.patch<ApiResponse<RewardsRule>>(`/api/v1/rewards/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
