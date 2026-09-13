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
  // Which form this lead came from, if any — undefined for manually-added
  // or CSV-imported leads.
  sourceFormId?: string
}

export const OWNERS = [
  'Priya Nair',
  'Arjun Mehta',
  'Ananya Iyer',
  'Rohan Kapoor',
  'Divya Deshmukh',
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

// Forms: a designed set of fields that, on submission, create a Lead.
// Name and Company are always present (Lead requires both), so a form's
// own field list only covers the rest.
export const STANDARD_FORM_FIELD_KEYS = ['title', 'email', 'phone', 'notes'] as const
export type StandardFormFieldKey = (typeof STANDARD_FORM_FIELD_KEYS)[number]

export type FormFieldSource =
  | { kind: 'standard'; key: StandardFormFieldKey }
  | { kind: 'custom'; propertyId: string }

export interface FormField {
  id: string
  source: FormFieldSource
  label: string
  required: boolean
}

export const FORM_TYPES = ['Contact Us', 'Event', 'Webinar', 'Custom'] as const
export type FormType = (typeof FORM_TYPES)[number]

export interface FormDef {
  id: string
  name: string
  type: FormType
  description: string
  fields: FormField[]
  defaultStage: Stage
  defaultSource: Source
  defaultOwner: string
  createdAt: string
}

// Document metadata lives here (small, JSON-serializable); the actual file
// bytes live in IndexedDB (see lib/fileStore.ts) — localStorage's ~5-10MB
// quota is shared by the whole app and would be blown by a couple of PDFs.
export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024 // 20MB per file

export interface LeadDocument {
  id: string
  leadId: string
  name: string
  size: number
  mimeType: string
  uploadedAt: string
}
