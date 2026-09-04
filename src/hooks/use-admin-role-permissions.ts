import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { AdminRoleDef, AdminRoleValue, PermissionScope, PermissionsMatrixResponse, RolePermissionGrant } from "@/types/api.types";

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
    mutationFn: ({ role, permissionKey, granted, scope }: { role: AdminRoleValue; permissionKey: string; granted: boolean; scope?: PermissionScope }) =>
      api.patch<ApiResponse<RolePermissionGrant>>(`/api/v1/admin/roles/${role}/${permissionKey}`, { granted, scope }),
    onSuccess: (res) => {
      const updated = res.data;
      // Patch the cached matrix with the server's authoritative row immediately —
      // don't rely solely on invalidate+refetch, which can lose a race with a
      // fast second render and leave the UI showing the pre-update value.
      qc.setQueryData<ApiResponse<PermissionsMatrixResponse>>(KEYS.matrix, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            matrix: old.data.matrix.map((row) =>
              row.admin_role === updated.admin_role && row.permission_key === updated.permission_key
                ? { ...row, granted: updated.granted, scope: updated.scope }
                : row,
            ),
          },
        };
      });
      qc.invalidateQueries({ queryKey: KEYS.matrix });
    },
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
