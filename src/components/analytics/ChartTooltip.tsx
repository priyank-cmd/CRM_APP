interface TooltipPayloadItem {
  name?: string
  value?: number | string
  color?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  label?: string
  payload?: TooltipPayloadItem[]
  formatter?: (value: number | string, name?: string) => string
}

export function ChartTooltip({ active, label, payload, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-md border border-hairline bg-surface px-3 py-2 text-xs shadow-sm">
      {label && <div className="mb-1 font-medium text-ink">{label}</div>}
      <div className="space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.color && (
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            )}
            {item.name && <span className="text-ink-soft">{item.name}</span>}
            <span className="tabular ml-auto font-medium text-ink">
              {formatter && item.value !== undefined ? formatter(item.value, item.name) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
