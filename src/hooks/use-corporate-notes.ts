import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import type {
  CorporateNote,
  CreateCorporateNoteDto,
  UpdateCorporateNoteDto,
} from "@/types/api.types";

const KEYS = {
  all: ["corporate-notes"] as const,
  list: (corporateId: string, page = 1) =>
    ["corporate-notes", "list", corporateId, page] as const,
};

export function useCorporateNotes(corporateId: string, page = 1) {
  return useQuery({
    queryKey: KEYS.list(corporateId, page),
    queryFn: () =>
      api.get<PaginatedResponse<CorporateNote>>(
        `/api/v1/notes?entityType=account&entityId=${corporateId}&page=${page}&limit=50`,
      ),
    enabled: !!corporateId,
    staleTime: 30_000,
  });
}

export function useCreateCorporateNote(corporateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCorporateNoteDto) =>
      api.post<ApiResponse<CorporateNote>>("/api/v1/notes", {
        entityType: "account",
        entityId: corporateId,
        content: dto.content,
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["corporate-notes", "list", corporateId] }),
  });
}

export function useUpdateCorporateNote(corporateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCorporateNoteDto }) =>
      api.patch<ApiResponse<CorporateNote>>(`/api/v1/notes/${id}`, dto),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["corporate-notes", "list", corporateId] }),
  });
}

export function useDeleteCorporateNote(corporateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ApiResponse<null>>(`/api/v1/notes/${id}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["corporate-notes", "list", corporateId] }),
  });
}
