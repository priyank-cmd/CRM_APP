import { useState, type FormEvent, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCrmStore } from '../store/useCrmStore'
import { buildLeadFromSubmission, customPropertyForField, getMissingRequiredFields, standardFieldMeta } from '../lib/forms'
import type { FormField } from '../types'

export function FormFillPage() {
  const { formId } = useParams<{ formId: string }>()
  const forms = useCrmStore((s) => s.forms)
  const customProperties = useCrmStore((s) => s.customProperties)
  const addLead = useCrmStore((s) => s.addLead)

  const form = forms.find((f) => f.id === formId)

  const [values, setValues] = useState<Record<string, string>>({})
  const [missingIds, setMissingIds] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const inputClass =
    'w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-amber'
  const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

  function setValue(id: string, v: string) {
    setValues((vs) => ({ ...vs, [id]: v }))
    setMissingIds((ids) => {
      if (!ids.has(id)) return ids
      const next = new Set(ids)
      next.delete(id)
      return next
    })
  }

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-sm rounded-lg border border-hairline bg-surface p-8 text-center">
          <h1 className="font-display text-xl text-ink">Form not found</h1>
          <p className="mt-2 text-sm text-ink-mute">
            This form may have been removed, or the link is incorrect.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-sm rounded-lg border border-hairline bg-surface p-8 text-center">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-good" />
          <h1 className="font-display text-xl text-ink">Thanks — you're in.</h1>
          <p className="mt-2 text-sm text-ink-mute">We've got your details and someone will be in touch shortly.</p>
        </div>
      </div>
    )
  }

  const lockedFields: { id: string; label: string }[] = [
    { id: '__name', label: 'Full name' },
    { id: '__company', label: 'Company' },
  ]

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    const allRequired: FormField[] = [
      { id: '__name', source: { kind: 'standard', key: 'title' }, label: 'Full name', required: true },
      { id: '__company', source: { kind: 'standard', key: 'title' }, label: 'Company', required: true },
      ...form.fields,
    ]
    const missing = getMissingRequiredFields(allRequired, values)
    if (missing.length > 0) {
      setMissingIds(new Set(missing.map((f) => f.id)))
      return
    }

    const payload = buildLeadFromSubmission(form, values, customProperties)
    addLead(payload)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <div className="font-display text-lg font-medium text-ink">Leadspot</div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-hairline bg-surface p-7">
          <h1 className="font-display text-2xl font-medium text-ink">{form.name}</h1>
          {form.description && <p className="mt-2 text-sm text-ink-mute">{form.description}</p>}

          <div className="mt-6 space-y-4">
            {lockedFields.map((f) => (
              <div key={f.id}>
                <label className={labelClass}>
                  {f.label} <span className="text-critical">*</span>
                </label>
                <input
                  className={`${inputClass} ${missingIds.has(f.id) ? 'border-critical' : ''}`}
                  value={values[f.id] ?? ''}
                  onChange={(e) => setValue(f.id, e.target.value)}
                />
                {missingIds.has(f.id) && <p className="mt-1 text-xs text-critical">This field is required.</p>}
              </div>
            ))}

            {form.fields.map((field) => {
              const hasError = missingIds.has(field.id)
              const errorClass = hasError ? 'border-critical' : ''

              let control: ReactNode
              if (field.source.kind === 'standard') {
                const meta = standardFieldMeta(field.source.key)
                control =
                  meta.inputType === 'textarea' ? (
                    <textarea
                      className={`${inputClass} min-h-24 resize-none ${errorClass}`}
                      value={values[field.id] ?? ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                    />
                  ) : (
                    <input
                      type={meta.inputType}
                      className={`${inputClass} ${errorClass}`}
                      value={values[field.id] ?? ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                    />
                  )
              } else {
                const prop = customPropertyForField(field, customProperties)
                if (prop?.type === 'select') {
                  control = (
                    <select
                      className={`${inputClass} ${errorClass}`}
                      value={values[field.id] ?? ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                    >
                      <option value="">Choose…</option>
                      {prop.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )
                } else if (prop?.type === 'boolean') {
                  control = (
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      <input
                        type="checkbox"
                        checked={values[field.id] === 'true'}
                        onChange={(e) => setValue(field.id, e.target.checked ? 'true' : 'false')}
                      />
                      Yes
                    </label>
                  )
                } else if (prop?.type === 'date') {
                  control = (
                    <input
                      type="date"
                      className={`${inputClass} ${errorClass}`}
                      value={values[field.id] ?? ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                    />
                  )
                } else if (prop?.type === 'number') {
                  control = (
                    <input
                      type="number"
                      className={`${inputClass} tabular ${errorClass}`}
                      value={values[field.id] ?? ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                    />
                  )
                } else {
                  control = (
                    <input
                      type="text"
                      className={`${inputClass} ${errorClass}`}
                      value={values[field.id] ?? ''}
                      onChange={(e) => setValue(field.id, e.target.value)}
                    />
                  )
                }
              }

              return (
                <div key={field.id}>
                  <label className={labelClass}>
                    {field.label} {field.required && <span className="text-critical">*</span>}
                  </label>
                  {control}
                  {hasError && <p className="mt-1 text-xs text-critical">This field is required.</p>}
                </div>
              )
            })}
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-amber px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-strong"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}
