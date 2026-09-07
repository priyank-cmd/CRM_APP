import { useMemo } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { StatTile } from '../components/ui/StatTile'
import { ChartCard } from '../components/analytics/ChartCard'
import { FunnelChart } from '../components/analytics/FunnelChart'
import { SourceBarChart } from '../components/analytics/SourceBarChart'
import { TrendLineChart } from '../components/analytics/TrendLineChart'
import { StatusSplitBar } from '../components/analytics/StatusSplitBar'
import { RepLeaderboard } from '../components/analytics/RepLeaderboard'
import { useCrmStore } from '../store/useCrmStore'
import {
  computeFunnel,
  computeKpis,
  computeMonthlyTrend,
  computeRepLeaderboard,
  computeSourceBreakdown,
  computeStatusSplit,
} from '../lib/analytics'
import { formatCompactCurrency, formatCurrency } from '../lib/format'

export function AnalyticsPage() {
  const leads = useCrmStore((s) => s.leads)

  const kpis = useMemo(() => computeKpis(leads), [leads])
  const funnel = useMemo(() => computeFunnel(leads), [leads])
  const sources = useMemo(() => computeSourceBreakdown(leads), [leads])
  const trend = useMemo(() => computeMonthlyTrend(leads), [leads])
  const statusSplit = useMemo(() => computeStatusSplit(leads), [leads])
  const reps = useMemo(() => computeRepLeaderboard(leads), [leads])

  return (
    <AppShell title="Analytics" description="Pipeline health across the whole business">
      <div className="grid grid-cols-4 gap-4">
        <StatTile
          label="Open pipeline value"
          value={formatCompactCurrency(kpis.openValue)}
          hint={`${kpis.openCount} active leads`}
          hero
        />
        <StatTile label="Win rate" value={`${Math.round(kpis.winRate * 100)}%`} hint="of closed leads" />
        <StatTile label="Avg. deal size" value={formatCurrency(Math.round(kpis.avgDealSize))} hint="on won deals" />
        <StatTile label="Won this month" value={String(kpis.wonThisMonth)} hint="deals closed" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <ChartCard title="Pipeline funnel" subtitle="Leads reaching each stage" className="col-span-2">
          <FunnelChart data={funnel} />
        </ChartCard>
        <ChartCard title="Outcome split" subtitle="Won vs. open vs. lost">
          <StatusSplitBar data={statusSplit} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <ChartCard title="New leads by month" subtitle="Last 6 months">
          <TrendLineChart data={trend} />
        </ChartCard>
        <ChartCard title="Leads by source" subtitle="Where leads are coming from">
          <SourceBarChart data={sources} />
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <ChartCard title="Rep leaderboard" subtitle="Won value by owner">
          <RepLeaderboard data={reps} />
        </ChartCard>
      </div>
    </AppShell>
  )
}
