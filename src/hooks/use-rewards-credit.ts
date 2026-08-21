import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { RewardsCreditBalance, ApplyRewardsCreditResult } from "@/types/api.types";

export function useRewardsCreditBalance(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["rewards-credit-balance"],
    queryFn:  () => api.get<ApiResponse<RewardsCreditBalance>>("/api/v1/rewards-credit/balance"),
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
      qc.invalidateQueries({ queryKey: ["rewards-credit-balance"] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}
