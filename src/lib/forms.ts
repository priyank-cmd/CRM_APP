import type { FormDef, FormField, Lead, PropertyDef, StandardFormFieldKey } from '../types'

export interface StandardFieldMeta {
  key: StandardFormFieldKey
  label: string
  inputType: 'text' | 'email' | 'tel' | 'textarea'
}

export const STANDARD_FIELD_META: StandardFieldMeta[] = [
  { key: 'title', label: 'Title', inputType: 'text' },
  { key: 'email', label: 'Email', inputType: 'email' },
  { key: 'phone', label: 'Phone', inputType: 'tel' },
  { key: 'notes', label: 'Notes', inputType: 'textarea' },
]

export function standardFieldMeta(key: StandardFormFieldKey): StandardFieldMeta {
  return STANDARD_FIELD_META.find((f) => f.key === key)!
}

export function customPropertyForField(field: FormField, customProperties: PropertyDef[]): PropertyDef | undefined {
  const source = field.source
  if (source.kind !== 'custom') return undefined
  return customProperties.find((p) => p.id === source.propertyId)
}

export function getMissingRequiredFields(fields: FormField[], values: Record<string, string>): FormField[] {
  return fields.filter((f) => f.required && !(values[f.id] ?? '').trim())
}

export function buildLeadFromSubmission(
  form: FormDef,
  values: Record<string, string>,
  customProperties: PropertyDef[],
): Omit<Lead, 'id' | 'createdAt' | 'lastActivity'> {
  const lead: Omit<Lead, 'id' | 'createdAt' | 'lastActivity'> = {
    name: (values['__name'] ?? '').trim(),
    title: '',
    company: (values['__company'] ?? '').trim(),
    email: '',
    phone: '',
    source: form.defaultSource,
    stage: form.defaultStage,
    value: 0,
    owner: form.defaultOwner,
    notes: '',
    customFields: {},
    sourceFormId: form.id,
  }

  for (const field of form.fields) {
    const raw = (values[field.id] ?? '').trim()
    if (!raw) continue
    const source = field.source
    if (source.kind === 'standard') {
      if (source.key === 'title') lead.title = raw
      else if (source.key === 'email') lead.email = raw
      else if (source.key === 'phone') lead.phone = raw
      else if (source.key === 'notes') lead.notes = raw
      continue
    }
    const prop = customProperties.find((p) => p.id === source.propertyId)
    if (!prop) continue
    if (prop.type === 'number') lead.customFields[prop.id] = Number(raw)
    else if (prop.type === 'boolean') lead.customFields[prop.id] = raw === 'true'
    else lead.customFields[prop.id] = raw
  }

  return lead
}
