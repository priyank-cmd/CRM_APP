import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: string
  hint?: string
  hero?: boolean
  accent?: ReactNode
}

export function StatTile({ label, value, hint, hero, accent }: StatTileProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-hairline bg-surface px-5 py-4">
      <div className="flex items-center justify-between text-[13px] text-ink-soft">
        <span>{label}</span>
        {accent}
      </div>
      <div
        className={`tabular mt-2 leading-none text-ink ${
          hero ? 'font-display text-4xl font-medium' : 'text-2xl font-semibold'
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1.5 text-xs text-ink-mute">{hint}</div>}
    </div>
  )
}
