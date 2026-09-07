import Papa from 'papaparse'
import type { Lead, PropertyDef } from '../types'

export function exportLeadsCsv(leads: Lead[], properties: PropertyDef[], filename = 'leads.csv') {
  const rows = leads.map((lead) => {
    const row: Record<string, string> = {
      Name: lead.name,
      Title: lead.title,
      Company: lead.company,
      Email: lead.email,
      Phone: lead.phone,
      Source: lead.source,
      Stage: lead.stage,
      Value: String(lead.value),
      Owner: lead.owner,
      'Created At': lead.createdAt,
      'Last Activity': lead.lastActivity,
      Notes: lead.notes,
    }
    for (const prop of properties) {
      const value = lead.customFields[prop.id]
      row[prop.label] = value === undefined ? '' : String(value)
    }
    return row
  })

  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve({ headers: results.meta.fields ?? [], rows: results.data }),
      error: (err: Error) => reject(err),
    })
  })
}
