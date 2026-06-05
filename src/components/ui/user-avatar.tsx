'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface UserAvatarProps {
  name:      string | null | undefined
  avatarUrl: string | null | undefined
  size?:     AvatarSize
  className?: string
  rounded?:  'lg' | 'xl' | '2xl' | 'full'
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-16 w-16 text-lg',
}

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 36,
  lg: 40,
  xl: 64,
}

const ROUNDED_CLASSES: Record<NonNullable<UserAvatarProps['rounded']>, string> = {
  lg:   'rounded-lg',
  xl:   'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className,
  rounded = '2xl',
}: UserAvatarProps) {
  const sizeClass   = SIZE_CLASSES[size]
  const px          = SIZE_PX[size]
  const roundClass  = ROUNDED_CLASSES[rounded]
  const initials    = getInitials(name)

  if (avatarUrl) {
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
          src={avatarUrl}
          alt={name ?? 'User'}
          fill
          sizes={`${px}px`}
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        'bg-primary font-bold text-sidebar',
        sizeClass,
        roundClass,
        className,
      )}
    >
      {initials}
    </div>
  )
}
