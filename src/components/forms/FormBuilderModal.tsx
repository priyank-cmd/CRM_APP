import { useEffect, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowUp, Trash2, X } from 'lucide-react'
import { useCrmStore } from '../../store/useCrmStore'
import {
  FORM_TYPES,
  OPEN_STAGES,
  OWNERS,
  SOURCES,
  STANDARD_FORM_FIELD_KEYS,
  type FormDef,
  type FormField,
  type FormType,
  type PropertyType,
  type Source,
  type Stage,
  type StandardFormFieldKey,
} from '../../types'
import { standardFieldMeta } from '../../lib/forms'

interface FormBuilderModalProps {
  open: boolean
  onClose: () => void
  editing: FormDef | null
}

function newFieldId() {
  return `field-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

const ADD_NEW_PROPERTY = '__new__'

export function FormBuilderModal({ open, onClose, editing }: FormBuilderModalProps) {
  const customProperties = useCrmStore((s) => s.customProperties)
  const addProperty = useCrmStore((s) => s.addProperty)
  const addForm = useCrmStore((s) => s.addForm)
  const updateForm = useCrmStore((s) => s.updateForm)

  const [name, setName] = useState('')
  const [type, setType] = useState<FormType>('Contact Us')
  const [description, setDescription] = useState('')
  const [defaultStage, setDefaultStage] = useState<Stage>('New')
  const [defaultSource, setDefaultSource] = useState<Source>('Website')
  const [defaultOwner, setDefaultOwner] = useState<string>(OWNERS[0])
  const [fields, setFields] = useState<FormField[]>([])
  const [addFieldChoice, setAddFieldChoice] = useState('')
  const [newPropLabel, setNewPropLabel] = useState('')
  const [newPropType, setNewPropType] = useState<PropertyType>('text')
  const [newPropOptions, setNewPropOptions] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) return
    setFormError('')
    setAddFieldChoice('')
    setNewPropLabel('')
    setNewPropType('text')
    setNewPropOptions('')
    if (editing) {
      setName(editing.name)
      setType(editing.type)
      setDescription(editing.description)
      setDefaultStage(editing.defaultStage)
      setDefaultSource(editing.defaultSource)
      setDefaultOwner(editing.defaultOwner)
      setFields(editing.fields)
    } else {
      setName('')
      setType('Contact Us')
      setDescription('')
      setDefaultStage('New')
      setDefaultSource('Website')
      setDefaultOwner(OWNERS[0])
      setFields([])
    }
  }, [editing, open])

  if (!open) return null

  const usedStandardKeys = new Set<StandardFormFieldKey>(
    fields.flatMap((f) => (f.source.kind === 'standard' ? [f.source.key] : [])),
  )
  const usedPropertyIds = new Set<string>(
    fields.flatMap((f) => (f.source.kind === 'custom' ? [f.source.propertyId] : [])),
  )
  const availableStandard = STANDARD_FORM_FIELD_KEYS.filter((k) => !usedStandardKeys.has(k))
  const availableProperties = customProperties.filter((p) => !usedPropertyIds.has(p.id))

  function addFieldFromChoice(choice: string) {
    if (!choice) return
    if (choice === ADD_NEW_PROPERTY) {
      setAddFieldChoice(choice)
      return
    }
    if (choice.startsWith('standard:')) {
      const key = choice.slice(9) as StandardFormFieldKey
      const meta = standardFieldMeta(key)
      setFields((fs) => [
        ...fs,
        { id: newFieldId(), source: { kind: 'standard', key }, label: meta.label, required: false },
      ])
    } else if (choice.startsWith('custom:')) {
      const propertyId = choice.slice(7)
      const prop = customProperties.find((p) => p.id === propertyId)
      if (!prop) return
      setFields((fs) => [
        ...fs,
        { id: newFieldId(), source: { kind: 'custom', propertyId }, label: prop.label, required: false },
      ])
    }
    setAddFieldChoice('')
  }

  function handleCreateProperty() {
    const label = newPropLabel.trim()
    if (!label) return
    const options =
      newPropType === 'select'
        ? newPropOptions
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean)
        : undefined
    const id = `prop-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    addProperty({ id, label, type: newPropType, options })
    setFields((fs) => [
      ...fs,
      { id: newFieldId(), source: { kind: 'custom', propertyId: id }, label, required: false },
    ])
    setAddFieldChoice('')
    setNewPropLabel('')
    setNewPropType('text')
    setNewPropOptions('')
  }

  function updateField(id: string, patch: Partial<FormField>) {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  function removeField(id: string) {
    setFields((fs) => fs.filter((f) => f.id !== id))
  }

  function moveField(id: string, dir: -1 | 1) {
    setFields((fs) => {
      const index = fs.findIndex((f) => f.id === id)
      const target = index + dir
      if (index === -1 || target < 0 || target >= fs.length) return fs
      const next = [...fs]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setFormError('Give this form a name.')
      return
    }
    setFormError('')
    const payload = {
      name: trimmed,
      type,
      description: description.trim(),
      fields,
      defaultStage,
      defaultSource,
      defaultOwner,
    }
    if (editing) {
      updateForm(editing.id, payload)
    } else {
      addForm({ id: `form-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), ...payload })
    }
    onClose()
  }

  const inputClass =
    'rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus:border-amber'
  const labelClass = 'mb-1.5 block text-xs font-medium text-ink-soft'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]" />
      <form
        onSubmit={handleSave}
        className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-hairline bg-surface"
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <h2 className="font-display text-xl font-medium text-ink">{editing ? 'Edit form' : 'New form'}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-ink-mute hover:bg-paper hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Form name</label>
              <input
                autoFocus
                className={`${inputClass} w-full`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Webinar – Oct 2026"
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select className={`${inputClass} w-full`} value={type} onChange={(e) => setType(e.target.value as FormType)}>
                {FORM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Description (shown on the form)</label>
            <textarea
              className={`${inputClass} min-h-16 w-full resize-none`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell visitors what this is for…"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>New leads start at</label>
              <select
                className={`${inputClass} w-full`}
                value={defaultStage}
                onChange={(e) => setDefaultStage(e.target.value as Stage)}
              >
                {OPEN_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tag source as</label>
              <select
                className={`${inputClass} w-full`}
                value={defaultSource}
                onChange={(e) => setDefaultSource(e.target.value as Source)}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Assign to</label>
              <select
                className={`${inputClass} w-full`}
                value={defaultOwner}
                onChange={(e) => setDefaultOwner(e.target.value)}
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
            <div className={labelClass}>Fields shown on the form</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-paper px-3 py-2 text-sm text-ink-soft">
                <span className="flex-1">Contact name</span>
                <span className="text-xs text-ink-mute">Always required</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-paper px-3 py-2 text-sm text-ink-soft">
                <span className="flex-1">Company</span>
                <span className="text-xs text-ink-mute">Always required</span>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 rounded-md bg-paper px-3 py-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                  />
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => moveField(field.id, -1)}
                    disabled={index === 0}
                    className="rounded p-1 text-ink-mute hover:bg-surface disabled:opacity-30"
                    aria-label="Move field up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(field.id, 1)}
                    disabled={index === fields.length - 1}
                    className="rounded p-1 text-ink-mute hover:bg-surface disabled:opacity-30"
                    aria-label="Move field down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeField(field.id)}
                    className="rounded p-1 text-ink-mute hover:bg-critical-tint hover:text-critical"
                    aria-label="Remove field"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <select
                className={`${inputClass} w-full`}
                value={addFieldChoice === ADD_NEW_PROPERTY ? ADD_NEW_PROPERTY : ''}
                onChange={(e) => addFieldFromChoice(e.target.value)}
              >
                <option value="">+ Add a field…</option>
                {availableStandard.length > 0 && (
                  <optgroup label="Standard fields">
                    {availableStandard.map((key) => (
                      <option key={key} value={`standard:${key}`}>
                        {standardFieldMeta(key).label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {availableProperties.length > 0 && (
                  <optgroup label="Custom properties">
                    {availableProperties.map((p) => (
                      <option key={p.id} value={`custom:${p.id}`}>
                        {p.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="New">
                  <option value={ADD_NEW_PROPERTY}>+ Create new property…</option>
                </optgroup>
              </select>

              {addFieldChoice === ADD_NEW_PROPERTY && (
                <div className="mt-2 space-y-2 rounded-md border border-dashed border-hairline-strong p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputClass}
                      placeholder="Property name"
                      value={newPropLabel}
                      onChange={(e) => setNewPropLabel(e.target.value)}
                    />
                    <select
                      className={inputClass}
                      value={newPropType}
                      onChange={(e) => setNewPropType(e.target.value as PropertyType)}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown</option>
                      <option value="boolean">Yes / No</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  {newPropType === 'select' && (
                    <input
                      className={`${inputClass} w-full`}
                      placeholder="Options, comma separated"
                      value={newPropOptions}
                      onChange={(e) => setNewPropOptions(e.target.value)}
                    />
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAddFieldChoice('')}
                      className="rounded-md px-3 py-1.5 text-xs text-ink-soft hover:bg-paper"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateProperty}
                      className="rounded-md bg-amber px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-strong"
                    >
                      Add field
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {formError && <p className="text-sm text-critical">{formError}</p>}
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
            {editing ? 'Save form' : 'Create form'}
          </button>
        </div>
      </form>
    </div>
  )
}
