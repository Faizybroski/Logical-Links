import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  Status,
  CreateStatusDto,
  UpdateStatusDto,
  ListStatusesQuery,
} from "@/types/api.types";

const KEYS = {
  all:    ["statuses"] as const,
  list:   (q: ListStatusesQuery) => ["statuses", "list", q] as const,
  all_active: ["statuses", "all-active"] as const,
  search: (q: string)             => ["statuses", "search", q] as const,
  detail: (id: string)            => ["statuses", id] as const,
};

function buildQuery(params: ListStatusesQuery): string {
  const q = new URLSearchParams();
  if (params.page)     q.set("page",     String(params.page));
  if (params.limit)    q.set("limit",    String(params.limit));
  if (params.search)   q.set("search",   params.search);
  if (params.type)     q.set("type",     params.type);
  if (params.isActive) q.set("isActive", params.isActive);
  if (params.sortBy)   q.set("sortBy",   params.sortBy);
  if (params.sortDir)  q.set("sortDir",  params.sortDir);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function useStatuses(query: ListStatusesQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () =>
      api.get<PaginatedResponse<Status>>(`/api/v1/statuses${buildQuery(query)}`),
    staleTime: 60_000,
  });
}

/** Returns all active statuses (system + custom) — used by the status combobox. */
export function useAllStatuses() {
  return useQuery({
    queryKey: KEYS.all_active,
    queryFn:  () => api.get<ApiResponse<Status[]>>("/api/v1/statuses/all"),
    staleTime: 30_000,
  });
}

export function useStatusSearch(search: string) {
  return useQuery({
    queryKey: KEYS.search(search),
    queryFn:  () =>
      api.get<ApiResponse<Status[]>>(
        `/api/v1/statuses/search?q=${encodeURIComponent(search)}`,
      ),
    enabled:   search.length >= 1,
    staleTime: 30_000,
  });
}

export function useStatus(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<Status>>(`/api/v1/statuses/${id}`),
    enabled:  !!id,
    staleTime: 60_000,
  });
}

export function useCreateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStatusDto) =>
      api.post<ApiResponse<Status>>("/api/v1/statuses", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateStatusDto) =>
      api.patch<ApiResponse<Status>>(`/api/v1/statuses/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/statuses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
