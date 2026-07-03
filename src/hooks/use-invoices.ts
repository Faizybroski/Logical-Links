import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  ListInvoicesQuery,
} from "@/types/api.types";

const KEYS = {
  all:    ["invoices"] as const,
  list:   (q: ListInvoicesQuery) => ["invoices", "list", q] as const,
  detail: (id: string)           => ["invoices", "detail", id] as const,
};

export function useInvoices(query: ListInvoicesQuery = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => {
      const params = new URLSearchParams()
      Object.entries(query).forEach(([k, v]) => v !== undefined && params.set(k, String(v)))
      return api.get<PaginatedResponse<Invoice>>(`/api/v1/invoices?${params}`)
    },
    staleTime: 30_000,
    enabled:   options?.enabled ?? true,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<Invoice>>(`/api/v1/invoices/${id}`),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) =>
      api.post<ApiResponse<Invoice>>("/api/v1/invoices", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateInvoiceDto) =>
      api.patch<ApiResponse<Invoice>>(`/api/v1/invoices/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDuplicateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<ApiResponse<Invoice>>(`/api/v1/invoices/${id}/duplicate`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useConvertQuotationToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quotationId: string) =>
      api.post<ApiResponse<Invoice>>(`/api/v1/invoices/from-quotation/${quotationId}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useGenerateInvoicePdf(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<ApiResponse<{ pdfUrl: string }>>(`/api/v1/invoices/${id}/pdf`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}
