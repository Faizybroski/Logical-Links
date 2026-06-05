'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Building2, Users, Truck, FileText, FileQuestion,
  Save, Calendar, MapPin, Phone, Mail, Hash,
} from 'lucide-react'
import { useMyProfile, useUpdateMyCompanyLogo, useUpdateAccount } from '@/hooks/use-accounts'
import { useAuthStore } from '@/store/auth.store'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { CompanyLogo } from '@/components/ui/company-logo'
import { uploadCompanyLogo, removeCompanyLogo } from '@/lib/upload-images'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CompanyProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()

  // Redirect employees — only company admins can access this page
  if (user && user.companyRole !== 'company_admin') {
    router.replace('/shipper/dashboard')
    return null
  }

  const { data: accountRes, isLoading } = useMyProfile()
  const account = accountRes?.data

  const updateLogoMutation  = useUpdateMyCompanyLogo()
  const updateAccountMutation = useUpdateAccount(account?.account_id ?? '')

  const [uploading, setUploading] = useState(false)

  // Company name edit
  const [accountName, setAccountName] = useState('')
  useEffect(() => {
    if (account) setAccountName(account.account_name)
  }, [account])

  async function handleLogoUpload(blob: Blob) {
    if (!account) return
    setUploading(true)
    try {
      const url = await uploadCompanyLogo(account.account_id, blob)
      await updateLogoMutation.mutateAsync(url)
      toast.success('Company logo updated')
    } catch {
      toast.error('Failed to upload company logo')
    } finally {
      setUploading(false)
    }
  }

  async function handleLogoRemove() {
    if (!account) return
    setUploading(true)
    try {
      await removeCompanyLogo(account.account_id)
      await updateLogoMutation.mutateAsync(null)
      toast.success('Company logo removed')
    } catch {
      toast.error('Failed to remove company logo')
    } finally {
      setUploading(false)
    }
  }

  async function handleSaveCompanyName(e: React.FormEvent) {
    e.preventDefault()
    if (!accountName.trim()) return
    updateAccountMutation.mutate(
      { accountName: accountName.trim() },
      {
        onSuccess: () => toast.success('Company name updated'),
        onError:   () => toast.error('Failed to update company name'),
      },
    )
  }

  const members = account?.profiles ?? []
  const companyAdmin = members.find((p) => p.company_role === 'company_admin')
  const employees    = members.filter((p) => p.company_role === 'employee')

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Company Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your company branding and information</p>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
          Loading...
        </div>
      ) : account ? (
        <>
          {/* Company Logo + Identity */}
          <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-5">
            <AvatarUpload
              name={account.account_name}
              avatarUrl={account.logo_url}
              onUpload={handleLogoUpload}
              onRemove={account.logo_url ? handleLogoRemove : undefined}
              uploading={uploading}
              size="xl"
              label="Company Logo"
            />

            <div className="border-t border-card-border pt-4 space-y-1">
              <p className="text-lg font-semibold text-foreground">{account.account_name}</p>
              {account.abn && (
                <p className="text-xs text-muted flex items-center gap-1">
                  <Hash className="h-3 w-3" /> ABN: {account.abn}
                </p>
              )}
              <p className="text-xs text-muted flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Active since {new Date(account.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Employees', value: employees.length, icon: Users },
              { label: 'Members',   value: members.length,   icon: Building2 },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-card-border bg-card p-4 text-center shadow-sm"
              >
                <Icon className="mx-auto mb-1 h-4 w-4 text-muted" />
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Company details */}
          <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground">Company Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {account.contact_name && (
                <div>
                  <p className="text-xs text-muted flex items-center gap-1"><Users className="h-3 w-3" /> Contact Person</p>
                  <p className="text-sm font-medium text-foreground">{account.contact_name}</p>
                </div>
              )}
              {account.contact_email && (
                <div>
                  <p className="text-xs text-muted flex items-center gap-1"><Mail className="h-3 w-3" /> Contact Email</p>
                  <p className="text-sm font-medium text-foreground">{account.contact_email}</p>
                </div>
              )}
              {account.contact_phone && (
                <div>
                  <p className="text-xs text-muted flex items-center gap-1"><Phone className="h-3 w-3" /> Contact Phone</p>
                  <p className="text-sm font-medium text-foreground">{account.contact_phone}</p>
                </div>
              )}
              {(account.billing_city || account.billing_state) && (
                <div>
                  <p className="text-xs text-muted flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                  <p className="text-sm font-medium text-foreground">
                    {[account.billing_city, account.billing_state, account.billing_country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Edit company name */}
          <form
            onSubmit={handleSaveCompanyName}
            className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4"
          >
            <h2 className="text-base font-semibold text-foreground">Edit Company Name</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground" htmlFor="accountName">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="accountName"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Company name"
                  className="w-full rounded-xl border border-card-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateAccountMutation.isPending || !accountName.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateAccountMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </form>

          {/* Team members */}
          {members.length > 0 && (
            <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-base font-semibold text-foreground">Team</h2>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-card-border bg-background px-3 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-sidebar">
                      {(member.full_name ?? '??').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {member.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-muted">
                        {member.company_role === 'company_admin' ? 'Company Admin' : 'Employee'}
                      </p>
                    </div>
                    {!member.is_approved && (
                      <span className="text-[10px] font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
          No company found.
        </div>
      )}
    </div>
  )
}
