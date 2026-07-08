import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse, type PaginatedResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type {
  SupportCase,
  SupportCaseDetail,
  SupportCaseAttachment,
  CreateSupportCaseDto,
  UpdateCaseStatusDto,
  UpdateSupportCaseDto,
  ListSupportCasesQuery,
} from "@/types/api.types";

const KEYS = {
  all:    ["support-cases"] as const,
  list:   (q: ListSupportCasesQuery) => ["support-cases", "list", q] as const,
  detail: (id: string)               => ["support-cases", "detail", id] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────────

export function useSupportCases(query: ListSupportCasesQuery = {}) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => v !== undefined && params.set(k, String(v)));
      return api.get<PaginatedResponse<SupportCase>>(`/api/v1/support?${params}`);
    },
    staleTime: 30_000,
  });
}

export function useSupportCase(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => api.get<ApiResponse<SupportCaseDetail>>(`/api/v1/support/${id}`),
    enabled:  !!id,
    staleTime: 15_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCreateSupportCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupportCaseDto) =>
      api.post<ApiResponse<SupportCase>>("/api/v1/support", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateSupportCase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSupportCaseDto) =>
      api.patch<ApiResponse<SupportCase>>(`/api/v1/support/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteSupportCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<ApiResponse<null>>(`/api/v1/support/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateCaseStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCaseStatusDto) =>
      api.patch<ApiResponse<SupportCase>>(`/api/v1/support/${id}/status`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useAddCaseComment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      api.post<ApiResponse<unknown>>(`/api/v1/support/${id}/comments`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

// ── Attachments ────────────────────────────────────────────────────────────────
// Same signed-URL flow as avatar/logo uploads: backend (service role) mints a
// signed upload URL, the browser uploads directly to storage, then we confirm
// the row so the backend can log the "attachment_added" case history event.

const ATTACHMENTS_BUCKET = "support-attachments";

async function uploadCaseAttachment(caseId: string, file: File): Promise<SupportCaseAttachment> {
  const uploadUrlRes = await api.post<ApiResponse<{ signedUrl: string; token: string; path: string }>>(
    `/api/v1/support/${caseId}/attachments/upload-url`,
    { fileName: file.name, fileSize: file.size },
  );
  const { token, path } = uploadUrlRes.data;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(ATTACHMENTS_BUCKET)
    .uploadToSignedUrl(path, token, file, { contentType: file.type || "application/octet-stream", upsert: true });
  if (error) throw new Error(error.message);

  const confirmRes = await api.post<ApiResponse<SupportCaseAttachment>>(
    `/api/v1/support/${caseId}/attachments`,
    { fileName: file.name, filePath: path, fileSize: file.size },
  );
  return confirmRes.data;
}

export function useUploadCaseAttachment(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadCaseAttachment(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.detail(id) }),
  });
}
