'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex items-center justify-center',
        'rounded-xl border border-card-border bg-background',
        'text-muted transition-all duration-200',
        'hover:border-primary/30 hover:bg-primary/5 hover:text-primary',
        className,
      )}
    >
      <Sun
        className={cn(
          'absolute h-4.5 w-4.5 transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0',
        )}
      />
      <Moon
        className={cn(
          'h-4.5 w-4.5 transition-all duration-300',
          isDark ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
    </button>
  )
}
