import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthPoint } from '../../lib/analytics'
import { ChartTooltip } from './ChartTooltip'

export function TrendLineChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-hairline)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-ink-mute)', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-ink-mute)', fontSize: 12 }}
          width={32}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip formatter={(v) => `${v} new leads`} />} />
        <Area
          type="monotone"
          dataKey="count"
          name="New leads"
          stroke="var(--color-series-blue)"
          strokeWidth={2}
          fill="var(--color-series-blue)"
          fillOpacity={0.12}
          dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-series-blue)' }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
