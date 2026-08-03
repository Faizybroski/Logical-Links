'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useNotifications, useUnreadCount, useMarkNotificationsRead, useMarkAllNotificationsRead } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils/cn'

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const min = Math.floor(ms / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })
}

interface Props {
  basePath: '/admin' | '/shipper' | '/residential'
  /** Matches each header's existing bell sizing so the swap is visually seamless. */
  size?: 'default' | 'compact'
}

export function NotificationBell({ basePath, size = 'default' }: Props) {
  const [open, setOpen] = useState(false)

  const { data: unreadCount = 0 } = useUnreadCount()
  const { data, isLoading } = useNotifications({ limit: 8 }, { poll: open })
  const markRead = useMarkNotificationsRead()
  const markAllRead = useMarkAllNotificationsRead()

  const notifications = data?.data ?? []

  function handleItemClick(id: string, isRead: boolean) {
    if (isRead) return
    markRead.mutate([id], { onError: (err) => toast.error((err as Error).message) })
  }

  function handleMarkAllRead() {
    markAllRead.mutate(undefined, { onError: (err) => toast.error((err as Error).message) })
  }

  const btnSize   = size === 'compact' ? 'h-10 w-10 rounded-xl' : 'h-11 w-11 rounded-2xl'
  const iconSize  = size === 'compact' ? 'h-4.5 w-4.5' : 'h-5 w-5'
  const badgeSize = size === 'compact' ? 'h-4.5 min-w-4.5 text-[9px]' : 'h-5 min-w-5 text-[10px]'

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className={cn(
            'relative flex items-center justify-center border border-card-border bg-background text-muted transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary',
            btnSize,
          )}
        >
          <Bell className={iconSize} />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-primary px-1 font-bold text-sidebar',
                badgeSize,
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          avoidCollisions
          collisionPadding={12}
          className="z-[200] w-90 max-w-[92vw] overflow-hidden rounded-2xl border border-card-border bg-card shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Alerts</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <Bell className="h-6 w-6 text-muted-light" />
                <p className="text-sm text-muted">No alerts yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-card-border">
                {notifications.map((n) => (
                  <li key={n.notification_id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n.notification_id, n.is_read)}
                      className={cn(
                        'flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-primary/5',
                        !n.is_read && 'bg-primary/5',
                      )}
                    >
                      <div className="mt-1.5 shrink-0">
                        <div className={cn('h-2 w-2 rounded-full', n.is_read ? 'bg-transparent' : 'bg-primary')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('truncate text-sm font-medium', n.is_read ? 'text-muted' : 'text-foreground')}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>
                        )}
                        <p className="mt-1 text-[11px] text-zinc-400">{timeAgo(n.created_at)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-card-border p-2">
            <Link
              href={`${basePath}/notifications`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
            >
              View all alerts
            </Link>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
