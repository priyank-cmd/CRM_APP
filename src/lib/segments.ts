import { OWNERS, SOURCES, STAGES, type Lead, type PropertyDef, type PropertyType, type Segment, type SegmentRule } from '../types'

export interface FieldDef {
  key: string
  label: string
  type: PropertyType
  options?: readonly string[]
}

const BUILTIN_FIELDS: FieldDef[] = [
  { key: 'stage', label: 'Stage', type: 'select', options: STAGES },
  { key: 'source', label: 'Source', type: 'select', options: SOURCES },
  { key: 'owner', label: 'Owner', type: 'select', options: OWNERS },
  { key: 'value', label: 'Deal value', type: 'number' },
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'name', label: 'Contact name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'createdAt', label: 'Created date', type: 'date' },
  { key: 'lastActivity', label: 'Last activity date', type: 'date' },
]

export function getAllFields(customProperties: PropertyDef[]): FieldDef[] {
  return [
    ...BUILTIN_FIELDS,
    ...customProperties.map((p) => ({
      key: `custom:${p.id}`,
      label: p.label,
      type: p.type,
      options: p.options,
    })),
  ]
}

export const OPERATORS_BY_TYPE: Record<PropertyType, { value: string; label: string }[]> = {
  text: [
    { value: 'contains', label: 'contains' },
    { value: 'equals', label: 'is exactly' },
  ],
  number: [
    { value: 'eq', label: '=' },
    { value: 'gt', label: '>' },
    { value: 'lt', label: '<' },
  ],
  select: [
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
  ],
  boolean: [{ value: 'is', label: 'is' }],
  date: [
    { value: 'before', label: 'before' },
    { value: 'after', label: 'after' },
  ],
}

function getFieldValue(lead: Lead, key: string): string | number | boolean | undefined {
  if (key.startsWith('custom:')) return lead.customFields[key.slice(7)]
  switch (key) {
    case 'stage':
      return lead.stage
    case 'source':
      return lead.source
    case 'owner':
      return lead.owner
    case 'value':
      return lead.value
    case 'company':
      return lead.company
    case 'name':
      return lead.name
    case 'email':
      return lead.email
    case 'createdAt':
      return lead.createdAt
    case 'lastActivity':
      return lead.lastActivity
    default:
      return undefined
  }
}

export function evaluateRule(lead: Lead, rule: SegmentRule, fields: FieldDef[]): boolean {
  const field = fields.find((f) => f.key === rule.field)
  if (!field || rule.value === '') return true
  const value = getFieldValue(lead, rule.field)

  switch (field.type) {
    case 'text': {
      const sv = String(value ?? '').toLowerCase()
      const rv = rule.value.toLowerCase()
      return rule.operator === 'equals' ? sv === rv : sv.includes(rv)
    }
    case 'number': {
      if (typeof value !== 'number') return false
      const rv = Number(rule.value)
      if (rule.operator === 'gt') return value > rv
      if (rule.operator === 'lt') return value < rv
      return value === rv
    }
    case 'select': {
      const sv = String(value ?? '')
      return rule.operator === 'isNot' ? sv !== rule.value : sv === rule.value
    }
    case 'boolean': {
      return Boolean(value) === (rule.value === 'true')
    }
    case 'date': {
      const sv = String(value ?? '')
      if (!sv) return false
      return rule.operator === 'after' ? sv > rule.value : sv < rule.value
    }
    default:
      return true
  }
}

export function evaluateSegment(lead: Lead, segment: Segment, fields: FieldDef[]): boolean {
  return segment.rules.every((rule) => evaluateRule(lead, rule, fields))
}

export function newRuleId(): string {
  return `rule-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}
