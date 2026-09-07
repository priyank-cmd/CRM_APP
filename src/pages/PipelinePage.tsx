import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Avatar } from '../components/ui/Avatar'
import { LeadDrawer } from '../components/leads/LeadDrawer'
import { useCrmStore } from '../store/useCrmStore'
import { STAGES } from '../types'
import type { Lead, Stage } from '../types'
import { STAGE_STYLES } from '../lib/stageStyles'
import { formatCompactCurrency, formatCurrency } from '../lib/format'

export function PipelinePage() {
  const leads = useCrmStore((s) => s.leads)
  const moveStage = useCrmStore((s) => s.moveStage)
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [defaultStage, setDefaultStage] = useState<Stage>('New')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const columns = useMemo(
    () =>
      STAGES.map((stage) => {
        const items = leads
          .filter((l) => l.stage === stage)
          .sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))
        return {
          stage,
          items,
          total: items.reduce((sum, l) => sum + l.value, 0),
        }
      }),
    [leads],
  )

  function openEdit(lead: Lead) {
    setActiveLead(lead)
    setDrawerOpen(true)
  }

  function openNew(stage: Stage) {
    setActiveLead(null)
    setDefaultStage(stage)
    setDrawerOpen(true)
  }

  function handleDrop(stage: Stage) {
    if (draggingId) moveStage(draggingId, stage)
    setDraggingId(null)
    setDragOverStage(null)
  }

  return (
    <AppShell title="Pipeline" description="Drag a card to move it between stages">
      <div className="flex h-full gap-4 overflow-x-auto pb-2">
        {columns.map(({ stage, items, total }) => {
          const style = STAGE_STYLES[stage]
          const isOver = dragOverStage === stage
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverStage(stage)
              }}
              onDragLeave={() => setDragOverStage((s) => (s === stage ? null : s))}
              onDrop={() => handleDrop(stage)}
              className={`flex w-72 shrink-0 flex-col rounded-lg border bg-paper/60 transition-colors ${
                isOver ? 'border-amber bg-amber-tint/40' : 'border-hairline'
              }`}
            >
              <div className="flex items-center justify-between px-3.5 pt-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: style.dot }} />
                  <span className="text-sm font-medium text-ink">{stage}</span>
                  <span className="tabular text-xs text-ink-mute">{items.length}</span>
                </div>
                <button
                  onClick={() => openNew(stage)}
                  className="rounded p-1 text-ink-mute hover:bg-white hover:text-ink"
                  aria-label={`Add lead to ${stage}`}
                >
                  <Plus size={15} />
                </button>
              </div>
              <div className="tabular px-3.5 pb-3 pt-1 text-xs text-ink-mute">
                {formatCompactCurrency(total)} total
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                {items.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDraggingId(lead.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => openEdit(lead)}
                    className={`cursor-grab space-y-2 rounded-md border border-hairline bg-surface p-3 shadow-[0_1px_0_rgba(11,11,11,0.02)] hover:border-hairline-strong ${
                      draggingId === lead.id ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink">{lead.company}</div>
                        <div className="truncate text-xs text-ink-mute">{lead.name}</div>
                      </div>
                      <Avatar name={lead.owner} size={22} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="tabular text-sm font-semibold text-ink">
                        {formatCurrency(lead.value)}
                      </span>
                      <span className="text-[11px] text-ink-mute">{lead.source}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-hairline px-3 py-6 text-center text-xs text-ink-mute">
                    No leads
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <LeadDrawer
        lead={activeLead}
        defaultStage={defaultStage}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </AppShell>
  )
}
