import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  TrackingEvent,
  CreateTrackingEventDto,
  UpdateTrackingEventDto,
  ListTrackingEventsQuery,
} from "@/types/api.types";

const KEYS = {
  all:       ["tracking"] as const,
  byLoad:    (loadId: string, q: ListTrackingEventsQuery) => ["tracking", "load", loadId, q] as const,
  detail:    (id: string)    => ["tracking", id] as const,
};

function buildQuery(params: ListTrackingEventsQuery): string {
  const q = new URLSearchParams();
  if (params.page)  q.set("page",  String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function useTrackingEvents(loadId: string, query: ListTrackingEventsQuery = {}) {
  return useQuery({
    queryKey: KEYS.byLoad(loadId, query),
    queryFn:  () =>
      api.get<PaginatedResponse<TrackingEvent>>(
        `/api/v1/tracking/loads/${loadId}/events${buildQuery(query)}`,
      ),
    enabled:   !!loadId,
    staleTime: 30_000,
  });
}

export function useTrackingEvent(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<TrackingEvent>>(`/api/v1/tracking/${id}`),
    enabled:  !!id,
    staleTime: 30_000,
  });
}

export function useCreateTrackingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTrackingEventDto) =>
      api.post<ApiResponse<TrackingEvent>>("/api/v1/tracking", dto),
    onSuccess: (_, dto) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      // Also invalidate the shipment detail so timeline refreshes
      qc.invalidateQueries({ queryKey: ["shipments", dto.loadId] });
    },
  });
}

export function useUpdateTrackingEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateTrackingEventDto) =>
      api.patch<ApiResponse<TrackingEvent>>(`/api/v1/tracking/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteTrackingEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/tracking/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
