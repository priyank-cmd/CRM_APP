import { STAGE_STYLES } from '../../lib/stageStyles'
import type { Stage } from '../../types'

export function StageBadge({ stage }: { stage: Stage }) {
  const style = STAGE_STYLES[stage]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
      {stage}
    </span>
  )
}
