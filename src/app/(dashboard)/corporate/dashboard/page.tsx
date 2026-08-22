'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Package, Truck, CheckCircle2, Clock3, AlertTriangle, FileText, Send, DollarSign, AlertCircle, Award } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useDeliveries } from '@/hooks/use-deliveries'
import { useQuotations } from '@/hooks/use-quotations'
import { useInvoices } from '@/hooks/use-invoices'
import { useTiers } from '@/hooks/use-tiers'
import { useDashboardStats, periodGrowth, trendToSparkline } from '@/hooks/use-dashboard'
import { StatusBadge } from '@/components/deliveries/status-badge'
import { KpiCard } from '@/components/deliveries/kpi-card'
import { TierDetailsSheet } from '@/components/deliveries/sheets/tier-details-sheet'
import { getTierProgress } from '@/lib/tiers'

export default function CorporateDashboard() {
  const user = useAuthStore((s) => s.user)
  const [tierSheetOpen, setTierSheetOpen] = useState(false)

  const { data: statsRes, isLoading: statsLoading } = useDashboardStats()
  const { data: recentRes, isLoading: recentLoading } = useDeliveries({
    accountId: user?.accountId ?? undefined,
    limit: 5,
  })
  const { data: quotationsRes, isLoading: quotationsLoading } = useQuotations({ limit: 200 })
  const { data: invoicesRes,   isLoading: invoicesLoading   } = useInvoices({ limit: 200 })
  const { data: tiersRes,      isLoading: tiersLoading      } = useTiers()

  const stats   = statsRes?.data
  const recent  = recentRes?.data ?? []
  const quotations = quotationsRes?.data ?? []
  const invoices   = invoicesRes?.data   ?? []

  const byStatus    = stats?.byStatus
  const totalDeliveries  = stats?.total      ?? 0
  const activeDeliveries = stats?.activeDeliveries ?? 0
  const delivered   = byStatus?.delivered ?? 0
  const cancelled   = byStatus?.cancelled ?? 0
  const trend       = stats?.trend ?? []
  const sparkline   = trendToSparkline(trend)
  const growth      = periodGrowth(stats?.total ?? 0, stats?.prevPeriodTotal ?? 0)

  const qStats = {
    total:    quotations.length,
    draft:    quotations.filter((q) => q.status === 'draft').length,
    sent:     quotations.filter((q) => q.status === 'sent').length,
    accepted: quotations.filter((q) => q.status === 'accepted').length,
  }

  const iStats = {
    total:   invoices.length,
    draft:   invoices.filter((i) => i.status === 'draft').length,
    sent:    invoices.filter((i) => i.status === 'unpaid').length,
    paid:    invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
  }

  const kpis = [
    {
      title:      'Total Deliveries',
      value:      totalDeliveries,
      icon:       Package,
      chartColor: '#C89B3C',
      data:       sparkline,
      growth:     growth.pct,
      trend:      growth.direction,
      subtitle:   'vs last 30 days',
      isLoading:  statsLoading,
    },
    {
      title:      'Active',
      value:      activeDeliveries,
      icon:       Truck,
      chartColor: '#3B82F6',
      isLoading:  statsLoading,
    },
    {
      title:      'Delivered',
      value:      delivered,
      icon:       CheckCircle2,
      chartColor: '#10B981',
      isLoading:  statsLoading,
    },
    {
      title:      'Invoices Due',
      value:      iStats.sent + iStats.overdue,
      icon:       DollarSign,
      chartColor: '#F59E0B',
      valueColor: '#7B1E3A',
      isLoading:  invoicesLoading,
    },
  ]

  const tiers = tiersRes?.data ?? []
  const tierProgress = tiers.length > 0 ? getTierProgress(delivered, tiers) : null

  const tierKpi = {
    title:      tierProgress?.current.name ?? 'Partner Tier',
    value:      tierProgress?.current.name ?? '—',
    icon:       Award,
    chartColor: '#8B5CF6',
    subtitle:   tierProgress?.next
      ? `${tierProgress.deliveriesToNext} to ${tierProgress.next.name}`
      : tierProgress
        ? 'Highest tier reached'
        : '',
    progressPct: tierProgress?.progressPct,
    isLoading:  statsLoading || tiersLoading,
    onClick:    () => setTierSheetOpen(true),
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-2">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Welcome back, {user?.fullName ?? 'Company Admin'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Your deliveries at a glance.
            </p>
          </div>
        </div>

        {/* Delivery KPI cards */}
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-5">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              chartColor={kpi.chartColor}
              valueColor={kpi.valueColor}
              isLoading={kpi.isLoading}
              data={kpi.data}
              growth={kpi.growth}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
            />
          ))}

          <KpiCard
            title={tierKpi.title}
            value={tierKpi.value}
            icon={tierKpi.icon}
            chartColor={tierKpi.chartColor}
            isLoading={tierKpi.isLoading}
            subtitle={tierKpi.subtitle}
            progressPct={tierKpi.progressPct}
            onClick={tierKpi.onClick}
          />
        </div>

        <TierDetailsSheet
          open={tierSheetOpen}
          onClose={() => setTierSheetOpen(false)}
          delivered={delivered}
          tiers={tiers}
          isLoading={tiersLoading}
        />

        {/* Quotations summary */}
        <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Quotations</h3>
              <p className="mt-0.5 text-xs text-muted">All quotations for your company</p>
            </div>
            <Link
              href="/corporate/quotations"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 sm:p-5">
            <KpiCard title="Total"    value={qStats.total}    icon={FileText}     chartColor="#C89B3C" isLoading={quotationsLoading} subtitle="" />
            <KpiCard title="Draft"    value={qStats.draft}    icon={Clock3}       chartColor="#6B7280" isLoading={quotationsLoading} subtitle="" />
            <KpiCard title="Sent"     value={qStats.sent}     icon={Send}         chartColor="#3B82F6" isLoading={quotationsLoading} subtitle="" />
            <KpiCard title="Accepted" value={qStats.accepted} icon={CheckCircle2} chartColor="#22C55E" isLoading={quotationsLoading} subtitle="" />
          </div>
        </div>

        {/* Invoices summary */}
        <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Invoices</h3>
              <p className="mt-0.5 text-xs text-muted">All invoices for your company</p>
            </div>
            <Link
              href="/corporate/invoices"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-5 sm:p-5">
            <KpiCard title="Total"   value={iStats.total}   icon={FileText}     chartColor="#C89B3C" isLoading={invoicesLoading} subtitle="" />
            <KpiCard title="Draft"   value={iStats.draft}   icon={Clock3}       chartColor="#6B7280" isLoading={invoicesLoading} subtitle="" />
            <KpiCard title="Sent"    value={iStats.sent}    icon={Send}         chartColor="#3B82F6" isLoading={invoicesLoading} subtitle="" />
            <KpiCard title="Paid"    value={iStats.paid}    icon={DollarSign}   chartColor="#22C55E" isLoading={invoicesLoading} subtitle="" />
            <KpiCard title="Overdue" value={iStats.overdue} icon={AlertCircle}  chartColor="#EF4444" isLoading={invoicesLoading} subtitle="" />
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Deliveries</h3>
              <p className="mt-0.5 text-xs text-muted">Your latest freight activity</p>
            </div>
            <Link
              href="/corporate/deliveries"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  {['Delivery #', 'Origin', 'Destination', 'Status', 'Est. Delivery'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-sidebar"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-muted">
                      No deliveries yet.
                    </td>
                  </tr>
                ) : (
                  recent.map((s) => (
                    <tr key={s.shipment_id} className="border-t border-card-border transition-colors hover:bg-primary/5">
                      <td className="px-5 py-4 text-sm font-semibold text-primary">
                        {s.load_number}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {s.origin_city}, {s.origin_state}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {s.destination_city}, {s.destination_state}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">
                        {s.estimated_delivery_date
                          ? new Date(s.estimated_delivery_date).toLocaleDateString('en-AU', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cancelled alert */}
        {!statsLoading && cancelled > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 px-5 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
            <p className="text-sm text-danger">
              You have <strong>{cancelled}</strong> cancelled delivery{cancelled !== 1 ? 's' : ''}.{' '}
              <Link href="/corporate/deliveries" className="underline">
                Review them
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
