import type { Stage } from '../types'

export const STAGE_STYLES: Record<Stage, { bg: string; text: string; dot: string }> = {
  New: { bg: '#eceeea', text: '#4a4d47', dot: '#8b8f96' },
  Contacted: { bg: '#e4eefa', text: '#1b4c82', dot: '#2a78d6' },
  Qualified: { bg: '#ece8fa', text: '#3c3080', dot: '#4a3aa7' },
  Proposal: { bg: '#fbf0da', text: '#8a5e0c', dot: '#eda100' },
  Negotiation: { bg: '#fbe6db', text: '#93401a', dot: '#eb6834' },
  Won: { bg: '#e5f2e9', text: '#215c37', dot: '#2f7a4d' },
  Lost: { bg: '#f8e6e4', text: '#832e2b', dot: '#b3403d' },
}

export const SOURCE_DOT: Record<string, string> = {
  Referral: '#2a78d6',
  Website: '#1baf7a',
  'Cold Outreach': '#8b8f96',
  Event: '#eda100',
  Social: '#e87ba4',
  Partner: '#4a3aa7',
}
