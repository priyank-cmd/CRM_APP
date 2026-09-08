import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SourceBreakdown } from '../../lib/analytics'
import { SOURCE_DOT } from '../../lib/stageStyles'
import { ChartTooltip } from './ChartTooltip'

export function SourceBarChart({ data }: { data: SourceBreakdown[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={10}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="source"
          width={100}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--color-ink-soft)', fontSize: 12.5 }}
        />
        <Tooltip cursor={{ fill: 'var(--chart-cursor)' }} content={<ChartTooltip formatter={(v) => `${v} leads`} />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((entry) => (
            <Cell key={entry.source} fill={SOURCE_DOT[entry.source]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
