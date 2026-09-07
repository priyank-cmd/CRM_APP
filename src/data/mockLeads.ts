import { OWNERS, STAGES, type Lead, type Source, type Stage } from '../types'

// Small deterministic PRNG (mulberry32) so the seed dataset is stable across reloads.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry32(20260907)

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(random() * list.length)]
}

function pickWeighted<T>(entries: [T, number][]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Drew', 'Avery',
  'Quinn', 'Reese', 'Harper', 'Rowan', 'Elliot', 'Sasha', 'Devon', 'Micah',
  'Nadia', 'Owen', 'Priya', 'Leah', 'Marcus', 'Elena', 'Ibrahim', 'Nora',
  'Felix', 'Camila', 'Yusuf', 'Ines', 'Oscar', 'Willa', 'Hana', 'Diego',
]
const LAST_NAMES = [
  'Kim', 'Novak', 'Bishara', 'Fontaine', 'Whitfield', 'Salas', 'Renner',
  'Okonkwo', 'Marsh', 'Delgado', 'Petrov', 'Lindqvist', 'Abara', 'Castellano',
  'Huang', 'Sorensen', 'Kaur', 'Mercer', 'Villanueva', 'Traore', 'Baptiste',
]
const COMPANY_PREFIX = [
  'Northwind', 'Beacon', 'Cobalt', 'Fernway', 'Solstice', 'Anchorpoint',
  'Gridline', 'Harbor', 'Ironleaf', 'Kestrel', 'Latitude', 'Marrow',
  'Nimbus', 'Overlook', 'Palisade', 'Redshift', 'Silvercreek', 'Trailhead',
  'Vantage', 'Wavecrest', 'Yardstick', 'Zenith',
]
const COMPANY_SUFFIX = [
  'Labs', 'Group', 'Partners', 'Collective', 'Works', 'Holdings', 'Studio',
  'Analytics', 'Logistics', 'Systems', 'Ventures', 'Supply Co.',
]
const TITLES = [
  'VP of Marketing', 'Head of Growth', 'Director of Sales', 'Founder',
  'Operations Manager', 'CMO', 'Revenue Lead', 'Marketing Manager',
  'Head of Partnerships', 'COO',
]

const STAGE_WEIGHTS: [Stage, number][] = [
  ['New', 22],
  ['Contacted', 18],
  ['Qualified', 14],
  ['Proposal', 10],
  ['Negotiation', 8],
  ['Won', 15],
  ['Lost', 13],
]

const SOURCE_WEIGHTS: [Source, number][] = [
  ['Referral', 20],
  ['Website', 24],
  ['Cold Outreach', 16],
  ['Event', 12],
  ['Social', 18],
  ['Partner', 10],
]

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export function generateMockLeads(count = 68): Lead[] {
  const leads: Lead[] = []

  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const company = `${pick(COMPANY_PREFIX)} ${pick(COMPANY_SUFFIX)}`
    const stage = pickWeighted(STAGE_WEIGHTS)
    const source = pickWeighted(SOURCE_WEIGHTS)
    const owner = pick(OWNERS)

    // Spread creation dates over the last ~180 days, weighted toward more
    // recent activity so the trend chart has a believable growth curve.
    const ageDays = Math.floor(Math.pow(random(), 1.6) * 180)
    const createdAt = daysAgo(ageDays)

    const isClosed = stage === 'Won' || stage === 'Lost'
    const stageDepth = STAGES.indexOf(stage)
    const activityOffset = isClosed
      ? Math.floor(random() * Math.min(ageDays, 30))
      : Math.floor(random() * Math.min(ageDays, 14) * (1 - stageDepth * 0.08))
    const lastActivity = daysAgo(Math.max(0, ageDays - activityOffset - Math.floor(random() * 5)))

    // Deal sizes in INR, roughly ₹25k to ₹18L, skewed toward the smaller end.
    const baseValue = 25_000 + Math.floor(Math.pow(random(), 1.4) * 1_775_000)
    const value = Math.round(baseValue / 1000) * 1000

    leads.push({
      id: `lead-${i + 1}`,
      name: `${first} ${last}`,
      title: pick(TITLES),
      company,
      email: `${slug(first)}.${slug(last)}@${slug(company)}.com`,
      phone: `(${100 + Math.floor(random() * 800)}) 555-${String(1000 + Math.floor(random() * 9000)).slice(0, 4)}`,
      source,
      stage,
      value,
      owner,
      createdAt: isoDate(createdAt),
      lastActivity: isoDate(lastActivity),
      notes: '',
      customFields: {},
    })
  }

  return leads.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}
