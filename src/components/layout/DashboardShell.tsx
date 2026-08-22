'use client'

import { useState, type CSSProperties } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import CorporateSidebar from '@/components/corporate/CorporateSidebar'
import ResidentialSidebar from '@/components/residential/ResidentialSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import CorporateHeader from '@/components/corporate/CorporateHeader'
import ResidentialHeader from '@/components/residential/ResidentialHeader'
import { Toaster } from '@/components/ui/sonner'
import { useAuthStore } from '@/store/auth.store'
import { useTheme } from '@/components/providers/theme-provider'
import { useAppearance } from '@/components/providers/appearance-provider'
import { getContentSwatchById } from '@/lib/utils/content-theme'

interface Props {
  children: React.ReactNode
}

export default function DashboardShell({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const { theme } = useTheme()
  const { contentSwatchId } = useAppearance()

  const isAdmin = user?.role === 'admin'
  const isResidential = user?.role === 'residential'
  const contentSwatch = getContentSwatchById(theme, contentSwatchId[theme])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      {isAdmin ? (
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : isResidential ? (
        <ResidentialSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : (
        <CorporateSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main Layout */}
      <div
        style={
          contentSwatch
            ? ({
                "--background":   contentSwatch.bg,
                "--card":          contentSwatch.card,
                "--card-border":   contentSwatch.cardBorder,
              } as CSSProperties)
            : undefined
        }
        className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background"
      >
        {isAdmin ? (
          <AdminHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
        ) : isResidential ? (
          <ResidentialHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
        ) : (
          <CorporateHeader onMenuToggle={() => setSidebarOpen((v) => !v)} />
        )}

        <main className="flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto w-full">{children}</div>
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 3000 }} />
    </div>
  )
}
