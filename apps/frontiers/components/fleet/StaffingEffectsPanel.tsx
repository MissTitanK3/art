"use client"

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog'
import { humanizeKey, pct } from '@/lib/format'

export function StaffingEffectsPanel({
  derivedBonuses,
  derivedBreakdown,
  open,
  onOpenChange,
}: {
  derivedBonuses: Record<string, number> | null
  derivedBreakdown: { items: Array<{ type: 'crew' | 'position'; id: string; name?: string; contributions: Record<string, number> }>; auras: string[]; sets?: string[] } | null
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  if (!derivedBonuses) return null
  return (
    <div className="border rounded p-2 text-xs text-muted-foreground space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="font-medium text-foreground text-[11px]">Staffing Effects</div>
          <button type="button" className="h-4 w-4 rounded-full border flex items-center justify-center text-[10px] text-muted-foreground hover:bg-muted" aria-label="Open staffing breakdown" onClick={() => onOpenChange(true)}>?</button>
        </div>
        {derivedBreakdown?.auras?.length ? (
          <div className="flex flex-wrap gap-1">
            {derivedBreakdown.auras.map((a, i) => (
              <span key={i} className="rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5">{a}</span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(derivedBonuses).filter(([, v]) => (v ?? 0) !== 0).map(([k, v]) => (
          <span key={k} className="rounded bg-muted px-1.5 py-0.5">
            {humanizeKey(k)} {pct(Number(v))}
          </span>
        ))}
      </div>
      {derivedBreakdown?.items?.length ? (
        <details className="mt-1">
          <summary className="cursor-pointer text-[11px] text-foreground/80">Breakdown</summary>
          <div className="mt-1 space-y-1">
            {derivedBreakdown.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between border rounded px-2 py-1">
                <span className="text-[11px]">{it.type === 'crew' ? 'Crew' : 'Position'}: {it.name || it.id}</span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(it.contributions).map(([kk, vv]) => (
                    <span key={kk} className="rounded bg-muted px-1 py-0.5 text-[10px]">{humanizeKey(kk)} {pct(Number(vv))}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      ) : null}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Staffing Breakdown</DialogTitle>
          </DialogHeader>
          <div className="text-xs space-y-3">
            {derivedBreakdown?.auras?.length ? (
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Auras</div>
                <div className="flex flex-wrap gap-1">
                  {derivedBreakdown.auras.map((a, i) => (
                    <span key={i} className="rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 py-0.5">{a}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {derivedBreakdown?.sets?.length ? (
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Set bonuses</div>
                <div className="flex flex-wrap gap-1">
                  {derivedBreakdown.sets.map((s, i) => (
                    <span key={i} className="rounded bg-muted px-1.5 py-0.5">{s}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {derivedBreakdown?.items?.length ? (
              <div>
                <div className="text-[11px] text-muted-foreground mb-1">Per-item contributions</div>
                <div className="space-y-1">
                  {derivedBreakdown.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between border rounded px-2 py-1">
                      <span className="text-[11px]">{it.type === 'crew' ? 'Crew' : 'Position'}: {it.name || it.id}</span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(it.contributions).map(([kk, vv]) => (
                          <span key={kk} className="rounded bg-muted px-1 py-0.5 text-[10px]">{humanizeKey(kk)} {pct(Number(vv))}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
