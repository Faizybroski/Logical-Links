'use client'

import { useState, useEffect } from 'react'
import {
  Building2, Save, Calendar, Hash, Globe, MapPin,
  User, Mail, Phone, Receipt, Briefcase, Factory,
  Package, Truck, FileText, DollarSign, Award,
} from 'lucide-react'
import {
  useMyProfile, useUpdateMyCompanyLogo, useUpdateMyCompany,
  useMyAccountStats, useMyAccountActivity,
} from '@/hooks/use-accounts'
import { useTiers } from '@/hooks/use-tiers'
import { getTierProgress } from '@/lib/tiers'
import { KpiCard } from '@/components/deliveries/kpi-card'
import { TierDetailsSheet } from '@/components/deliveries/sheets/tier-details-sheet'
import { ActivityFeed } from '@/components/accounts/activity-feed'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { SecuritySection } from '@/components/company/SecuritySection'
import { uploadCompanyLogo, removeCompanyLogo } from '@/lib/upload-images'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'

function money(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })
}

const inputClass =
  "w-full rounded-xl border border-card-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"

type CompanyInfoForm = {
  accountName: string
  businessType: string
  industry: string
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
  const { data: accountRes, isLoading } = useMyProfile()
  const account = accountRes?.data

  const updateLogoMutation   = useUpdateMyCompanyLogo()
  const updateCompanyMutation = useUpdateMyCompany()

  const { data: statsRes }    = useMyAccountStats()
  const { data: activityRes, isLoading: activityLoading } = useMyAccountActivity()
  const { data: tiersRes }    = useTiers()
  const stats = statsRes?.data
  const activity = activityRes?.data ?? []
  const tiers = tiersRes?.data ?? []
  const tierProgress = tiers.length > 0 ? getTierProgress(stats?.deliveredShipments ?? 0, tiers) : null

  const [uploading, setUploading] = useState(false)
  const [tierSheetOpen, setTierSheetOpen] = useState(false)

  const [companyInfo, setCompanyInfo] = useState<CompanyInfoForm>({
    accountName: '', businessType: '', industry: '', abn: '', website: '',
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
      businessType:    account.business_type ?? '',
      industry:        account.industry ?? '',
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
    updateCompanyMutation.mutate({ ...companyInfo }, {
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
              <p className="text-xs text-muted">Customer ID: {account.customer_id}</p>
              <p className="text-xs text-muted flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Customer since {new Date(account.created_at).toLocaleDateString()}
              </p>
              {tierProgress && (
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-info/25 bg-info/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  <Award className="h-3 w-3" /> {tierProgress.current.name}
                </span>
              )}
            </div>
          </div>

          {/* Account overview — stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard title="Total Shipments"  value={stats?.totalShipments ?? 0}  icon={Package}    chartColor="#C89B3C" isLoading={!stats} subtitle="" />
            <KpiCard title="Active Shipments" value={stats?.activeShipments ?? 0} icon={Truck}      chartColor="#3B82F6" isLoading={!stats} subtitle="" />
            <KpiCard title="Open Quotes"      value={stats?.openQuotes ?? 0}      icon={FileText}   chartColor="#8B5CF6" isLoading={!stats} subtitle="" />
            <KpiCard title="Total Spend"      value={stats ? money(stats.totalSpend) : '—'} icon={DollarSign} chartColor="#22C55E" isLoading={!stats} subtitle="" />
          </div>

          {/* Partner Tier */}
          {tierProgress && (
            <div className="rounded-3xl border border-card-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Partner Tier</h2>
                <button
                  type="button"
                  onClick={() => setTierSheetOpen(true)}
                  className="text-sm font-medium text-primary hover:opacity-80"
                >
                  View Tier Details
                </button>
              </div>
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-semibold text-foreground">{tierProgress.current.name}</p>
                <p className="text-sm text-muted">
                  {(stats?.deliveredShipments ?? 0)}{tierProgress.next ? ` / ${tierProgress.next.min_deliveries}` : ''} shipments
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tierProgress.progressPct}%` }} />
              </div>
              <p className="text-xs text-muted">
                {tierProgress.next ? `Next tier: ${tierProgress.next.name}` : 'Highest tier reached'}
              </p>
            </div>
          )}

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Business Type</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={companyInfo.businessType}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, businessType: e.target.value })}
                    placeholder="e.g. Corporation"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Industry</label>
                <div className="relative">
                  <Factory className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={companyInfo.industry}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                    placeholder="e.g. Logistics"
                    className={inputClass}
                  />
                </div>
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

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" items={activity} isLoading={activityLoading} max={12} />

          {/* Section 4: Security */}
          <SecuritySection />

          <TierDetailsSheet
            open={tierSheetOpen}
            onClose={() => setTierSheetOpen(false)}
            delivered={stats?.deliveredShipments ?? 0}
            tiers={tiers}
          />
        </>
      ) : (
        <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
          No company found.
        </div>
      )}
    </div>
  )
}
