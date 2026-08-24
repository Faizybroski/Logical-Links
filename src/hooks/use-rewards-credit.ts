import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { RewardsCreditSummary, RewardsCreditHistoryEntry, ApplyRewardsCreditResult } from "@/types/api.types";

export function useRewardsCreditSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["rewards-credit-summary"],
    queryFn:  () => api.get<ApiResponse<RewardsCreditSummary>>("/api/v1/rewards-credit/summary"),
    enabled:  options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useRewardsCreditHistory(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["rewards-credit-history"],
    queryFn:  () => api.get<ApiResponse<RewardsCreditHistoryEntry[]>>("/api/v1/rewards-credit/history"),
    enabled:  options?.enabled ?? true,
    staleTime: 30_000,
  });
}

export function useApplyRewardsCredit(quotationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiResponse<ApplyRewardsCreditResult>>(`/api/v1/quotations/${quotationId}/apply-rewards-credit`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rewards-credit-summary"] });
      qc.invalidateQueries({ queryKey: ["rewards-credit-history"] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}
