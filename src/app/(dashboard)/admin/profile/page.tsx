'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Phone, Shield, Save } from 'lucide-react'
import { useMe, useUpdateMe } from '@/hooks/use-users'
import { useAuthStore } from '@/store/auth.store'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { uploadUserAvatar, removeUserAvatar } from '@/lib/upload-images'
import { toast } from 'sonner'

export default function AdminProfilePage() {
  const { data: res, isLoading } = useMe()
  const updateMe = useUpdateMe()
  const patchUser = useAuthStore((s) => s.patchUser)

  const profile = res?.data

  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [uploading, setUploading] = useState(false)

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
        onSuccess: (res) => {
          toast.success('Profile updated')
          if (res?.data?.fullName) patchUser({ fullName: res.data.fullName })
        },
        onError: () => toast.error('Failed to update profile'),
      },
    )
  }

  async function handleAvatarUpload(blob: Blob) {
    if (!profile) return
    setUploading(true)
    try {
      const url = await uploadUserAvatar(profile.id, blob)
      await updateMe.mutateAsync({ avatarUrl: url })
      patchUser({ avatarUrl: url })
      toast.success('Profile picture updated')
    } catch {
      toast.error('Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  async function handleAvatarRemove() {
    if (!profile) return
    setUploading(true)
    try {
      await removeUserAvatar(profile.id)
      await updateMe.mutateAsync({ avatarUrl: null })
      patchUser({ avatarUrl: null })
      toast.success('Profile picture removed')
    } catch {
      toast.error('Failed to remove profile picture')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your account information</p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
          Loading...
        </div>
      ) : (
        <>
          {/* Avatar + Identity */}
          <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-5">
            <AvatarUpload
              name={profile?.fullName}
              avatarUrl={profile?.avatarUrl}
              onUpload={handleAvatarUpload}
              onRemove={profile?.avatarUrl ? handleAvatarRemove : undefined}
              uploading={uploading}
              size="xl"
              label="Profile Picture"
            />

            <div className="flex items-center gap-3 border-t border-card-border pt-4">
              <div className="min-w-0">
                <p className="text-lg font-semibold text-foreground">{profile?.fullName ?? '—'}</p>
                <p className="text-sm text-muted">{profile?.email}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              </div>
            </div>
          </div>

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
