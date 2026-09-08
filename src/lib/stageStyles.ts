import type { Stage } from '../types'

// Each value is a CSS custom property defined for both light and dark mode
// in index.css, so badges stay legible without any JS-side theme branching.
export const STAGE_STYLES: Record<Stage, { bg: string; text: string; dot: string }> = {
  New: { bg: 'var(--stage-new-bg)', text: 'var(--stage-new-text)', dot: 'var(--stage-new-dot)' },
  Contacted: {
    bg: 'var(--stage-contacted-bg)',
    text: 'var(--stage-contacted-text)',
    dot: 'var(--stage-contacted-dot)',
  },
  Qualified: {
    bg: 'var(--stage-qualified-bg)',
    text: 'var(--stage-qualified-text)',
    dot: 'var(--stage-qualified-dot)',
  },
  Proposal: {
    bg: 'var(--stage-proposal-bg)',
    text: 'var(--stage-proposal-text)',
    dot: 'var(--stage-proposal-dot)',
  },
  Negotiation: {
    bg: 'var(--stage-negotiation-bg)',
    text: 'var(--stage-negotiation-text)',
    dot: 'var(--stage-negotiation-dot)',
  },
  Won: { bg: 'var(--stage-won-bg)', text: 'var(--stage-won-text)', dot: 'var(--stage-won-dot)' },
  Lost: { bg: 'var(--stage-lost-bg)', text: 'var(--stage-lost-text)', dot: 'var(--stage-lost-dot)' },
}

export const SOURCE_DOT: Record<string, string> = {
  Referral: 'var(--color-series-blue)',
  Website: 'var(--color-series-aqua)',
  'Cold Outreach': 'var(--color-ink-mute)',
  Event: 'var(--color-series-yellow)',
  Social: 'var(--color-series-magenta)',
  Partner: 'var(--color-series-violet)',
}
