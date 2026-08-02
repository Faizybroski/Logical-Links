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
  severity: "info" | "warning" | "critical" | null;
  category: NotificationCategory | null;
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

export type NotificationCategory = "deliveries" | "invoices" | "quotes" | "support" | "account" | "team" | "operations";

const KEYS = {
  all:  ["notifications"] as const,
  list: (q: { page?: number; limit?: number; unreadOnly?: boolean; category?: NotificationCategory }) =>
    ["notifications", "list", q] as const,
};

// Polling interval for near-realtime alerts. Supabase Realtime's
// postgres_changes RLS filtering needs auth.uid(), which is always NULL here
// (this app uses its own JWT, not a Supabase Auth session in the browser) —
// so short-interval polling is the reliable option, and the only one that
// also works once the backend is deployed as Vercel serverless functions
// (no long-lived SSE/WebSocket connections there).
const REALTIME_POLL_MS = 15_000;

export function useNotifications(
  query: { page?: number; limit?: number; unreadOnly?: boolean; category?: NotificationCategory } = {},
  options: { poll?: boolean } = {},
) {
  const params = new URLSearchParams();
  if (query.page)       params.set("page", String(query.page));
  if (query.limit)      params.set("limit", String(query.limit));
  if (query.unreadOnly) params.set("unreadOnly", "true");
  if (query.category)   params.set("category", query.category);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: KEYS.list(query),
    queryFn:  () => api.get<NotificationsResponse>(`/api/v1/notifications${qs}`),
    refetchInterval: options.poll ? REALTIME_POLL_MS : undefined,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: KEYS.list({ limit: 1 }),
    queryFn:  () => api.get<NotificationsResponse>("/api/v1/notifications?limit=1"),
    select:   (res) => res.meta?.unreadCount ?? 0,
    staleTime: 10_000,
    refetchInterval: REALTIME_POLL_MS,
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

export type CreateAlertDto = {
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  category: NotificationCategory;
  target: "account" | "all";
  accountId?: string;
};

export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateAlertDto) =>
      api.post<ApiResponse<{ sent: number }>>("/api/v1/notifications/alerts", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
