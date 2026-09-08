import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RepPerformance } from '../../lib/analytics'
import { ChartTooltip } from './ChartTooltip'
import { formatCompactCurrency, formatCurrency } from '../../lib/format'

export function RepLeaderboard({ data }: { data: RepPerformance[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap={12}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="owner"
          width={104}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-ink-soft)', fontSize: 12.5 }}
        />
        <Tooltip
          cursor={{ fill: 'var(--chart-cursor)' }}
          content={<ChartTooltip formatter={(v) => formatCurrency(Number(v))} />}
        />
        <Bar dataKey="wonValue" name="Won value" fill="var(--color-series-blue)" radius={[0, 4, 4, 0]} maxBarSize={18}>
          <LabelList
            dataKey="wonValue"
            position="right"
            formatter={(v) => formatCompactCurrency(Number(v))}
            style={{ fill: 'var(--color-ink-soft)', fontSize: 11.5, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
