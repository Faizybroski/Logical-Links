'use client'

import { useState, useEffect } from 'react'
import {
  Building2, Users, Save, Calendar, Hash, Globe, MapPin,
  User, Mail, Phone, Receipt,
} from 'lucide-react'
import { useMyProfile, useUpdateMyCompanyLogo, useUpdateMyCompany } from '@/hooks/use-accounts'
import { useAuthStore } from '@/store/auth.store'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { SecuritySection } from '@/components/company/SecuritySection'
import { uploadCompanyLogo, removeCompanyLogo } from '@/lib/upload-images'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ApiError } from '@/lib/api'

const inputClass =
  "w-full rounded-xl border border-card-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"

type CompanyInfoForm = {
  accountName: string
  abn: string
  website: string
  addressLine1: string
  addressCity: string
  addressState: string
  addressPostcode: string
  addressCountry: string
}

type PrimaryContactForm = {
  contactName: string
  contactEmail: string
  contactPhone: string
}

type BillingContactForm = {
  billingEmail: string
  accountsPayableEmail: string
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

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

  const updateLogoMutation   = useUpdateMyCompanyLogo()
  const updateCompanyMutation = useUpdateMyCompany()

  const [uploading, setUploading] = useState(false)

  const [companyInfo, setCompanyInfo] = useState<CompanyInfoForm>({
    accountName: '', abn: '', website: '',
    addressLine1: '', addressCity: '', addressState: '', addressPostcode: '', addressCountry: '',
  })
  const [primaryContact, setPrimaryContact] = useState<PrimaryContactForm>({
    contactName: '', contactEmail: '', contactPhone: '',
  })
  const [billingContact, setBillingContact] = useState<BillingContactForm>({
    billingEmail: '', accountsPayableEmail: '',
  })

  useEffect(() => {
    if (!account) return
    setCompanyInfo({
      accountName:     account.account_name ?? '',
      abn:             account.abn ?? '',
      website:         account.website ?? '',
      addressLine1:    account.address_line1 ?? '',
      addressCity:     account.address_city ?? '',
      addressState:    account.address_state ?? '',
      addressPostcode: account.address_postcode ?? '',
      addressCountry:  account.address_country ?? '',
    })
    setPrimaryContact({
      contactName:  account.contact_name ?? '',
      contactEmail: account.contact_email ?? '',
      contactPhone: account.contact_phone ?? '',
    })
    setBillingContact({
      billingEmail:         account.billing_email ?? '',
      accountsPayableEmail: account.accounts_payable_email ?? '',
    })
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

  function handleSaveCompanyInfo(e: React.FormEvent) {
    e.preventDefault()
    if (!companyInfo.accountName.trim()) return
    updateCompanyMutation.mutate(companyInfo, {
      onSuccess: () => toast.success('Company information updated'),
      onError:   (err) => toast.error(errorMessage(err, 'Failed to update company information')),
    })
  }

  function handleSavePrimaryContact(e: React.FormEvent) {
    e.preventDefault()
    updateCompanyMutation.mutate(primaryContact, {
      onSuccess: () => toast.success('Primary contact updated'),
      onError:   (err) => toast.error(errorMessage(err, 'Failed to update primary contact')),
    })
  }

  function handleSaveBillingContact(e: React.FormEvent) {
    e.preventDefault()
    updateCompanyMutation.mutate(billingContact, {
      onSuccess: () => toast.success('Billing contact updated'),
      onError:   (err) => toast.error(errorMessage(err, 'Failed to update billing contact')),
    })
  }

  const members = account?.profiles ?? []
  const employees = members.filter((p) => p.company_role === 'employee')

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 lg:p-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Company Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your company settings and contacts</p>
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

          {/* Section 1: Company Information */}
          <form onSubmit={handleSaveCompanyInfo} className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground">Company Information</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={companyInfo.accountName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, accountName: e.target.value })}
                  placeholder="Company name"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Business Number</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={companyInfo.abn}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, abn: e.target.value })}
                  placeholder="ABN / business number"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="url"
                  value={companyInfo.website}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={companyInfo.addressLine1}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, addressLine1: e.target.value })}
                  placeholder="Street address"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input
                  type="text"
                  value={companyInfo.addressCity}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, addressCity: e.target.value })}
                  placeholder="City"
                  className="rounded-xl border border-card-border bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  value={companyInfo.addressState}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, addressState: e.target.value })}
                  placeholder="State"
                  className="rounded-xl border border-card-border bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  value={companyInfo.addressPostcode}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, addressPostcode: e.target.value })}
                  placeholder="Postcode"
                  className="rounded-xl border border-card-border bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  value={companyInfo.addressCountry}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, addressCountry: e.target.value })}
                  placeholder="Country"
                  className="rounded-xl border border-card-border bg-background py-2.5 px-3 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateCompanyMutation.isPending || !companyInfo.accountName.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateCompanyMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </form>

          {/* Section 2: Primary Contact */}
          <form onSubmit={handleSavePrimaryContact} className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground">Primary Contact</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={primaryContact.contactName}
                  onChange={(e) => setPrimaryContact({ ...primaryContact, contactName: e.target.value })}
                  placeholder="Contact name"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={primaryContact.contactEmail}
                  onChange={(e) => setPrimaryContact({ ...primaryContact, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="tel"
                  value={primaryContact.contactPhone}
                  onChange={(e) => setPrimaryContact({ ...primaryContact, contactPhone: e.target.value })}
                  placeholder="Phone number"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateCompanyMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateCompanyMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </form>

          {/* Section 3: Billing Contact */}
          <form onSubmit={handleSaveBillingContact} className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-foreground">Billing Contact</h2>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Billing Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={billingContact.billingEmail}
                  onChange={(e) => setBillingContact({ ...billingContact, billingEmail: e.target.value })}
                  placeholder="billing@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Accounts Payable Email</label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={billingContact.accountsPayableEmail}
                  onChange={(e) => setBillingContact({ ...billingContact, accountsPayableEmail: e.target.value })}
                  placeholder="accountspayable@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updateCompanyMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-sidebar transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateCompanyMutation.isPending ? 'Saving...' : 'Save'}
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

          {/* Section 4: Security */}
          <SecuritySection />
        </>
      ) : (
        <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
          No company found.
        </div>
      )}
    </div>
  )
}
