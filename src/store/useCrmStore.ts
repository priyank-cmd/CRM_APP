import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateMockLeads } from '../data/mockLeads'
import type { FormDef, Lead, PropertyDef, Segment, Stage } from '../types'

interface CrmState {
  leads: Lead[]
  customProperties: PropertyDef[]
  segments: Segment[]
  forms: FormDef[]

  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActivity'>) => void
  updateLead: (id: string, patch: Partial<Lead>) => void
  moveStage: (id: string, stage: Stage) => void
  deleteLead: (id: string) => void
  importLeads: (leads: Omit<Lead, 'id'>[]) => void
  resetToMockData: () => void

  addProperty: (prop: PropertyDef) => void
  updateProperty: (id: string, patch: Partial<PropertyDef>) => void
  deleteProperty: (id: string) => void

  addSegment: (segment: Segment) => void
  updateSegment: (id: string, patch: Partial<Segment>) => void
  deleteSegment: (id: string) => void

  addForm: (form: FormDef) => void
  updateForm: (id: string, patch: Partial<FormDef>) => void
  deleteForm: (id: string) => void
}

function newId() {
  return `lead-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export const useCrmStore = create<CrmState>()(
  persist(
    (set) => ({
      leads: generateMockLeads(),
      customProperties: [],
      segments: [],
      forms: [],

      addLead: (lead) =>
        set((state) => ({
          leads: [
            {
              ...lead,
              id: newId(),
              createdAt: today(),
              lastActivity: today(),
            },
            ...state.leads,
          ],
        })),

      updateLead: (id, patch) =>
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, ...patch, lastActivity: today() } : lead,
          ),
        })),

      moveStage: (id, stage) =>
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, stage, lastActivity: today() } : lead,
          ),
        })),

      deleteLead: (id) =>
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
        })),

      importLeads: (leads) =>
        set((state) => ({
          leads: [...leads.map((lead) => ({ ...lead, id: newId() })), ...state.leads],
        })),

      resetToMockData: () => set({ leads: generateMockLeads() }),

      addProperty: (prop) =>
        set((state) => ({ customProperties: [...state.customProperties, prop] })),

      updateProperty: (id, patch) =>
        set((state) => ({
          customProperties: state.customProperties.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      deleteProperty: (id) =>
        set((state) => ({
          customProperties: state.customProperties.filter((p) => p.id !== id),
          leads: state.leads.map((lead) => {
            if (!(id in lead.customFields)) return lead
            const customFields = Object.fromEntries(
              Object.entries(lead.customFields).filter(([key]) => key !== id),
            )
            return { ...lead, customFields }
          }),
          segments: state.segments.map((segment) => ({
            ...segment,
            rules: segment.rules.filter((rule) => rule.field !== `custom:${id}`),
          })),
        })),

      addSegment: (segment) => set((state) => ({ segments: [...state.segments, segment] })),

      updateSegment: (id, patch) =>
        set((state) => ({
          segments: state.segments.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      deleteSegment: (id) =>
        set((state) => ({ segments: state.segments.filter((s) => s.id !== id) })),

      addForm: (form) => set((state) => ({ forms: [...state.forms, form] })),

      updateForm: (id, patch) =>
        set((state) => ({
          forms: state.forms.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      deleteForm: (id) => set((state) => ({ forms: state.forms.filter((f) => f.id !== id) })),
    }),
    {
      name: 'leadspot-crm-data',
      version: 5,
      // v1 -> v2: deal values moved from USD to INR magnitude.
      // v2 -> v3: leads gained customFields; store gained customProperties/segments.
      // v3 -> v4: sales rep roster renamed — remap existing owner references
      // in place rather than regenerating, so real edits/imports survive.
      // v4 -> v5: store gained forms.
      migrate: (persisted, version) => {
        let state = persisted as Partial<CrmState> & { leads?: Lead[] }
        if (version < 2) {
          state = { leads: generateMockLeads() }
        }
        if (version < 3) {
          state = {
            ...state,
            leads: (state.leads ?? []).map((lead) => ({
              ...lead,
              customFields: lead.customFields ?? {},
            })),
            customProperties: state.customProperties ?? [],
            segments: state.segments ?? [],
          }
        }
        if (version < 4) {
          const OWNER_RENAME: Record<string, string> = {
            'Maya Chen': 'Ananya Iyer',
            'Jordan Ruiz': 'Arjun Mehta',
            'Sam Okafor': 'Rohan Kapoor',
            'Theo Brandt': 'Divya Deshmukh',
          }
          state = {
            ...state,
            leads: (state.leads ?? []).map((lead) => ({
              ...lead,
              owner: OWNER_RENAME[lead.owner] ?? lead.owner,
            })),
            segments: (state.segments ?? []).map((segment) => ({
              ...segment,
              rules: segment.rules.map((rule) =>
                rule.field === 'owner'
                  ? {
                      ...rule,
                      value: rule.value
                        .split(',')
                        .map((v) => OWNER_RENAME[v] ?? v)
                        .join(','),
                    }
                  : rule,
              ),
            })),
          }
        }
        if (version < 5) {
          state = {
            ...state,
            forms: state.forms ?? [],
          }
        }
        return state as CrmState
      },
    },
  ),
)
