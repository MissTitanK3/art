"use client"

import { useMemo } from 'react'
import { useJournalStore } from '@/store/useJournalStore'

function rel(ts: string) {
  const now = Date.now()
  const t = new Date(ts).getTime()
  const diff = Math.max(0, now - t)
  const min = Math.floor(diff / 60000)
  if (min < 1) return '+0m'
  if (min < 60) return `+${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `+${hr}h`
  const d = Math.floor(hr / 24)
  return `+${d}d`
}

export function EventFeed() {
  const entries = useJournalStore((s) => s.entries)
  const items = useMemo(() => entries, [entries])
  if (!items.length) return null
  return (
    <div className="w-full max-w-3xl mx-auto mt-2">
      <ul className="text-left divide-y">
        {items.map((e) => (
          <li key={e.id} className="py-1.5 text-sm flex items-start gap-2">
            <span className="text-xs text-muted-foreground w-12 shrink-0">{rel(e.ts)}</span>
            <span>{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

