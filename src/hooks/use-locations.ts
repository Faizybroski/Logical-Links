import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  Location,
  CreateLocationDto,
  UpdateLocationDto,
  ListLocationsQuery,
} from "@/types/api.types";

const KEYS = {
  all:    ["locations"] as const,
  list:   (q: ListLocationsQuery) => ["locations", "list", q] as const,
  search: (q: string)             => ["locations", "search", q] as const,
  detail: (id: string)            => ["locations", id] as const,
};

function buildQuery(params: ListLocationsQuery): string {
  const q = new URLSearchParams();
  if (params.page)     q.set("page",     String(params.page));
  if (params.limit)    q.set("limit",    String(params.limit));
  if (params.search)   q.set("search",   params.search);
  if (params.province) q.set("province", params.province);
  if (params.sortBy)   q.set("sortBy",   params.sortBy);
  if (params.sortDir)  q.set("sortDir",  params.sortDir);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function useLocations(query: ListLocationsQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () =>
      api.get<PaginatedResponse<Location>>(`/api/v1/locations${buildQuery(query)}`),
    staleTime: 60_000,
  });
}

export function useLocationSearch(search: string) {
  return useQuery({
    queryKey: KEYS.search(search),
    queryFn:  () =>
      api.get<ApiResponse<Location[]>>(`/api/v1/locations/search?q=${encodeURIComponent(search)}`),
    enabled:  search.length >= 1,
    staleTime: 30_000,
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<Location>>(`/api/v1/locations/${id}`),
    enabled:  !!id,
    staleTime: 60_000,
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateLocationDto) =>
      api.post<ApiResponse<Location>>("/api/v1/locations", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateLocation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateLocationDto) =>
      api.patch<ApiResponse<Location>>(`/api/v1/locations/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
