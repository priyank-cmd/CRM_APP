import { OPEN_STAGES, OWNERS, SOURCES, STAGES, type Lead } from '../types'

export interface Kpis {
  openValue: number
  openCount: number
  winRate: number
  avgDealSize: number
  wonThisMonth: number
}

export function computeKpis(leads: Lead[]): Kpis {
  const open = leads.filter((l) => OPEN_STAGES.includes(l.stage))
  const closed = leads.filter((l) => l.stage === 'Won' || l.stage === 'Lost')
  const won = leads.filter((l) => l.stage === 'Won')

  const openValue = open.reduce((sum, l) => sum + l.value, 0)
  const winRate = closed.length ? won.length / closed.length : 0
  const avgDealSize = won.length ? won.reduce((sum, l) => sum + l.value, 0) / won.length : 0

  const now = new Date()
  const wonThisMonth = won.filter((l) => {
    const d = new Date(`${l.lastActivity}T00:00:00`)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return {
    openValue,
    openCount: open.length,
    winRate,
    avgDealSize,
    wonThisMonth,
  }
}

export interface FunnelStep {
  stage: string
  count: number
  value: number
}

export function computeFunnel(leads: Lead[]): FunnelStep[] {
  const pipelineStages = STAGES.filter((s) => s !== 'Lost')
  return pipelineStages.map((stage) => {
    const atOrPast =
      stage === 'Won'
        ? leads.filter((l) => l.stage === 'Won')
        : leads.filter((l) => l.stage !== 'Lost' && STAGES.indexOf(l.stage) >= STAGES.indexOf(stage))
    return {
      stage,
      count: atOrPast.length,
      value: atOrPast.reduce((sum, l) => sum + l.value, 0),
    }
  })
}

export interface SourceBreakdown {
  source: string
  count: number
  value: number
}

export function computeSourceBreakdown(leads: Lead[]): SourceBreakdown[] {
  return SOURCES.map((source) => {
    const matching = leads.filter((l) => l.source === source)
    return {
      source,
      count: matching.length,
      value: matching.reduce((sum, l) => sum + l.value, 0),
    }
  }).sort((a, b) => b.count - a.count)
}

export interface MonthPoint {
  month: string
  label: string
  count: number
}

export function computeMonthlyTrend(leads: Lead[], months = 6): MonthPoint[] {
  const points: MonthPoint[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    const count = leads.filter((l) => l.createdAt.startsWith(key)).length
    points.push({ month: key, label, count })
  }

  return points
}

export interface StatusSplit {
  won: number
  open: number
  lost: number
}

export function computeStatusSplit(leads: Lead[]): StatusSplit {
  return {
    won: leads.filter((l) => l.stage === 'Won').length,
    open: leads.filter((l) => OPEN_STAGES.includes(l.stage)).length,
    lost: leads.filter((l) => l.stage === 'Lost').length,
  }
}

export interface RepPerformance {
  owner: string
  wonValue: number
  wonCount: number
}

export function computeRepLeaderboard(leads: Lead[]): RepPerformance[] {
  return OWNERS.map((owner) => {
    const won = leads.filter((l) => l.owner === owner && l.stage === 'Won')
    return {
      owner,
      wonValue: won.reduce((sum, l) => sum + l.value, 0),
      wonCount: won.length,
    }
  }).sort((a, b) => b.wonValue - a.wonValue)
}
