import { useMemo, useState } from 'react'
import { Download, Pencil, Plus, Search, Settings2, Trash2, Upload } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { StageBadge } from '../components/ui/StageBadge'
import { Avatar } from '../components/ui/Avatar'
import { LeadDrawer } from '../components/leads/LeadDrawer'
import { PropertiesModal } from '../components/leads/PropertiesModal'
import { SegmentBuilderModal } from '../components/leads/SegmentBuilderModal'
import { ImportCsvModal } from '../components/leads/ImportCsvModal'
import { useCrmStore } from '../store/useCrmStore'
import { OWNERS, SOURCES, STAGES, type Lead, type Segment } from '../types'
import { formatCurrency, formatRelativeDate } from '../lib/format'
import { evaluateSegment, getAllFields } from '../lib/segments'
import { exportLeadsCsv } from '../lib/csv'

type SortKey = 'value' | 'lastActivity' | 'name'

export function LeadsPage() {
  const leads = useCrmStore((s) => s.leads)
  const customProperties = useCrmStore((s) => s.customProperties)
  const segments = useCrmStore((s) => s.segments)
  const deleteSegment = useCrmStore((s) => s.deleteSegment)

  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('All')
  const [sourceFilter, setSourceFilter] = useState<string>('All')
  const [ownerFilter, setOwnerFilter] = useState<string>('All')
  const [sortKey, setSortKey] = useState<SortKey>('lastActivity')
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null)
  const [segmentModalOpen, setSegmentModalOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const fields = useMemo(() => getAllFields(customProperties), [customProperties])
  const activeSegment = segments.find((s) => s.id === activeSegmentId) ?? null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads
      .filter((l) => (activeSegment ? evaluateSegment(l, activeSegment, fields) : true))
      .filter((l) => (stageFilter === 'All' ? true : l.stage === stageFilter))
      .filter((l) => (sourceFilter === 'All' ? true : l.source === sourceFilter))
      .filter((l) => (ownerFilter === 'All' ? true : l.owner === ownerFilter))
      .filter((l) =>
        q ? `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => {
        if (sortKey === 'value') return b.value - a.value
        if (sortKey === 'name') return a.name.localeCompare(b.name)
        return a.lastActivity < b.lastActivity ? 1 : -1
      })
  }, [leads, query, stageFilter, sourceFilter, ownerFilter, sortKey, activeSegment, fields])

  function openNew() {
    setActiveLead(null)
    setDrawerOpen(true)
  }

  function openEdit(lead: Lead) {
    setActiveLead(lead)
    setDrawerOpen(true)
  }

  function handleExport() {
    exportLeadsCsv(filtered, customProperties, 'leads.csv')
  }

  const selectClass =
    'rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink-soft outline-none focus:border-amber'
  const secondaryButton =
    'flex items-center gap-1.5 rounded-md border border-hairline px-3.5 py-2.5 text-sm text-ink-soft hover:bg-paper'
  const pillClass = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? 'bg-amber text-white' : 'border border-hairline bg-surface text-ink-soft hover:border-hairline-strong'
    }`

  return (
    <AppShell
      title="Leads"
      description={`${filtered.length} of ${leads.length} leads`}
      action={
        <div className="flex items-center gap-2">
          <button onClick={() => setPropertiesOpen(true)} className={secondaryButton}>
            <Settings2 size={15} /> Properties
          </button>
          <button onClick={() => setImportOpen(true)} className={secondaryButton}>
            <Upload size={15} /> Import
          </button>
          <button onClick={handleExport} className={secondaryButton}>
            <Download size={15} /> Export
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-md bg-amber px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-strong"
          >
            <Plus size={16} /> New lead
          </button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setActiveSegmentId(null)} className={pillClass(activeSegmentId === null)}>
          All leads
        </button>
        {segments.map((segment) => (
          <div key={segment.id} className="flex items-center gap-1">
            <button onClick={() => setActiveSegmentId(segment.id)} className={pillClass(activeSegmentId === segment.id)}>
              {segment.name}
            </button>
            {activeSegmentId === segment.id && (
              <>
                <button
                  onClick={() => {
                    setEditingSegment(segment)
                    setSegmentModalOpen(true)
                  }}
                  className="rounded p-1 text-ink-mute hover:bg-paper hover:text-ink"
                  aria-label={`Edit ${segment.name}`}
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => {
                    deleteSegment(segment.id)
                    setActiveSegmentId(null)
                  }}
                  className="rounded p-1 text-ink-mute hover:bg-critical-tint hover:text-critical"
                  aria-label={`Delete ${segment.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            setEditingSegment(null)
            setSegmentModalOpen(true)
          }}
          className="flex items-center gap-1 rounded-full border border-dashed border-hairline-strong px-3 py-1.5 text-xs text-ink-mute hover:border-amber hover:text-amber-strong"
        >
          <Plus size={12} /> New segment
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads or companies…"
            className="w-64 rounded-md border border-hairline bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-amber"
          />
        </div>
        <select className={selectClass} value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="All">All stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
        <div className="ml-auto flex items-center gap-1.5 text-xs text-ink-mute">
          Sort
          <select
            className={selectClass}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="lastActivity">Last activity</option>
            <option value="value">Deal value</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-hairline bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs text-ink-mute">
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Company</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Stage</th>
              <th className="px-5 py-3 text-right font-medium">Value</th>
              <th className="px-5 py-3 font-medium">Owner</th>
              <th className="px-5 py-3 font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => openEdit(lead)}
                className="cursor-pointer border-b border-hairline last:border-0 hover:bg-paper"
              >
                <td className="px-5 py-3.5">
                  <div className="font-medium text-ink">{lead.name}</div>
                  <div className="text-xs text-ink-mute">{lead.title}</div>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{lead.company}</td>
                <td className="px-5 py-3.5 text-ink-soft">{lead.source}</td>
                <td className="px-5 py-3.5">
                  <StageBadge stage={lead.stage} />
                </td>
                <td className="tabular px-5 py-3.5 text-right font-medium text-ink">
                  {formatCurrency(lead.value)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={lead.owner} size={22} />
                    <span className="text-ink-soft">{lead.owner}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-mute">{formatRelativeDate(lead.lastActivity)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-ink-mute">
                  No leads match these filters. Try widening your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LeadDrawer lead={activeLead} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PropertiesModal open={propertiesOpen} onClose={() => setPropertiesOpen(false)} />
      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} />
      <SegmentBuilderModal
        open={segmentModalOpen}
        editing={editingSegment}
        onClose={() => setSegmentModalOpen(false)}
      />
    </AppShell>
  )
}
