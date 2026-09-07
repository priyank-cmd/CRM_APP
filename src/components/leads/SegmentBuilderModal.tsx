import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useCrmStore } from '../../store/useCrmStore'
import { getAllFields, getOperator, newRuleId, OPERATORS_BY_TYPE, ruleIsValid, type FieldDef } from '../../lib/segments'
import type { Segment, SegmentRule } from '../../types'

interface SegmentBuilderModalProps {
  open: boolean
  onClose: () => void
  editing: Segment | null
}

function defaultRule(field: FieldDef | undefined): SegmentRule {
  const type = field?.type ?? 'text'
  return {
    id: newRuleId(),
    field: field?.key ?? '',
    operator: OPERATORS_BY_TYPE[type][0].value,
    value: '',
    value2: '',
  }
}

export function SegmentBuilderModal({ open, onClose, editing }: SegmentBuilderModalProps) {
  const customProperties = useCrmStore((s) => s.customProperties)
  const addSegment = useCrmStore((s) => s.addSegment)
  const updateSegment = useCrmStore((s) => s.updateSegment)
  const fields = useMemo(() => getAllFields(customProperties), [customProperties])

  const [name, setName] = useState('')
  const [rules, setRules] = useState<SegmentRule[]>([])
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) return
    setFormError('')
    if (editing) {
      setName(editing.name)
      setRules(editing.rules)
    } else {
      setName('')
      setRules([defaultRule(fields[0])])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, open])

  if (!open) return null

  function fieldFor(key: string): FieldDef | undefined {
    return fields.find((f) => f.key === key)
  }

  function updateRule(id: string, patch: Partial<SegmentRule>) {
    setFormError('')
    setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function handleFieldChange(id: string, fieldKey: string) {
    const field = fieldFor(fieldKey)
    const type = field?.type ?? 'text'
    updateRule(id, { field: fieldKey, operator: OPERATORS_BY_TYPE[type][0].value, value: '', value2: '' })
  }

  function handleOperatorChange(id: string, operator: string) {
    updateRule(id, { operator, value: '', value2: '' })
  }

  function addRule() {
    setFormError('')
    setRules((rs) => [...rs, defaultRule(fields[0])])
  }

  function removeRule(id: string) {
    setFormError('')
    setRules((rs) => rs.filter((r) => r.id !== id))
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setFormError('Give this segment a name.')
      return
    }
    if (rules.length === 0) {
      setFormError('Add at least one rule.')
      return
    }
    if (rules.some((r) => !ruleIsValid(r, fields))) {
      setFormError('Finish each rule — pick a value, or remove the rule — before saving.')
      return
    }
    setFormError('')

    if (editing) {
      updateSegment(editing.id, { name: trimmed, rules })
    } else {
      addSegment({ id: `segment-${Date.now()}`, name: trimmed, rules })
    }
    onClose()
  }

  const inputClass =
    'rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus:border-amber'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" />
      <form
        onSubmit={handleSave}
        className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-hairline bg-surface"
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 className="font-display text-xl font-medium text-ink">
            {editing ? 'Edit segment' : 'New segment'}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-mute hover:bg-paper hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-soft">Segment name</label>
            <input
              autoFocus
              className={`${inputClass} w-full`}
              value={name}
              onChange={(e) => {
                setFormError('')
                setName(e.target.value)
              }}
              placeholder="e.g. Enterprise leads in negotiation"
            />
          </div>

          <div>
            <div className="mb-2 text-xs font-medium text-ink-soft">
              Match leads where all of the following are true
            </div>
            <div className="space-y-2">
              {rules.map((rule) => {
                const field = fieldFor(rule.field)
                const type = field?.type ?? 'text'
                const operators = OPERATORS_BY_TYPE[type]
                const opDef = getOperator(type, rule.operator)
                const selected = rule.value.split(',').filter(Boolean)

                return (
                  <div key={rule.id} className="rounded-md bg-paper p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className={inputClass}
                        value={rule.field}
                        onChange={(e) => handleFieldChange(rule.id, e.target.value)}
                      >
                        {fields.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className={inputClass}
                        value={rule.operator}
                        onChange={(e) => handleOperatorChange(rule.id, e.target.value)}
                      >
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => removeRule(rule.id)}
                        className="ml-auto rounded p-1 text-ink-mute hover:bg-critical-tint hover:text-critical"
                        aria-label="Remove rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {opDef?.needsValue && (
                      <div className="mt-2">
                        {type === 'select' && opDef.multi ? (
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-md border border-hairline bg-surface px-3 py-2">
                            {field?.options?.map((o) => {
                              const checked = selected.includes(o)
                              return (
                                <label key={o} className="flex items-center gap-1.5 text-xs text-ink-soft">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const next = e.target.checked
                                        ? [...selected, o]
                                        : selected.filter((v) => v !== o)
                                      updateRule(rule.id, { value: next.join(',') })
                                    }}
                                  />
                                  {o}
                                </label>
                              )
                            })}
                          </div>
                        ) : type === 'boolean' ? (
                          <select
                            className={inputClass}
                            value={rule.value}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          >
                            <option value="">Choose…</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : opDef.range ? (
                          <div className="flex items-center gap-2">
                            <input
                              type={type === 'date' ? 'date' : 'number'}
                              className={`${inputClass} tabular w-32`}
                              value={rule.value}
                              onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                            />
                            <span className="text-xs text-ink-mute">and</span>
                            <input
                              type={type === 'date' ? 'date' : 'number'}
                              className={`${inputClass} tabular w-32`}
                              value={rule.value2 ?? ''}
                              onChange={(e) => updateRule(rule.id, { value2: e.target.value })}
                            />
                          </div>
                        ) : type === 'date' ? (
                          <input
                            type="date"
                            className={inputClass}
                            value={rule.value}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          />
                        ) : type === 'number' ? (
                          <input
                            type="number"
                            className={`${inputClass} tabular w-32`}
                            value={rule.value}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          />
                        ) : (
                          <input
                            type="text"
                            className={`${inputClass} w-full`}
                            value={rule.value}
                            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                            placeholder="Value"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={addRule}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-strong hover:text-amber"
            >
              <Plus size={13} /> Add rule
            </button>
          </div>

          {formError && (
            <div className="rounded-md bg-critical-tint px-3 py-2 text-xs text-critical">{formError}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-hairline px-6 py-4">
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
            {editing ? 'Save segment' : 'Create segment'}
          </button>
        </div>
      </form>
    </div>
  )
}
