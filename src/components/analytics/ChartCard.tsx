import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  className?: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, className = '', children }: ChartCardProps) {
  return (
    <div className={`rounded-lg border border-hairline bg-surface p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-mute">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
