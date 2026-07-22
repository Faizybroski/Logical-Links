import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";
import type { AdminRoleValue, PermissionsMatrixResponse, RolePermissionGrant } from "@/types/api.types";

const KEYS = {
  matrix: ["admin-role-permissions"] as const,
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
