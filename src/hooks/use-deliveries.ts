import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  Delivery,
  CreateDeliveryDto,
  UpdateDeliveryDto,
  UpdateDeliveryStatusDto,
  AssignEmployeesDto,
  ListDeliveriesQuery,
} from "@/types/api.types";

const KEYS = {
  all:    ["deliveries"] as const,
  list:   (q: ListDeliveriesQuery) => ["deliveries", "list", q] as const,
  detail: (id: string) => ["deliveries", id] as const,
};

function buildQuery(params: ListDeliveriesQuery): string {
  const q = new URLSearchParams();
  if (params.page)          q.set("page",          String(params.page));
  if (params.limit)         q.set("limit",         String(params.limit));
  if (params.statuses)      q.set("statuses",      params.statuses);
  else if (params.status)   q.set("status",        params.status);
  if (params.deliveryType)  q.set("deliveryType",  params.deliveryType);
  if (params.accountId)     q.set("accountId",     params.accountId);
  if (params.customerId)    q.set("customerId",    params.customerId);
  if (params.search)        q.set("search",        params.search);
  if (params.dateFrom)      q.set("dateFrom",      params.dateFrom);
  if (params.dateTo)        q.set("dateTo",        params.dateTo);
  if (params.updatedFrom)   q.set("updatedFrom",   params.updatedFrom);
  if (params.updatedTo)     q.set("updatedTo",     params.updatedTo);
  if (params.sortBy)        q.set("sortBy",        params.sortBy);
  if (params.sortDir)       q.set("sortDir",       params.sortDir);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function useDeliveries(query: ListDeliveriesQuery = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () =>
      api.get<PaginatedResponse<Delivery>>(`/api/v1/deliveries${buildQuery(query)}`),
    enabled:  options?.enabled ?? true,
    staleTime: 30_000, // 30 seconds — deliveries change frequently
  });
}

export function useDelivery(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<Delivery>>(`/api/v1/deliveries/${id}`),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

export function useCreateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDeliveryDto) =>
      api.post<ApiResponse<Delivery>>("/api/v1/deliveries", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateDelivery(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateDeliveryDto) =>
      api.patch<ApiResponse<Delivery>>(`/api/v1/deliveries/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.delete<ApiResponse<null>>(`/api/v1/deliveries/${id}`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateDeliveryStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateDeliveryStatusDto) =>
      api.patch<ApiResponse<Delivery>>(`/api/v1/deliveries/${id}/status`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useAssignEmployees(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignEmployeesDto) =>
      api.post<ApiResponse<Delivery>>(`/api/v1/deliveries/${id}/assign-employees`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}
