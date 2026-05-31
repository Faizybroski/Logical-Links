'use client'

import Link from 'next/link'
import { ArrowUpRight, Package, Truck, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useShipments } from '@/hooks/use-shipments'
import { useDashboardStats, periodGrowth, trendToSparkline } from '@/hooks/use-dashboard'
import { StatusBadge } from '@/components/loads/status-badge'
import { KpiCard } from '@/components/loads/kpi-card'

export default function ShipperDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: statsRes, isLoading: statsLoading } = useDashboardStats()
  const { data: recentRes, isLoading: recentLoading } = useShipments({
    accountId: user?.accountId ?? undefined,
    limit: 5,
  })

  const stats   = statsRes?.data
  const recent  = recentRes?.data ?? []

  const byStatus    = stats?.byStatus
  const totalLoads  = stats?.total      ?? 0
  const activeLoads = stats?.activeLoads ?? 0
  const delivered   = byStatus?.delivered ?? 0
  const cancelled   = byStatus?.cancelled ?? 0
  const trend       = stats?.trend ?? []
  const sparkline   = trendToSparkline(trend)
  const growth      = periodGrowth(stats?.total ?? 0, stats?.prevPeriodTotal ?? 0)

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
      title:      'Active',
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
      title:      'Pending',
      value:      byStatus?.pending ?? 0,
      icon:       Clock3,
      chartColor: '#F59E0B',
    },
  ]

  return (
    <div className="min-h-screen bg-background p-4 lg:p-5">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
              Welcome back, {user?.fullName ?? 'Shipper'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Your shipments at a glance.
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

        {/* Recent Shipments */}
        <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Recent Shipments</h3>
              <p className="mt-0.5 text-xs text-muted">Your latest freight activity</p>
            </div>
            <Link
              href="/shipper/loads"
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
                  {['Load #', 'Origin', 'Destination', 'Status', 'Est. Delivery'].map((h) => (
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
              You have <strong>{cancelled}</strong> cancelled shipment{cancelled !== 1 ? 's' : ''}.{' '}
              <Link href="/shipper/loads" className="underline">
                Review them
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
