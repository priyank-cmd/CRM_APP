import { useEffect, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { useCrmStore } from '../../store/useCrmStore'
import { parseCsvFile, type ParsedCsv } from '../../lib/csv'
import { OWNERS, SOURCES, STAGES, type Lead, type Source, type Stage } from '../../types'

interface ImportCsvModalProps {
  open: boolean
  onClose: () => void
}

const BLANK_LEAD = {
  name: '',
  title: '',
  company: '',
  email: '',
  phone: '',
  source: 'Website' as Source,
  stage: 'New' as Stage,
  value: 0,
  owner: OWNERS[0] as string,
  notes: '',
}

const STANDARD_TARGETS: { key: keyof typeof BLANK_LEAD; label: string }[] = [
  { key: 'name', label: 'Contact name' },
  { key: 'title', label: 'Title' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'source', label: 'Source' },
  { key: 'stage', label: 'Stage' },
  { key: 'value', label: 'Deal value' },
  { key: 'owner', label: 'Owner' },
  { key: 'notes', label: 'Notes' },
]

export function ImportCsvModal({ open, onClose }: ImportCsvModalProps) {
  const customProperties = useCrmStore((s) => s.customProperties)
  const addProperty = useCrmStore((s) => s.addProperty)
  const importLeads = useCrmStore((s) => s.importLeads)

  const [parsed, setParsed] = useState<ParsedCsv | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [importedCount, setImportedCount] = useState<number | null>(null)

  useEffect(() => {
    if (!open) {
      setParsed(null)
      setMapping({})
      setError('')
      setImportedCount(null)
    }
  }, [open])

  if (!open) return null

  async function handleFile(file: File) {
    setError('')
    try {
      const result = await parseCsvFile(file)
      if (result.rows.length === 0) {
        setError('No rows found in that file.')
        return
      }
      const guess: Record<string, string> = {}
      for (const header of result.headers) {
        const norm = header.trim().toLowerCase()
        const std = STANDARD_TARGETS.find((t) => t.key === norm || t.label.toLowerCase() === norm)
        if (std) {
          guess[header] = `standard:${std.key}`
          continue
        }
        const existingProp = customProperties.find((p) => p.label.toLowerCase() === norm)
        guess[header] = existingProp ? `custom:${existingProp.id}` : `new:${header}`
      }
      setParsed(result)
      setMapping(guess)
    } catch {
      setError('Could not read that file. Make sure it is a valid CSV.')
    }
  }

  function handleImport() {
    if (!parsed) return

    const propsToCreate: { header: string; label: string; id: string }[] = []
    const headerTargets: Record<string, string> = {}
    for (const header of parsed.headers) {
      const raw = mapping[header] ?? 'ignore'
      if (raw.startsWith('new:')) {
        const id = `prop-${Date.now()}-${Math.floor(Math.random() * 10000)}-${propsToCreate.length}`
        propsToCreate.push({ header, label: raw.slice(4), id })
        headerTargets[header] = `custom:${id}`
      } else {
        headerTargets[header] = raw
      }
    }
    propsToCreate.forEach((p) => addProperty({ id: p.id, label: p.label, type: 'text' }))

    const todayIso = new Date().toISOString().slice(0, 10)
    const newLeads: Omit<Lead, 'id'>[] = parsed.rows
      .map((row) => {
        const lead: Omit<Lead, 'id'> = {
          ...BLANK_LEAD,
          createdAt: todayIso,
          lastActivity: todayIso,
          customFields: {},
        }
        for (const [header, target] of Object.entries(headerTargets)) {
          const raw = (row[header] ?? '').trim()
          if (target === 'ignore' || !raw) continue
          if (target.startsWith('standard:')) {
            const key = target.slice(9)
            switch (key) {
              case 'name':
                lead.name = raw
                break
              case 'title':
                lead.title = raw
                break
              case 'company':
                lead.company = raw
                break
              case 'email':
                lead.email = raw
                break
              case 'phone':
                lead.phone = raw
                break
              case 'owner':
                lead.owner = raw
                break
              case 'notes':
                lead.notes = raw
                break
              case 'value':
                lead.value = Number(raw) || 0
                break
              case 'stage':
                lead.stage = (STAGES as readonly string[]).includes(raw) ? (raw as Stage) : 'New'
                break
              case 'source':
                lead.source = (SOURCES as readonly string[]).includes(raw) ? (raw as Source) : 'Website'
                break
            }
          } else if (target.startsWith('custom:')) {
            lead.customFields[target.slice(7)] = raw
          }
        }
        return lead
      })
      .filter((lead) => lead.name || lead.company)

    importLeads(newLeads)
    setImportedCount(newLeads.length)
  }

  const selectClass =
    'rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-amber'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-hairline bg-surface">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 className="font-display text-xl font-medium text-ink">Import leads from CSV</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-mute hover:bg-paper hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {importedCount !== null ? (
            <div className="rounded-md border border-hairline bg-good-tint px-4 py-6 text-center">
              <div className="text-sm font-medium text-ink">Imported {importedCount} leads</div>
              <p className="mt-1 text-xs text-ink-mute">They've been added to the top of your leads list.</p>
            </div>
          ) : !parsed ? (
            <div>
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
              <label
                htmlFor="csv-file-input"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-hairline-strong px-6 py-12 text-center text-sm text-ink-soft hover:border-amber hover:bg-amber-tint/20"
              >
                <Upload size={20} className="text-ink-mute" />
                Click to choose a CSV file
                <span className="text-xs text-ink-mute">
                  We'll auto-match columns to lead fields, and let you fix anything up next.
                </span>
              </label>
              {error && <p className="mt-3 text-sm text-critical">{error}</p>}
            </div>
          ) : (
            <div>
              <p className="mb-3 text-xs text-ink-mute">
                {parsed.rows.length} rows found. Choose where each column goes.
              </p>
              <div className="space-y-2">
                {parsed.headers.map((header) => (
                  <div
                    key={header}
                    className="flex items-center justify-between gap-3 rounded-md bg-paper px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">{header}</div>
                      <div className="truncate text-xs text-ink-mute">
                        e.g. {parsed.rows[0]?.[header] || '—'}
                      </div>
                    </div>
                    <select
                      className={selectClass}
                      value={mapping[header] ?? 'ignore'}
                      onChange={(e) => setMapping({ ...mapping, [header]: e.target.value })}
                    >
                      <option value="ignore">Don't import</option>
                      <optgroup label="Standard fields">
                        {STANDARD_TARGETS.map((t) => (
                          <option key={t.key} value={`standard:${t.key}`}>
                            {t.label}
                          </option>
                        ))}
                      </optgroup>
                      {customProperties.length > 0 && (
                        <optgroup label="Custom properties">
                          {customProperties.map((p) => (
                            <option key={p.id} value={`custom:${p.id}`}>
                              {p.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="New property">
                        <option value={`new:${header}`}>Create "{header}"</option>
                      </optgroup>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-hairline px-6 py-4">
          {importedCount !== null ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber-strong"
            >
              Done
            </button>
          ) : parsed ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-hairline px-4 py-2 text-sm text-ink-soft hover:bg-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber-strong"
              >
                Import {parsed.rows.length} leads
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink-soft hover:bg-paper"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
