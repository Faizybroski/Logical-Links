import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { AdminRoleDef, AdminRoleValue, PermissionsMatrixResponse, RolePermissionGrant } from "@/types/api.types";

const KEYS = {
  matrix: ["admin-role-permissions"] as const,
  roles:  ["admin-roles"] as const,
};

export function useRolePermissionsMatrix(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.matrix,
    queryFn:  () => api.get<ApiResponse<PermissionsMatrixResponse>>("/api/v1/admin/roles/permissions"),
    enabled:  options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useUpdateRolePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ role, permissionKey, granted }: { role: AdminRoleValue; permissionKey: string; granted: boolean }) =>
      api.patch<ApiResponse<RolePermissionGrant>>(`/api/v1/admin/roles/${role}/${permissionKey}`, { granted }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.matrix }),
  });
}

// ── Role list + CRUD ───────────────────────────────────────────────────────────

export function useAdminRoles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KEYS.roles,
    queryFn:  () => api.get<ApiResponse<AdminRoleDef[]>>("/api/v1/admin/roles/roles"),
    enabled:  options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { slug: string; label: string }) =>
      api.post<ApiResponse<AdminRoleDef>>("/api/v1/admin/roles/roles", dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.roles });
      qc.invalidateQueries({ queryKey: KEYS.matrix });
    },
  });
}

export function useRenameAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ role, label }: { role: string; label: string }) =>
      api.patch<ApiResponse<AdminRoleDef>>(`/api/v1/admin/roles/roles/${role}`, { label }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.roles });
      qc.invalidateQueries({ queryKey: KEYS.matrix });
    },
  });
}

export function useDeleteAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: string) => api.delete<ApiResponse<null>>(`/api/v1/admin/roles/roles/${role}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.roles });
      qc.invalidateQueries({ queryKey: KEYS.matrix });
    },
  });
}
