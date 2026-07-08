import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  Quotation,
  CreateQuotationDto,
  UpdateQuotationDto,
  ListQuotationsQuery,
  QuotationStats,
  AcceptQuotationDto,
} from "@/types/api.types";

const KEYS = {
  all:    ["quotations"] as const,
  list:   (q: ListQuotationsQuery) => ["quotations", "list", q] as const,
  detail: (id: string)             => ["quotations", "detail", id] as const,
  stats:  ["quotations", "stats"] as const,
};

export function useQuotationStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn:  () => api.get<ApiResponse<QuotationStats>>("/api/v1/quotations/stats"),
    staleTime: 30_000,
  });
}

// ── Queries ────────────────────────────────────────────────────────────────────

export function useQuotations(query: ListQuotationsQuery = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([k, v]) => v !== undefined && params.set(k, String(v)))
      return api.get<PaginatedResponse<Quotation>>(`/api/v1/quotations?${params}`)
    },
    staleTime: 30_000,
    enabled:   options?.enabled ?? true,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<Quotation>>(`/api/v1/quotations/${id}`),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuotationDto) =>
      api.post<ApiResponse<Quotation>>("/api/v1/quotations", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateQuotation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateQuotationDto) =>
      api.patch<ApiResponse<Quotation>>(`/api/v1/quotations/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/quotations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDuplicateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<ApiResponse<Quotation>>(`/api/v1/quotations/${id}/duplicate`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useGenerateQuotationPdf(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiResponse<{ pdfUrl: string }>>(`/api/v1/quotations/${id}/pdf`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}

export function useAcceptQuotation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AcceptQuotationDto) =>
      api.post<ApiResponse<Quotation>>(`/api/v1/quotations/${id}/accept`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}

export function useDeclineQuotation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiResponse<Quotation>>(`/api/v1/quotations/${id}/decline`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: KEYS.stats });
    },
  });
}
