import { useState, type FormEvent } from 'react'
import { Trash2, X } from 'lucide-react'
import { useCrmStore } from '../../store/useCrmStore'
import type { PropertyType } from '../../types'

const TYPE_LABELS: Record<PropertyType, string> = {
  text: 'Text',
  number: 'Number',
  select: 'Dropdown',
  boolean: 'Yes / No',
  date: 'Date',
}

export function PropertiesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const customProperties = useCrmStore((s) => s.customProperties)
  const addProperty = useCrmStore((s) => s.addProperty)
  const deleteProperty = useCrmStore((s) => s.deleteProperty)

  const [label, setLabel] = useState('')
  const [type, setType] = useState<PropertyType>('text')
  const [optionsText, setOptionsText] = useState('')

  if (!open) return null

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) return
    const options =
      type === 'select'
        ? optionsText
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined
    addProperty({
      id: `prop-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      label: trimmed,
      type,
      options,
    })
    setLabel('')
    setType('text')
    setOptionsText('')
  }

  const inputClass =
    'w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-amber'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-hairline bg-surface">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-medium text-ink">Lead properties</h2>
            <p className="mt-0.5 text-xs text-ink-mute">
              Custom fields show up on every lead, and can be used to build segments.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-mute hover:bg-paper hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
          {customProperties.length === 0 && (
            <p className="text-sm text-ink-mute">No custom properties yet — add one below.</p>
          )}
          {customProperties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-center justify-between rounded-md border border-hairline px-3 py-2.5"
            >
              <div>
                <div className="text-sm font-medium text-ink">{prop.label}</div>
                <div className="text-xs text-ink-mute">
                  {TYPE_LABELS[prop.type]}
                  {prop.options ? ` · ${prop.options.join(', ')}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteProperty(prop.id)}
                className="rounded p-1.5 text-ink-mute hover:bg-critical-tint hover:text-critical"
                aria-label={`Delete ${prop.label}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="space-y-3 border-t border-hairline px-6 py-5">
          <div className="text-xs font-medium text-ink-soft">Add a property</div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputClass}
              placeholder="Property name"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
              {(Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          {type === 'select' && (
            <input
              className={inputClass}
              placeholder="Options, comma separated (e.g. Small, Medium, Large)"
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
            />
          )}
          <button
            type="submit"
            className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber-strong"
          >
            Add property
          </button>
        </form>
      </div>
    </div>
  )
}
