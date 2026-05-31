'use client'

import Link from 'next/link'
import { ArrowUpRight, Package, Truck, Users, CheckCircle2, Clock3, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useShipments } from '@/hooks/use-shipments'
import {
  useDashboardStats,
  trendToSparkline,
  periodGrowth,
} from '@/hooks/use-dashboard'
import { StatusBadge } from '@/components/loads/status-badge'
import { KpiCard } from '@/components/loads/kpi-card'

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: statsRes, isLoading: statsLoading } = useDashboardStats()
  const { data: recentRes, isLoading: recentLoading } = useShipments({ limit: 5 })

  const stats   = statsRes?.data
  const recent  = recentRes?.data ?? []

  const byStatus        = stats?.byStatus
  const totalLoads      = stats?.total           ?? 0
  const activeLoads     = stats?.activeLoads     ?? 0
  const totalShippers   = stats?.totalShippers   ?? 0
  const pendingApprovals = stats?.pendingApprovals ?? 0
  const trend           = stats?.trend           ?? []
  const sparkline       = trendToSparkline(trend)
  const growth          = periodGrowth(stats?.total ?? 0, stats?.prevPeriodTotal ?? 0)

  const inTransit = (byStatus?.in_transit ?? 0) + (byStatus?.picked_up ?? 0) + (byStatus?.out_for_delivery ?? 0)
  const delivered = byStatus?.delivered ?? 0
  const pending   = byStatus?.pending   ?? 0

  const kpis = [
    {
      title:      'Total Loads',
      value:      totalLoads,
      icon:       Package,
      chartColor: '#C89B3C',
      data:       sparkline,
      growth:     growth.pct,
      trend:      growth.direction,
      subtitle:   'vs last 30 days',
    },
    {
      title:      'Active Loads',
      value:      activeLoads,
      icon:       Truck,
      chartColor: '#3B82F6',
    },
    {
      title:      'Delivered',
      value:      delivered,
      icon:       CheckCircle2,
      chartColor: '#10B981',
    },
    {
      title:      'Shippers',
      value:      totalShippers,
      icon:       Users,
      chartColor: '#8B5CF6',
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 lg:p-5">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Welcome back, {user?.fullName ?? 'Admin'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Logistics overview &amp; shipment performance.
            </p>
          </div>
          <div className="rounded-2xl border border-card-border bg-card px-4 py-2.5">
            <p className="text-xs text-muted">
              {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              chartColor={kpi.chartColor}
              isLoading={statsLoading}
              data={kpi.data}
              growth={kpi.growth}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
            />
          ))}
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {!statsLoading && pending > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-warning/20 bg-warning/5 px-5 py-3">
              <Clock3 className="h-5 w-5 shrink-0 text-yellow-600" />
              <p className="text-sm text-yellow-700">
                <strong>{pending}</strong> shipment{pending !== 1 ? 's' : ''} awaiting action.{' '}
                <Link href="/admin/loads" className="underline font-medium">
                  Review now
                </Link>
              </p>
            </div>
          )}
          {!statsLoading && pendingApprovals > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-orange-600" />
              <p className="text-sm text-orange-700">
                <strong>{pendingApprovals}</strong> shipper{pendingApprovals !== 1 ? 's' : ''} pending approval.{' '}
                <Link href="/admin/shippers" className="underline font-medium">
                  Review now
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Recent Shipments */}
        <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Shipments</h3>
              <p className="mt-0.5 text-xs text-muted">Latest freight activity across all accounts</p>
            </div>
            <Link
              href="/admin/loads"
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
                  {['Load #', 'Shipper', 'Origin', 'Destination', 'Status', 'Est. Delivery'].map((h) => (
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
                    <td colSpan={6} className="py-10 text-center text-sm text-muted">
                      Loading...
                    </td>
                  </tr>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-muted">
                      No shipments yet.
                    </td>
                  </tr>
                ) : (
                  recent.map((s) => (
                    <tr key={s.shipment_id} className="border-t border-card-border transition-colors hover:bg-primary/5">
                      <td className="px-5 py-4 text-sm font-semibold text-primary">
                        {s.load_number}
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">
                        {s.accounts?.account_name ?? '—'}
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

      </div>
    </div>
  )
}
