"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog'
import type { ArtSignal } from '@/schemas/art_signals'
import { RepairPuzzle } from '@/components/puzzles/RepairPuzzle'

function relativeFromNow(iso?: string) {
  if (!iso) return ''
  const now = Date.now()
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Math.max(0, now - t)
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  if (min < 1) return `${sec}s ago`
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

function sourceBadgeVariant(source?: string) {
  switch ((source || '').toLowerCase()) {
    case 'dispatch':
      return 'destructive' as const
    case 'class':
      return 'info' as const
    case 'session':
      return 'secondary' as const
    default:
      return 'outline' as const
  }
}

export function SignalCard({ signal }: { signal: ArtSignal }) {
  const [open, setOpen] = useState(false)
  const rel = useMemo(() => relativeFromNow(signal.created_at), [signal.created_at])
  const badgeVariant = useMemo(() => sourceBadgeVariant(signal.source_type), [signal.source_type])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{signal.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant={badgeVariant}>{signal.source_type || 'unknown'}</Badge>
          <span>{rel}</span>
        </CardDescription>
      </CardHeader>
      {signal.summary && (
        <CardContent>
          <p className="text-sm text-muted-foreground text-left">{signal.summary}</p>
        </CardContent>
      )}
      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Repair</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Repair Signal</DialogTitle>
            </DialogHeader>
            <RepairPuzzle signal={signal} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
