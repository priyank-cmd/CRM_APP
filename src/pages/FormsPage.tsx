import { useMemo, useState } from 'react'
import { Copy, ExternalLink, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { FormBuilderModal } from '../components/forms/FormBuilderModal'
import { useCrmStore } from '../store/useCrmStore'
import type { FormDef } from '../types'
import { formatDate } from '../lib/format'

export function FormsPage() {
  const forms = useCrmStore((s) => s.forms)
  const leads = useCrmStore((s) => s.leads)
  const deleteForm = useCrmStore((s) => s.deleteForm)

  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<FormDef | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const submissionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const lead of leads) {
      if (lead.sourceFormId) counts[lead.sourceFormId] = (counts[lead.sourceFormId] ?? 0) + 1
    }
    return counts
  }, [leads])

  function openNew() {
    setEditingForm(null)
    setBuilderOpen(true)
  }

  function openEdit(form: FormDef) {
    setEditingForm(form)
    setBuilderOpen(true)
  }

  function formLink(formId: string) {
    return `${window.location.origin}${window.location.pathname}#/forms/${formId}/fill`
  }

  async function copyLink(formId: string) {
    try {
      await navigator.clipboard.writeText(formLink(formId))
      setCopiedId(formId)
      setTimeout(() => setCopiedId((id) => (id === formId ? null : id)), 1800)
    } catch {
      // Clipboard access can fail (permissions, insecure context) — the link
      // is still visible via "Open form", so this is a soft failure.
    }
  }

  return (
    <AppShell
      title="Forms"
      description="Design a form, share the link, and submissions become leads"
      action={
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 rounded-md bg-amber px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-strong"
        >
          <Plus size={16} /> New form
        </button>
      }
    >
      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong px-6 py-20 text-center">
          <FileText size={28} className="mb-3 text-ink-mute" />
          <h3 className="font-display text-lg text-ink">No forms yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-ink-mute">
            Build a Contact Us, Event, or Webinar form from your existing lead fields — or new ones — and every
            submission becomes a lead here automatically.
          </p>
          <button
            onClick={openNew}
            className="mt-5 flex items-center gap-1.5 rounded-md bg-amber px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-strong"
          >
            <Plus size={16} /> Create your first form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="flex flex-col rounded-lg border border-hairline bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-amber-tint px-2.5 py-0.5 text-[11px] font-medium text-amber-strong">
                    {form.type}
                  </span>
                  <h3 className="mt-2 truncate font-display text-lg font-medium text-ink">{form.name}</h3>
                  {form.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-mute">{form.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(form)}
                    className="rounded p-1.5 text-ink-mute hover:bg-paper hover:text-ink"
                    aria-label={`Edit ${form.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="rounded p-1.5 text-ink-mute hover:bg-critical-tint hover:text-critical"
                    aria-label={`Delete ${form.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="tabular mt-4 flex items-center gap-4 text-xs text-ink-mute">
                <span>{form.fields.length + 2} fields</span>
                <span>{submissionCounts[form.id] ?? 0} submissions</span>
                <span>Created {formatDate(form.createdAt)}</span>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-4">
                <a
                  href={`#/forms/${form.id}/fill`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper"
                >
                  <ExternalLink size={13} /> Open form
                </a>
                <button
                  onClick={() => copyLink(form.id)}
                  className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper"
                >
                  <Copy size={13} /> {copiedId === form.id ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FormBuilderModal open={builderOpen} editing={editingForm} onClose={() => setBuilderOpen(false)} />
    </AppShell>
  )
}
