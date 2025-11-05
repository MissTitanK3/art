"use client"

import * as React from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ColumnDef, getCoreRowModel, useReactTable, flexRender } from '@tanstack/react-table'

type Donation = {
  id: string
  donor_alias: string | null
  profile_email: string
  amount: number
  message: string | null
  message_id: string
  created_at: string
}

type RecipientCount = Record<string, number>
type Summary = { region_id: string | null; total: number; donors: number }

export default function LedgerPage() {
  const [rows, setRows] = React.useState<Donation[]>([])
  const [counts, setCounts] = React.useState<RecipientCount>({})
  const [summary, setSummary] = React.useState<Summary[]>([])

  React.useEffect(() => {
    let active = true
    const load = async () => {
      // Recent donations
      const { data: donations } = await supabase
        .from('donations')
        .select('id, donor_alias, profile_email, amount, message, message_id, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      const ids = (donations || []).map((d) => d.message_id).filter(Boolean) as string[]
      let countMap: RecipientCount = {}
      if (ids.length) {
        const { data: effects } = await supabase
          .from('resonance_effects')
          .select('donation_message_id')
          .in('donation_message_id', ids)
        for (const e of effects || []) {
          const k = (e as any).donation_message_id
          if (!k) continue
          countMap[k] = (countMap[k] || 0) + 1
        }
      }

      // Summary view by region
      const { data: summaryRows } = await supabase.from('ledger_summary').select('*')

      if (!active) return
      setRows((donations || []) as any)
      setCounts(countMap)
      setSummary((summaryRows || []) as any)
    }
    load()
    return () => { active = false }
  }, [])

  const columns = React.useMemo<ColumnDef<Donation>[]>(() => [
    { header: 'Donor', accessorKey: 'donor_alias', cell: (info) => info.getValue() || 'Anonymous' },
    { header: 'Email', accessorKey: 'profile_email' },
    { header: 'Amount', accessorKey: 'amount', cell: (info) => `$${Number(info.getValue() || 0).toFixed(2)}` },
    { header: 'Message', accessorKey: 'message', cell: (info) => info.getValue() || '—' },
    { header: 'Recipients', accessorKey: 'message_id', cell: (info) => counts[info.getValue() as string] || 0 },
    { header: 'When', accessorKey: 'created_at', cell: (info) => new Date(info.getValue() as string).toLocaleString() },
  ], [counts])

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <main className="mx-auto max-w-5xl p-4 space-y-6">
      <h1 className="text-xl font-semibold">Public Donation Ledger</h1>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Totals by Region</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {summary.map((s) => (
            <div key={s.region_id || 'unknown'} className="rounded border p-3">
              <div className="text-xs text-muted-foreground">{s.region_id || 'Unknown Region'}</div>
              <div className="text-lg font-semibold">${Number(s.total || 0).toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground">Donors: {s.donors}</div>
              <div className="mt-2 h-2 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.round((Number(s.total || 0) / Math.max(1, maxTotal(summary))) * 100))}%` }} />
              </div>
            </div>
          ))}
          {summary.length === 0 ? <div className="text-sm text-muted-foreground">No data yet</div> : null}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-2">Recent Donations</h2>
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="text-left p-2 font-medium">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={columns.length}>No donations yet</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function maxTotal(rows: Summary[]) {
  return rows.reduce((m, r) => Math.max(m, Number(r.total || 0)), 0)
}

