'use client'

import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications, useMarkNotificationsRead, useMarkAllNotificationsRead, type NotificationCategory } from '@/hooks/use-notifications'
import { formatDate } from '@/lib/utils/format-date'
import { cn } from '@/lib/utils/cn'

type Tab = 'all' | 'unread' | NotificationCategory

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',        label: 'All Alerts' },
  { id: 'unread',     label: 'Unread' },
  { id: 'deliveries', label: 'Deliveries' },
  { id: 'invoices',   label: 'Invoices' },
  { id: 'quotes',     label: 'Quotes' },
  { id: 'account',    label: 'Account' },
]

export function NotificationsView() {
  const [tab, setTab] = useState<Tab>('all')
  const [page, setPage] = useState(1)

  const unreadOnly = tab === 'unread'
  const category = tab === 'all' || tab === 'unread' ? undefined : tab

  const { data, isLoading } = useNotifications({ page, limit: 20, unreadOnly, category })
  const markRead    = useMarkNotificationsRead()
  const markAllRead = useMarkAllNotificationsRead()

  const notifications = data?.data ?? []
  const meta          = data?.meta
  const unreadCount   = meta?.unreadCount ?? 0

  function handleMarkRead(id: string) {
    markRead.mutate([id])
  }

  function handleTabChange(next: Tab) {
    setTab(next)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alerts</h1>
          <p className="mt-1 text-sm text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-2 rounded-xl border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabChange(t.id)}
            className={cn(
              "rounded-xl border px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-card-border bg-card text-muted hover:bg-primary/5 hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted">No alerts yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-card-border">
            {notifications.map((n) => (
              <li
                key={n.notification_id}
                className={cn(
                  "flex items-start gap-4 px-5 py-4 transition-colors",
                  !n.is_read && "bg-primary/5",
                )}
              >
                <div className="mt-1 shrink-0">
                  {n.is_read ? (
                    <div className="h-2 w-2 rounded-full bg-transparent" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", n.is_read ? "text-muted" : "text-foreground")}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                  )}
                  <p className="mt-1 text-[11px] text-zinc-400">{formatDate(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.notification_id)}
                    disabled={markRead.isPending}
                    className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted">
            Page {page} of {meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="rounded-xl border border-card-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
