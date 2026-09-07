import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FunnelStep } from '../../lib/analytics'
import { ChartTooltip } from './ChartTooltip'
import { formatCompactCurrency } from '../../lib/format'

// Ordinal sequential ramp (blue, light -> dark), steps 250-500 from the
// validated palette — the lightest step still clears 2:1 against the surface.
const RAMP = ['#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf']

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
          tick={{ fill: '#565c66', fontSize: 12.5 }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(11,11,11,0.03)' }}
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
            style={{ fill: '#8b8f96', fontSize: 11 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
