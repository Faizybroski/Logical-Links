'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function AuthRedirect() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (user.role === 'admin') router.push('/admin/dashboard')
    else if (user.role === 'shipper') router.push('/shipper/dashboard')
  }, [isAuthenticated, user, router])

  return null
}
