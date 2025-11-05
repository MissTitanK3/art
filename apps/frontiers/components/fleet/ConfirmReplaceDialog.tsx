"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { humanizeKey, pct } from '@/lib/format'
import { useState } from 'react'

export function ConfirmReplaceDialog({ open, onOpenChange, cost, deltas, onConfirm }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  cost: number
  deltas: Array<[string, number, number]>
  onConfirm: () => void | Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true)
      await Promise.resolve(onConfirm())
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Confirm Replace</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-2">
          {deltas.length ? (
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground">Effect changes</div>
              <div className="flex flex-col gap-1">
                {deltas.map(([k, a, b]) => (
                  <div key={k} className="flex items-center justify-between rounded border px-2 py-1">
                    <span className="text-[11px]">{humanizeKey(k)}</span>
                    <span className="text-[11px]">{pct(a)} → {pct(b)} {Math.round((b - a) * 100) !== 0 ? `(${b - a > 0 ? '+' : ''}${Math.round((b - a) * 100)}%)` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="text-xs text-muted-foreground">Cost: <span className="font-medium">{cost} credits</span></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button size="sm" onClick={handleConfirm} disabled={isSubmitting}>Confirm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
