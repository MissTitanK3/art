"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Label } from '@workspace/ui/components/label'

type CampaignRow = {
  id: string
  title: string | null
  region_id: string | null
  start_at: string | null
  end_at: string | null
  summary: string | null
  art_link: string | null
}

export default function CampaignsAdminPage() {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [artLink, setArtLink] = useState('')
  const [startAt, setStartAt] = useState<string>('')
  const [endAt, setEndAt] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CampaignRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/campaigns', { credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const { campaigns } = await res.json()
        setItems(Array.isArray(campaigns) ? campaigns : [])
      } catch {
        setItems([])
      }
    }
    load()
  }, [])

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      const payload: any = { title: title.trim() }
      if (summary.trim()) payload.summary = summary.trim()
      if (artLink.trim()) payload.art_link = artLink.trim()
      if (startAt) payload.start_at = new Date(startAt).toISOString()
      if (endAt) payload.end_at = new Date(endAt).toISOString()
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const { campaign } = await res.json()
      setItems((prev) => [campaign, ...prev])
      setTitle('')
      setSummary('')
      setArtLink('')
      setStartAt('')
      setEndAt('')
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Seasonal Campaigns</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Campaign</CardTitle>
          <CardDescription>Launch a time-boxed Season visible in Frontiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Winter Repair Drive" />
            </div>
            <div>
              <Label htmlFor="art">ART Link (optional)</Label>
              <Input id="art" value={artLink} onChange={(e) => setArtLink(e.target.value)} placeholder="https://alwaysreadytools.org/fundraisers/winter-drive" />
            </div>
          </div>
          <div>
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short description" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start">Start</Label>
              <Input id="start" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end">End</Label>
              <Input id="end" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <div className="flex justify-end">
            <Button onClick={submit} disabled={loading || !title.trim()}>{loading ? 'Creating…' : 'Create Campaign'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Active</CardTitle>
          <CardDescription>Campaigns in or ahead of window</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No campaigns yet</div>
          ) : (
            <ul className="space-y-2">
              {items.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="font-medium">{c.title || 'Untitled'}</span>
                  <span className="text-muted-foreground"> — {c.start_at?.slice(0, 10)} → {c.end_at?.slice(0, 10)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  )
}

