import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  ShipperNote,
  CreateShipperNoteDto,
  UpdateShipperNoteDto,
} from "@/types/api.types";

const KEYS = {
  all: ["shipper-notes"] as const,
  list: (shipperId: string, page = 1) =>
    ["shipper-notes", "list", shipperId, page] as const,
};

export function useShipperNotes(shipperId: string, page = 1) {
  return useQuery({
    queryKey: KEYS.list(shipperId, page),
    queryFn: () =>
      api.get<PaginatedResponse<ShipperNote>>(
        `/api/v1/notes?entityType=account&entityId=${shipperId}&page=${page}&limit=50`,
      ),
    enabled: !!shipperId,
    staleTime: 30_000,
  });
}

export function useCreateShipperNote(shipperId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateShipperNoteDto) =>
      api.post<ApiResponse<ShipperNote>>("/api/v1/notes", {
        entityType: "account",
        entityId: shipperId,
        content: dto.content,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["shipper-notes", "list", shipperId] }),
  });
}

export function useUpdateShipperNote(shipperId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateShipperNoteDto }) =>
      api.patch<ApiResponse<ShipperNote>>(`/api/v1/notes/${id}`, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["shipper-notes", "list", shipperId] }),
  });
}

export function useDeleteShipperNote(shipperId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/notes/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["shipper-notes", "list", shipperId] }),
  });
}
