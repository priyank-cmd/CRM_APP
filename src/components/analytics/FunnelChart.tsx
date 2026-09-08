import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FunnelStep } from '../../lib/analytics'
import { ChartTooltip } from './ChartTooltip'
import { formatCompactCurrency } from '../../lib/format'

// Ordinal sequential ramp, one hue getting darker (light mode) or lighter
// (dark mode) as the funnel narrows — see the --chart-funnel-* pairs in
// index.css, each tuned to clear contrast against its own surface.
const RAMP = [
  'var(--chart-funnel-1)',
  'var(--chart-funnel-2)',
  'var(--chart-funnel-3)',
  'var(--chart-funnel-4)',
  'var(--chart-funnel-5)',
  'var(--chart-funnel-6)',
]

export function FunnelChart({ data }: { data: FunnelStep[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }} barCategoryGap={10}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={92}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-ink-soft)', fontSize: 12.5 }}
        />
        <Tooltip
          cursor={{ fill: 'var(--chart-cursor)' }}
          content={
            <ChartTooltip
              formatter={(v) => `${v} leads`}
            />
          }
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={26}>
          {data.map((entry, i) => (
            <Cell key={entry.stage} fill={RAMP[Math.min(i, RAMP.length - 1)]} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v) => formatCompactCurrency(Number(v))}
            style={{ fill: 'var(--color-ink-mute)', fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
