import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ApiResponse } from "@/lib/api";

export type Notification = {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type NotificationsResponse = {
  success: boolean;
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
};

const KEYS = {
  all:  ["notifications"] as const,
  list: (q: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    ["notifications", "list", q] as const,
};

export function useNotifications(
  query: { page?: number; limit?: number; unreadOnly?: boolean } = {},
) {
  const params = new URLSearchParams();
  if (query.page)       params.set("page", String(query.page));
  if (query.limit)      params.set("limit", String(query.limit));
  if (query.unreadOnly) params.set("unreadOnly", "true");
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => api.get<NotificationsResponse>(`/api/v1/notifications${qs}`),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: KEYS.list({ limit: 1 }),
    queryFn:  () => api.get<NotificationsResponse>("/api/v1/notifications?limit=1"),
    select:   (res) => res.meta?.unreadCount ?? 0,
    staleTime: 60_000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      api.patch<ApiResponse<null>>("/api/v1/notifications/read", { notificationIds: ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.patch<ApiResponse<null>>("/api/v1/notifications/read-all", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
