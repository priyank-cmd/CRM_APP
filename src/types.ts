export const STAGES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost',
] as const

export type Stage = (typeof STAGES)[number]

export const OPEN_STAGES: Stage[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
]

export const SOURCES = [
  'Referral',
  'Website',
  'Cold Outreach',
  'Event',
  'Social',
  'Partner',
] as const

export type Source = (typeof SOURCES)[number]

export interface Lead {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone: string
  source: Source
  stage: Stage
  value: number
  owner: string
  createdAt: string
  lastActivity: string
  notes: string
  customFields: Record<string, string | number | boolean>
}

export const OWNERS = [
  'Maya Chen',
  'Jordan Ruiz',
  'Sam Okafor',
  'Priya Nair',
  'Theo Brandt',
] as const

// User-defined properties on leads.
export type PropertyType = 'text' | 'number' | 'select' | 'boolean' | 'date'

export interface PropertyDef {
  id: string
  label: string
  type: PropertyType
  options?: string[]
}

// Saved, reusable filters ("segments") built from built-in and custom fields.
export interface SegmentRule {
  id: string
  field: string
  operator: string
  value: string
  // Second bound, only used by the "between" operator.
  value2?: string
}

export interface Segment {
  id: string
  name: string
  rules: SegmentRule[]
}
