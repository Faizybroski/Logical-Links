import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  ContactMessage,
  UpdateContactMessageStatusDto,
  ListContactMessagesQuery,
} from "@/types/api.types";

const KEYS = {
  all:  ["contact-messages"] as const,
  list: (q: ListContactMessagesQuery) => ["contact-messages", "list", q] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

export function useContactMessages(query: ListContactMessagesQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => v !== undefined && params.set(k, String(v)));
      return api.get<PaginatedResponse<ContactMessage>>(`/api/v1/contact?${params}`);
    },
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useUpdateContactMessageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContactMessageStatusDto }) =>
      api.patch<ApiResponse<ContactMessage>>(`/api/v1/contact/${id}/status`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
