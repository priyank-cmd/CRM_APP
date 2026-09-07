import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateMockLeads } from '../data/mockLeads'
import type { Lead, Stage } from '../types'

interface CrmState {
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastActivity'>) => void
  updateLead: (id: string, patch: Partial<Lead>) => void
  moveStage: (id: string, stage: Stage) => void
  deleteLead: (id: string) => void
  resetToMockData: () => void
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

      resetToMockData: () => set({ leads: generateMockLeads() }),
    }),
    {
      name: 'leadspot-crm-data',
      version: 1,
    },
  ),
)
