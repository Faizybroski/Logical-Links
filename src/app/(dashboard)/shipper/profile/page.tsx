'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Building2, CheckCircle2, Clock, Save } from 'lucide-react'
import { useMe, useUpdateMe } from '@/hooks/use-users'
import { useMyProfile } from '@/hooks/use-accounts'
import { toast } from 'sonner'

export default function ShipperProfilePage() {
  const { data: res, isLoading } = useMe()
  const updateMe = useUpdateMe()

  const profile = res?.data

  const { data: accountRes } = useMyProfile()
  const account = accountRes?.data

  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '')
      setPhone(profile.phone ?? '')
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateMe.mutate(
      { fullName: fullName || undefined, phone: phone || undefined },
      {
        onSuccess: () => toast.success('Profile updated'),
        onError:   () => toast.error('Failed to update profile'),
      },
    )
  }

  const initials = (profile?.fullName ?? 'SH').slice(0, 2).toUpperCase()
  const approved = profile?.isApproved ?? false

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your account information</p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
          Loading...
        </div>
      ) : (
        <>
          {/* Avatar + Identity */}
          <div className="flex items-center gap-5 rounded-3xl border border-card-border bg-card p-6 shadow-sm">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-sidebar">
              {initials}
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-lg font-semibold text-foreground">{profile?.fullName ?? '—'}</p>
              <p className="text-sm text-muted">{profile?.email}</p>
              {approved ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Account Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                  <Clock className="h-3 w-3" />
                  Pending Approval
                </span>
              )}
            </div>
          </div>

          {/* Company Info */}
          {account && (
            <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted" />
                <h2 className="text-base font-semibold text-foreground">Company</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted">Company Name</p>
                  <p className="text-sm font-medium text-foreground">{account.account_name}</p>
                </div>
                {account.abn && (
                  <div>
                    <p className="text-xs text-muted">ABN</p>
                    <p className="text-sm font-medium text-foreground">{account.abn}</p>
                  </div>
                )}
                {account.contact_email && (
                  <div>
                    <p className="text-xs text-muted">Contact Email</p>
                    <p className="text-sm font-medium text-foreground">{account.contact_email}</p>
                  </div>
                )}
                {account.contact_phone && (
                  <div>
                    <p className="text-xs text-muted">Contact Phone</p>
                    <p className="text-sm font-medium text-foreground">{account.contact_phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSave} className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-foreground">Edit Profile</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-card-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  value={profile?.email ?? ''}
                  disabled
                  className="w-full rounded-xl border border-card-border bg-background py-2.5 pl-9 pr-4 text-sm text-muted opacity-60 focus:outline-none"
                />
              </div>
              <p className="text-xs text-muted">Email cannot be changed.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="phone">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-card-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateMe.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateMe.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
