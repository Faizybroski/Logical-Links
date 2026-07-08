'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Lock, ShieldCheck, ShieldOff, Monitor, Save, Loader2, Smartphone, X,
} from 'lucide-react'
import {
  useChangePassword,
  useMfaStatus, useMfaEnroll, useMfaVerify, useMfaDisable,
  useSessions, useRevokeSession,
} from '@/hooks/use-security'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/lib/utils/format-date'
import { ApiError } from '@/lib/api'

const inputClass =
  "w-full rounded-xl border border-card-border bg-background py-2.5 px-4 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

// ── Password ──────────────────────────────────────────────────────────────────

function PasswordCard() {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const changePassword = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    changePassword.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          toast.success('Password changed. Please log in again.')
          clearAuth()
          router.push('/login')
        },
        onError: (err) => toast.error(errorMessage(err, 'Failed to change password')),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-muted" />
        <h3 className="text-sm font-semibold text-foreground">Password</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-muted">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className={inputClass}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {changePassword.isPending ? 'Saving...' : 'Change Password'}
      </button>
    </form>
  )
}

// ── MFA ───────────────────────────────────────────────────────────────────────

function MfaCard() {
  const { data, isLoading } = useMfaStatus()
  const enroll  = useMfaEnroll()
  const verify  = useMfaVerify()
  const disable = useMfaDisable()

  const enabled = data?.data?.enabled ?? false

  const [enrollment, setEnrollment] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null)
  const [verifyCode, setVerifyCode] = useState('')

  const [disabling, setDisabling]         = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode]         = useState('')

  function startEnroll() {
    enroll.mutate(undefined, {
      onSuccess: (res) => setEnrollment({ secret: res.data.secret, qrCodeDataUrl: res.data.qrCodeDataUrl }),
      onError:   (err) => toast.error(errorMessage(err, 'Failed to start MFA enrollment')),
    })
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    verify.mutate(verifyCode, {
      onSuccess: () => {
        toast.success('Two-factor authentication enabled')
        setEnrollment(null)
        setVerifyCode('')
      },
      onError: (err) => toast.error(errorMessage(err, 'Invalid code')),
    })
  }

  function handleDisable(e: React.FormEvent) {
    e.preventDefault()
    disable.mutate(
      { password: disablePassword, code: disableCode },
      {
        onSuccess: () => {
          toast.success('Two-factor authentication disabled')
          setDisabling(false)
          setDisablePassword('')
          setDisableCode('')
        },
        onError: (err) => toast.error(errorMessage(err, 'Failed to disable MFA')),
      },
    )
  }

  return (
    <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted" />
          <h3 className="text-sm font-semibold text-foreground">Multi-Factor Authentication</h3>
        </div>
        {!isLoading && (
          <span className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium " +
            (enabled ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-muted")
          }>
            {enabled ? <ShieldCheck className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        )}
      </div>

      <p className="text-sm text-muted">
        Require a 6-digit code from an authenticator app in addition to your password when signing in.
      </p>

      {!enabled && !enrollment && (
        <button
          type="button"
          onClick={startEnroll}
          disabled={enroll.isPending}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enroll.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Enable Two-Factor Authentication
        </button>
      )}

      {enrollment && (
        <form onSubmit={handleVerify} className="space-y-4 rounded-2xl border border-card-border bg-background p-4">
          <p className="text-sm text-foreground">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.):
          </p>
          <img src={enrollment.qrCodeDataUrl} alt="MFA QR code" className="h-40 w-40 rounded-xl border border-card-border" />
          <div className="space-y-1">
            <p className="text-xs text-muted">Or enter this key manually:</p>
            <code className="block break-all rounded-lg bg-card px-3 py-2 text-xs text-foreground">{enrollment.secret}</code>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Enter the 6-digit code to confirm</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className={inputClass + " text-center tracking-[0.5em]"}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={verify.isPending || verifyCode.length !== 6}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {verify.isPending ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button
              type="button"
              onClick={() => { setEnrollment(null); setVerifyCode('') }}
              className="rounded-xl border border-card-border px-5 py-2.5 text-sm font-medium text-muted hover:bg-primary/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {enabled && !disabling && (
        <button
          type="button"
          onClick={() => setDisabling(true)}
          className="flex items-center gap-2 rounded-xl border border-danger/30 px-5 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/5"
        >
          <ShieldOff className="h-4 w-4" />
          Disable Two-Factor Authentication
        </button>
      )}

      {enabled && disabling && (
        <form onSubmit={handleDisable} className="space-y-4 rounded-2xl border border-card-border bg-background p-4">
          <p className="text-sm text-foreground">Confirm your password and current code to disable MFA.</p>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Password</label>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">6-digit code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className={inputClass + " text-center tracking-[0.5em]"}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={disable.isPending || !disablePassword || disableCode.length !== 6}
              className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {disable.isPending ? 'Disabling...' : 'Confirm Disable'}
            </button>
            <button
              type="button"
              onClick={() => { setDisabling(false); setDisablePassword(''); setDisableCode('') }}
              className="rounded-xl border border-card-border px-5 py-2.5 text-sm font-medium text-muted hover:bg-primary/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Sessions ──────────────────────────────────────────────────────────────────

function SessionsCard() {
  const { data, isLoading } = useSessions()
  const revoke = useRevokeSession()

  const sessions = data?.data ?? []

  return (
    <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Monitor className="h-4 w-4 text-muted" />
        <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted">No active sessions.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.tokenId}
              className="flex items-center gap-3 rounded-xl border border-card-border bg-background px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {s.userAgent ?? 'Unknown device'}
                </p>
                <p className="text-xs text-muted">
                  {s.ipAddress ?? 'Unknown IP'} · Last active {s.lastUsedAt ? formatDate(s.lastUsedAt) : formatDate(s.createdAt)}
                </p>
              </div>
              {s.isCurrent ? (
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  This device
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => revoke.mutate(s.tokenId, {
                    onSuccess: () => toast.success('Session revoked'),
                    onError:   (err) => toast.error(errorMessage(err, 'Failed to revoke session')),
                  })}
                  disabled={revoke.isPending}
                  className="shrink-0 flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SecuritySection() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Security</h2>
      <PasswordCard />
      <MfaCard />
      <SessionsCard />
    </div>
  )
}
