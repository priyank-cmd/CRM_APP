import { useRef, useState } from 'react'
import { Download, File as FileIcon, FileText, Image as ImageIcon, Trash2, Upload } from 'lucide-react'
import { useCrmStore } from '../../store/useCrmStore'
import { getFile, putFile } from '../../lib/fileStore'
import { formatBytes, formatDate } from '../../lib/format'
import { MAX_DOCUMENT_SIZE_BYTES, type LeadDocument } from '../../types'

function iconFor(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return FileText
  return FileIcon
}

function newDocId() {
  return `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export function LeadDocuments({ leadId }: { leadId: string }) {
  const documents = useCrmStore((s) => s.documents).filter((d) => d.leadId === leadId)
  const addDocumentMeta = useCrmStore((s) => s.addDocumentMeta)
  const deleteDocumentMeta = useCrmStore((s) => s.deleteDocumentMeta)
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setError('')
    setUploading(true)

    for (const file of Array.from(fileList)) {
      if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
        setError(`"${file.name}" is over the 20MB limit and wasn't added.`)
        continue
      }
      const id = newDocId()
      try {
        await putFile(id, file)
        addDocumentMeta({
          id,
          leadId,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString().slice(0, 10),
        })
      } catch {
        setError(`Couldn't save "${file.name}" — try again.`)
      }
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDownload(doc: LeadDocument) {
    setError('')
    const blob = await getFile(doc.id)
    if (!blob) {
      setError(`"${doc.name}" couldn't be found — it may have been removed from this browser.`)
      return
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3 border-t border-hairline pt-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-ink-soft">Documents</div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-xs font-medium text-amber-strong hover:text-amber disabled:opacity-50"
        >
          <Upload size={13} /> {uploading ? 'Uploading…' : 'Add file'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {documents.length === 0 ? (
        <p className="text-xs text-ink-mute">No documents attached yet.</p>
      ) : (
        <div className="space-y-1.5">
          {documents.map((doc) => {
            const Icon = iconFor(doc.mimeType)
            return (
              <div key={doc.id} className="flex items-center gap-2.5 rounded-md bg-paper px-3 py-2">
                <Icon size={16} className="shrink-0 text-ink-mute" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink">{doc.name}</div>
                  <div className="text-xs text-ink-mute">
                    {formatBytes(doc.size)} · {formatDate(doc.uploadedAt)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="rounded p-1 text-ink-mute hover:bg-surface hover:text-ink"
                  aria-label={`Download ${doc.name}`}
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteDocumentMeta(doc.id)}
                  className="rounded p-1 text-ink-mute hover:bg-critical-tint hover:text-critical"
                  aria-label={`Delete ${doc.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}
