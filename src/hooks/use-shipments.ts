import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  Shipment,
  CreateShipmentDto,
  UpdateShipmentDto,
  UpdateShipmentStatusDto,
  AssignShipmentDto,
  AssignEmployeeDto,
  ListShipmentsQuery,
} from "@/types/api.types";

const KEYS = {
  all:    ["shipments"] as const,
  list:   (q: ListShipmentsQuery) => ["shipments", "list", q] as const,
  detail: (id: string) => ["shipments", id] as const,
};

function buildQuery(params: ListShipmentsQuery): string {
  const q = new URLSearchParams();
  if (params.page)          q.set("page",          String(params.page));
  if (params.limit)         q.set("limit",         String(params.limit));
  if (params.status)        q.set("status",        params.status);
  if (params.shipmentType)  q.set("shipmentType",  params.shipmentType);
  if (params.accountId)     q.set("accountId",     params.accountId);
  if (params.search)        q.set("search",        params.search);
  if (params.createdByRole) q.set("createdByRole", params.createdByRole);
  if (params.dateFrom)      q.set("dateFrom",      params.dateFrom);
  if (params.dateTo)        q.set("dateTo",        params.dateTo);
  if (params.updatedFrom)   q.set("updatedFrom",   params.updatedFrom);
  if (params.updatedTo)     q.set("updatedTo",     params.updatedTo);
  if (params.sortBy)        q.set("sortBy",        params.sortBy);
  if (params.sortDir)       q.set("sortDir",       params.sortDir);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function useShipments(query: ListShipmentsQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () =>
      api.get<PaginatedResponse<Shipment>>(`/api/v1/shipments${buildQuery(query)}`),
    staleTime: 30_000, // 30 seconds — shipments change frequently
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<Shipment>>(`/api/v1/shipments/${id}`),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateShipmentDto) =>
      api.post<ApiResponse<Shipment>>("/api/v1/shipments", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateShipment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateShipmentDto) =>
      api.patch<ApiResponse<Shipment>>(`/api/v1/shipments/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.delete<ApiResponse<null>>(`/api/v1/shipments/${id}`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateShipmentStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateShipmentStatusDto) =>
      api.patch<ApiResponse<Shipment>>(`/api/v1/shipments/${id}/status`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useAssignShipment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignShipmentDto) =>
      api.post<ApiResponse<Shipment>>(`/api/v1/shipments/${id}/assign`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useAssignEmployee(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: AssignEmployeeDto) =>
      api.post<ApiResponse<Shipment>>(`/api/v1/shipments/${id}/assign-employee`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}
