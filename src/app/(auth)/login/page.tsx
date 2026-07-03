'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginSchema } from '@/lib/validations/auth'
import { api, type ApiResponse } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import type { AuthTokens } from '@/types/api.types'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const setAuth = useAuthStore((s) => s.setAuth)
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()

  // Redirect already-authenticated users straight to their dashboard.
  // Must wait for Zustand to hydrate from localStorage before deciding.
  useEffect(() => {
    if (!_hasHydrated) return
    if (isAuthenticated && user) {
      const dest = user.role === 'admin' ? '/admin/dashboard' : '/shipper/dashboard'
      router.replace(dest)
    }
  }, [isAuthenticated, user, _hasHydrated, router])

  const [form, setForm] = useState<LoginSchema>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginSchema, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginSchema, string>> = {}
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof LoginSchema
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const res = await api.post<ApiResponse<AuthTokens>>(
        '/api/v1/auth/login',
        { email: result.data.email, password: result.data.password },
      )

      const { accessToken, refreshToken, expiresIn, user } = res.data

      setAuth({ accessToken, refreshToken, expiresIn, user })

      if (user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/shipper/dashboard')
      }

      router.refresh()
    } catch (err) {
      setError((err as Error).message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute -left-30 -top-30 h-80 w-[320px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-30 -right-30 h-80 w-[320px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-4xl border border-card-border bg-card shadow-lg">
        <div className="h-1.5 w-full bg-linear-to-r from-primary-dark via-primary to-primary-light" />

        <div className="p-8 sm:p-10">
          <Link href="/" className="mb-8 flex justify-center">
            <img src="/logical-links-logo.png" alt="Logical Links" className="h-14 w-auto" />
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-muted">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="h-12 pl-12 pr-4"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-danger">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:opacity-80">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="h-12 pl-12 pr-12"
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  variant="ghost"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-danger">{errors.password}</p>}
            </div>

            {error && (
              <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-primary hover:opacity-80">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
