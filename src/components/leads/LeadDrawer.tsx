import { useEffect, useState, type FormEvent } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useCrmStore } from '../../store/useCrmStore'
import { OWNERS, SOURCES, STAGES, type Lead, type Source, type Stage } from '../../types'
import { formatDate } from '../../lib/format'
import { LeadDocuments } from './LeadDocuments'

interface LeadDrawerProps {
  lead: Lead | null
  defaultStage?: Stage
  open: boolean
  onClose: () => void
}

interface FormState {
  name: string
  title: string
  company: string
  email: string
  phone: string
  source: Source
  stage: Stage
  value: string
  owner: string
  notes: string
  customFields: Record<string, string>
}

const EMPTY_FORM: FormState = {
  name: '',
  title: '',
  company: '',
  email: '',
  phone: '',
  source: 'Website',
  stage: 'New',
  value: '',
  owner: OWNERS[0],
  notes: '',
  customFields: {},
}

export function LeadDrawer({ lead, defaultStage, open, onClose }: LeadDrawerProps) {
  const addLead = useCrmStore((s) => s.addLead)
  const updateLead = useCrmStore((s) => s.updateLead)
  const deleteLead = useCrmStore((s) => s.deleteLead)
  const customProperties = useCrmStore((s) => s.customProperties)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        title: lead.title,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        stage: lead.stage,
        value: String(lead.value),
        owner: lead.owner,
        notes: lead.notes,
        customFields: Object.fromEntries(
          customProperties.map((prop) => [prop.id, String(lead.customFields[prop.id] ?? '')]),
        ),
      })
    } else {
      setForm({
        ...EMPTY_FORM,
        stage: defaultStage ?? 'New',
        customFields: Object.fromEntries(customProperties.map((prop) => [prop.id, ''])),
      })
    }
  }, [lead, defaultStage, open, customProperties])

  if (!open) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const customFields: Record<string, string | number | boolean> = {}
    for (const prop of customProperties) {
      const raw = form.customFields[prop.id]
      if (raw === undefined || raw === '') continue
      if (prop.type === 'number') customFields[prop.id] = Number(raw)
      else if (prop.type === 'boolean') customFields[prop.id] = raw === 'true'
      else customFields[prop.id] = raw
    }

    const payload = {
      name: form.name.trim(),
      title: form.title.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      source: form.source,
      stage: form.stage,
      value: Number(form.value) || 0,
      owner: form.owner,
      notes: form.notes,
      customFields,
    }
    if (!payload.name || !payload.company) return

    if (lead) {
      updateLead(lead.id, payload)
    } else {
      addLead(payload)
    }
    onClose()
  }

  function handleDelete() {
    if (lead) deleteLead(lead.id)
    onClose()
  }

  const inputClass =
    'w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-amber'
  const labelClass = 'mb-1.5 block text-xs font-medium text-ink-soft'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-hairline bg-surface"
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 className="font-display text-xl font-medium text-ink">
            {lead ? 'Edit lead' : 'New lead'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-ink-mute hover:bg-paper hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Contact name</label>
              <input
                required
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jordan Ruiz"
              />
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VP of Marketing"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Company</label>
            <input
              required
              className={inputClass}
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Northwind Labs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jordan@northwind.com"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(415) 555-0134"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Source</label>
              <select
                className={inputClass}
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value as Source })}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Stage</label>
              <select
                className={inputClass}
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Deal value (INR)</label>
              <input
                type="number"
                min={0}
                step={1}
                className={`${inputClass} tabular`}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="150000"
              />
            </div>
            <div>
              <label className={labelClass}>Owner</label>
              <select
                className={inputClass}
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              >
                {OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              className={`${inputClass} min-h-24 resize-none`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Context on this deal…"
            />
          </div>

          {customProperties.length > 0 && (
            <div className="space-y-4 border-t border-hairline pt-4">
              <div className="text-xs font-medium text-ink-soft">Custom properties</div>
              {customProperties.map((prop) => {
                const rawValue = form.customFields[prop.id] ?? ''
                const setValue = (v: string) =>
                  setForm({ ...form, customFields: { ...form.customFields, [prop.id]: v } })

                if (prop.type === 'boolean') {
                  return (
                    <label key={prop.id} className="flex items-center gap-2 text-sm text-ink-soft">
                      <input
                        type="checkbox"
                        checked={rawValue === 'true'}
                        onChange={(e) => setValue(e.target.checked ? 'true' : 'false')}
                      />
                      {prop.label}
                    </label>
                  )
                }

                return (
                  <div key={prop.id}>
                    <label className={labelClass}>{prop.label}</label>
                    {prop.type === 'select' ? (
                      <select className={inputClass} value={rawValue} onChange={(e) => setValue(e.target.value)}>
                        <option value="">—</option>
                        {prop.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : prop.type === 'date' ? (
                      <input
                        type="date"
                        className={inputClass}
                        value={rawValue}
                        onChange={(e) => setValue(e.target.value)}
                      />
                    ) : prop.type === 'number' ? (
                      <input
                        type="number"
                        className={`${inputClass} tabular`}
                        value={rawValue}
                        onChange={(e) => setValue(e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        className={inputClass}
                        value={rawValue}
                        onChange={(e) => setValue(e.target.value)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {lead && <LeadDocuments leadId={lead.id} />}

          {lead && (
            <div className="rounded-md bg-paper px-3 py-2 text-xs text-ink-mute">
              Created {formatDate(lead.createdAt)} · Last activity {formatDate(lead.lastActivity)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-hairline px-6 py-4">
          {lead ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-critical hover:bg-critical-tint"
            >
              <Trash2 size={15} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink-soft hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber-strong"
            >
              {lead ? 'Save changes' : 'Add lead'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
