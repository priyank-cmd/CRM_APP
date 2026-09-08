import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useCrmStore } from '../../store/useCrmStore'
import type { Segment } from '../../types'

interface SegmentPillBarProps {
  activeSegmentId: string | null
  onSelect: (id: string | null) => void
  onCreate: () => void
  onEdit: (segment: Segment) => void
}

export function SegmentPillBar({ activeSegmentId, onSelect, onCreate, onEdit }: SegmentPillBarProps) {
  const segments = useCrmStore((s) => s.segments)
  const deleteSegment = useCrmStore((s) => s.deleteSegment)

  const pillClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? 'bg-amber text-white' : 'border border-hairline bg-surface text-ink-soft hover:border-hairline-strong'
    }`

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <button onClick={() => onSelect(null)} className={pillClass(activeSegmentId === null)}>
        All leads
      </button>
      {segments.map((segment) => (
        <div key={segment.id} className="flex items-center gap-1">
          <button onClick={() => onSelect(segment.id)} className={pillClass(activeSegmentId === segment.id)}>
            {segment.name}
          </button>
          {activeSegmentId === segment.id && (
            <>
              <button
                onClick={() => onEdit(segment)}
                className="rounded p-1 text-ink-mute hover:bg-paper hover:text-ink"
                aria-label={`Edit ${segment.name}`}
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => {
                  deleteSegment(segment.id)
                  onSelect(null)
                }}
                className="rounded p-1 text-ink-mute hover:bg-critical-tint hover:text-critical"
                aria-label={`Delete ${segment.name}`}
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      ))}
      <button
        onClick={onCreate}
        className="flex items-center gap-1 rounded-full border border-dashed border-hairline-strong px-3 py-1.5 text-xs text-ink-mute hover:border-amber hover:text-amber-strong"
      >
        <Plus size={12} /> New segment
      </button>
    </div>
  )
}
