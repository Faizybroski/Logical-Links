'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import {
  ChevronDown,
  Menu,
  User,
  LogOut,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from '@/components/ui/user-avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationBell } from '@/components/notifications/NotificationBell'

import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

interface Props {
  onMenuToggle?: () => void
}

export default function ResidentialHeader({
  onMenuToggle,
}: Props) {
  const router = useRouter()
  const { user, refreshToken, clearAuth } = useAuthStore()

  async function handleSignOut() {
    try {
      await api.post('/api/v1/auth/logout', { refreshToken, allDevices: false })
    } catch {}
    clearAuth()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-17 items-center
        justify-between

        border-b border-card-border
        bg-card/95 px-4
        backdrop-blur-xl

        sm:px-5
      "
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Open Menu"
          className="
            flex h-10 w-10 items-center
            justify-center rounded-xl

            border border-card-border
            bg-background

            text-muted
            transition-all duration-200

            hover:border-primary/30
            hover:bg-primary/5
            hover:text-primary

            lg:hidden
          "
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title */}
        <div>
          <h1
            className="
              text-base font-semibold
              tracking-tight text-foreground
              sm:text-lg
            "
          >
            {user?.fullName ?? 'Dashboard'}
          </h1>

          <p className="hidden text-xs text-muted sm:block">
            Residential Customer
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2.5">

        {/* Notifications */}
        <NotificationBell basePath="/residential" size="compact" />

        {/* Theme Toggle */}
        <ThemeToggle className="h-10 w-10 rounded-xl" />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="
                flex items-center gap-2.5
                rounded-xl border
                border-card-border

                bg-background px-2.5 py-1.5

                transition-all duration-200

                hover:border-primary/30
                hover:bg-primary/5
              "
            >
              <UserAvatar
                name={user?.fullName}
                avatarUrl={user?.avatarUrl}
                size="md"
                rounded="xl"
              />

              {/* User */}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {user?.fullName ?? 'User'}
                </p>
                <p className="text-[11px] text-muted">
                  {user?.email ?? ''}
                </p>
              </div>

              <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="
              w-64 rounded-2xl
              border border-card-border
              bg-card p-2 shadow-lg
            "
          >
            {/* User Info */}
            <div
              className="
                mb-2 rounded-2xl
                bg-background p-3
                space-y-3
              "
            >
              {/* User row */}
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={user?.fullName}
                  avatarUrl={user?.avatarUrl}
                  size="lg"
                  rounded="xl"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.fullName ?? 'User'}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {user?.email ?? ''}
                  </p>
                  <span className="text-[10px] font-medium text-primary">
                    Residential Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <DropdownMenuItem asChild>
              <Link
                href="/residential/profile"
                className="
                  flex cursor-pointer
                  items-center gap-2
                  rounded-xl
                "
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onSelect={handleSignOut}
              className="
                flex cursor-pointer
                items-center gap-2
                rounded-xl

                text-danger
                focus:bg-danger/10
                focus:text-danger
              "
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
