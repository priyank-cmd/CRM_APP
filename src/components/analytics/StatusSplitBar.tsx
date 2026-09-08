import type { StatusSplit } from '../../lib/analytics'

const SEGMENTS: { key: keyof StatusSplit; label: string; color: string }[] = [
  { key: 'won', label: 'Won', color: 'var(--color-good)' },
  { key: 'open', label: 'Open', color: 'var(--color-hairline-strong)' },
  { key: 'lost', label: 'Lost', color: 'var(--color-critical)' },
]

export function StatusSplitBar({ data }: { data: StatusSplit }) {
  const total = data.won + data.open + data.lost || 1

  return (
    <div>
      <div className="flex h-8 w-full gap-[2px] overflow-hidden rounded-md">
        {SEGMENTS.map(({ key, label, color }) => {
          const value = data[key]
          if (value === 0) return null
          return (
            <div
              key={key}
              title={`${label}: ${value}`}
              style={{ backgroundColor: color, flexGrow: value / total }}
              className="h-full"
            />
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {SEGMENTS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-ink-soft">{label}</span>
            <span className="tabular font-medium text-ink">{data[key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
