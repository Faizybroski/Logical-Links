'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface CompanyLogoProps {
  name:    string | null | undefined
  logoUrl: string | null | undefined
  size?:   LogoSize
  className?: string
  rounded?: 'lg' | 'xl' | '2xl' | 'full'
}

const SIZE_CLASSES: Record<LogoSize, string> = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-16 w-16 text-lg',
}

const SIZE_PX: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 36,
  lg: 40,
  xl: 64,
}

const ROUNDED_CLASSES: Record<NonNullable<CompanyLogoProps['rounded']>, string> = {
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

function getCompanyInitials(name: string | null | undefined): string {
  if (!name) return '??'
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function CompanyLogo({
  name,
  logoUrl,
  size = 'md',
  className,
  rounded = '2xl',
}: CompanyLogoProps) {
  const sizeClass   = SIZE_CLASSES[size]
  const px          = SIZE_PX[size]
  const roundClass  = ROUNDED_CLASSES[rounded]
  const initials    = getCompanyInitials(name)

  if (logoUrl) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-muted',
          sizeClass,
          roundClass,
          className,
        )}
      >
        <Image
          src={logoUrl}
          alt={name ?? 'Company'}
          fill
          sizes={`${px}px`}
          className="object-contain p-0.5"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        'bg-violet-600 font-bold text-white',
        sizeClass,
        roundClass,
        className,
      )}
    >
      {initials}
    </div>
  )
}
