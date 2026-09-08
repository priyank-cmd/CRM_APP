import { initials } from '../../lib/format'

const PALETTE = [
  'var(--color-series-blue)',
  'var(--color-series-orange)',
  'var(--color-series-aqua)',
  'var(--color-series-yellow)',
  'var(--color-series-magenta)',
  'var(--color-series-violet)',
]

function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{
        backgroundColor: colorFor(name),
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  )
}
