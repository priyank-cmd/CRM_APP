import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthPoint } from '../../lib/analytics'
import { ChartTooltip } from './ChartTooltip'

export function TrendLineChart({ data }: { data: MonthPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#8b8f96', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#8b8f96', fontSize: 12 }}
          width={32}
          allowDecimals={false}
        />
        <Tooltip content={<ChartTooltip formatter={(v) => `${v} new leads`} />} />
        <Area
          type="monotone"
          dataKey="count"
          name="New leads"
          stroke="#2a78d6"
          strokeWidth={2}
          fill="#2a78d6"
          fillOpacity={0.08}
          dot={{ r: 3, strokeWidth: 0, fill: '#2a78d6' }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
