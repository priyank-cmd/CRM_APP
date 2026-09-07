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

export interface OperatorDef {
  value: string
  label: string
  needsValue: boolean
  multi?: boolean
  range?: boolean
}

export const OPERATORS_BY_TYPE: Record<PropertyType, OperatorDef[]> = {
  text: [
    { value: 'contains', label: 'contains', needsValue: true },
    { value: 'notContains', label: "doesn't contain", needsValue: true },
    { value: 'equals', label: 'is exactly', needsValue: true },
    { value: 'isKnown', label: 'is known', needsValue: false },
    { value: 'isUnknown', label: 'is unknown', needsValue: false },
  ],
  number: [
    { value: 'eq', label: '=', needsValue: true },
    { value: 'neq', label: '≠', needsValue: true },
    { value: 'gt', label: '>', needsValue: true },
    { value: 'lt', label: '<', needsValue: true },
    { value: 'between', label: 'is between', needsValue: true, range: true },
    { value: 'isKnown', label: 'is known', needsValue: false },
    { value: 'isUnknown', label: 'is unknown', needsValue: false },
  ],
  select: [
    { value: 'anyOf', label: 'is any of', needsValue: true, multi: true },
    { value: 'noneOf', label: 'is none of', needsValue: true, multi: true },
    { value: 'isKnown', label: 'is known', needsValue: false },
    { value: 'isUnknown', label: 'is unknown', needsValue: false },
  ],
  boolean: [{ value: 'is', label: 'is', needsValue: true }],
  date: [
    { value: 'before', label: 'before', needsValue: true },
    { value: 'after', label: 'after', needsValue: true },
    { value: 'between', label: 'is between', needsValue: true, range: true },
    { value: 'isKnown', label: 'is known', needsValue: false },
    { value: 'isUnknown', label: 'is unknown', needsValue: false },
  ],
}

export function getOperator(type: PropertyType, operator: string): OperatorDef | undefined {
  return OPERATORS_BY_TYPE[type].find((op) => op.value === operator)
}

export function ruleIsValid(rule: SegmentRule, fields: FieldDef[]): boolean {
  const field = fields.find((f) => f.key === rule.field)
  if (!field) return false
  const opDef = getOperator(field.type, rule.operator)
  if (!opDef) return false
  if (!opDef.needsValue) return true
  if (opDef.range) return rule.value !== '' && !!rule.value2 && rule.value2 !== ''
  return rule.value !== ''
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
  if (!field) return true
  const value = getFieldValue(lead, rule.field)
  const isEmpty = value === undefined || value === null || value === ''

  if (rule.operator === 'isKnown') return !isEmpty
  if (rule.operator === 'isUnknown') return isEmpty

  switch (field.type) {
    case 'text': {
      const sv = String(value ?? '').toLowerCase()
      const rv = rule.value.toLowerCase()
      if (rule.operator === 'equals') return sv === rv
      if (rule.operator === 'notContains') return !sv.includes(rv)
      return sv.includes(rv)
    }
    case 'number': {
      if (typeof value !== 'number') return false
      if (rule.operator === 'between') {
        const min = Number(rule.value)
        const max = Number(rule.value2)
        return value >= Math.min(min, max) && value <= Math.max(min, max)
      }
      const rv = Number(rule.value)
      if (rule.operator === 'neq') return value !== rv
      if (rule.operator === 'gt') return value > rv
      if (rule.operator === 'lt') return value < rv
      return value === rv
    }
    case 'select': {
      const sv = String(value ?? '')
      const selected = rule.value.split(',').filter(Boolean)
      const included = selected.includes(sv)
      return rule.operator === 'noneOf' ? !included : included
    }
    case 'boolean':
      return Boolean(value) === (rule.value === 'true')
    case 'date': {
      const sv = String(value ?? '')
      if (!sv) return false
      if (rule.operator === 'between') {
        const [lo, hi] = [rule.value, rule.value2 ?? rule.value].sort()
        return sv >= lo && sv <= hi
      }
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
