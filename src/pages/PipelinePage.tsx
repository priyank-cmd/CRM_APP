import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Avatar } from '../components/ui/Avatar'
import { LeadDrawer } from '../components/leads/LeadDrawer'
import { SegmentBuilderModal } from '../components/leads/SegmentBuilderModal'
import { SegmentPillBar } from '../components/leads/SegmentPillBar'
import { useCrmStore } from '../store/useCrmStore'
import { OWNERS, SOURCES, STAGES } from '../types'
import type { Lead, Segment, Stage } from '../types'
import { STAGE_STYLES } from '../lib/stageStyles'
import { formatCompactCurrency, formatCurrency } from '../lib/format'
import { evaluateSegment, getAllFields } from '../lib/segments'

export function PipelinePage() {
  const leads = useCrmStore((s) => s.leads)
  const moveStage = useCrmStore((s) => s.moveStage)
  const customProperties = useCrmStore((s) => s.customProperties)
  const segments = useCrmStore((s) => s.segments)

  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [defaultStage, setDefaultStage] = useState<Stage>('New')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dragOverStage, setDragOverStage] = useState<Stage | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('All')
  const [ownerFilter, setOwnerFilter] = useState<string>('All')
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)
  const [segmentModalOpen, setSegmentModalOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)

  const fields = useMemo(() => getAllFields(customProperties), [customProperties])
  const activeSegment = segments.find((s) => s.id === activeSegmentId) ?? null

  const filteredLeads = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads
      .filter((l) => (activeSegment ? evaluateSegment(l, activeSegment, fields) : true))
      .filter((l) => (sourceFilter === 'All' ? true : l.source === sourceFilter))
      .filter((l) => (ownerFilter === 'All' ? true : l.owner === ownerFilter))
      .filter((l) => (q ? `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(q) : true))
  }, [leads, query, sourceFilter, ownerFilter, activeSegment, fields])

  const columns = useMemo(
    () =>
      STAGES.map((stage) => {
        const items = filteredLeads
          .filter((l) => l.stage === stage)
          .sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1))
        return {
          stage,
          items,
          total: items.reduce((sum, l) => sum + l.value, 0),
        }
      }),
    [filteredLeads],
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

  const selectClass =
    'rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink-soft outline-none focus:border-amber'

  return (
    <AppShell
      title="Pipeline"
      description={`${filteredLeads.length} of ${leads.length} leads · drag a card to move it between stages`}
    >
      <div className="flex h-full flex-col">
        <SegmentPillBar
          activeSegmentId={activeSegmentId}
          onSelect={setActiveSegmentId}
          onCreate={() => {
            setEditingSegment(null)
            setSegmentModalOpen(true)
          }}
          onEdit={(segment) => {
            setEditingSegment(segment)
            setSegmentModalOpen(true)
          }}
        />

        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads or companies…"
              className="w-64 rounded-md border border-hairline bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-amber"
            />
          </div>
          <select className={selectClass} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="All">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className={selectClass} value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option value="All">All owners</option>
            {OWNERS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
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
      </div>

      <LeadDrawer
        lead={activeLead}
        defaultStage={defaultStage}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <SegmentBuilderModal
        open={segmentModalOpen}
        editing={editingSegment}
        onClose={() => setSegmentModalOpen(false)}
      />
    </AppShell>
  )
}
