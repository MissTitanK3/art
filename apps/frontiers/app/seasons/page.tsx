"use client"

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Campaign } from '@/schemas/campaigns'
import { useProfileStore } from '@/store/useProfileStore'
import { useSeasonStore } from '@/store/useSeasonStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { useMissionsStore, type Mission } from '@/store/useMissionsStore'
function slugify(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }

function fmtDate(d?: string | null) {
  if (!d) return ''
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return ''
  return x.toLocaleDateString()
}

function timeProgress(start?: string | null, end?: string | null): number {
  if (!start || !end) return 0
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const n = Date.now()
  if (Number.isNaN(s) || Number.isNaN(e) || s >= e) return 0
  if (n <= s) return 0
  if (n >= e) return 100
  return Math.round(((n - s) / (e - s)) * 100)
}

export default function SeasonsPage() {
  const regionId = useProfileStore((s) => s.region_id || s.profile?.region_id || process.env.NEXT_PUBLIC_REGION_ID || null)
  const { active_campaign_id, setActiveCampaign, clearActiveCampaign } = useSeasonStore()
  const [rows, setRows] = useState<Campaign[]>([])
  const [missionsByCampaign, setMissionsByCampaign] = useState<Record<string, Mission[]>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const nowIso = new Date().toISOString()
        let q = supabase
          .from('campaigns')
          .select('*')
          .gte('end_at', nowIso)
          .order('start_at', { ascending: true })
        if (regionId) q = q.or(`region_id.is.null,region_id.eq.${regionId}`)
        const { data, error } = await q
        if (error) throw error
        setRows(Array.isArray(data) ? (data as Campaign[]) : [])
      } catch {
        setRows([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [regionId])

  // Load missions for active campaigns only
  useEffect(() => {
    const now = new Date()
    const active = rows.filter((c) => c.start_at && c.end_at && new Date(c.start_at) <= now && now <= new Date(c.end_at))
    const loadAll = async () => {
      const map: Record<string, Mission[]> = {}
      for (const c of active) {
        const { data, error } = await supabase
          .from('campaign_missions')
          .select('*')
          .eq('campaign_id', c.id)
        if (!error && Array.isArray(data)) map[c.id] = data as Mission[]
      }
      setMissionsByCampaign(map)
      // register in mission store so counters can map correctly
      const reg = useMissionsStore.getState().registerMissions
      for (const [cid, ms] of Object.entries(map)) reg(cid, ms)
    }
    if (active.length > 0) void loadAll()
  }, [rows])

  const items = useMemo(() => rows, [rows])

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Seasons</h1>
        <p className="text-sm text-muted-foreground">Join a seasonal campaign to modify missions, colors, and rewards.</p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((c) => {
          const progress = timeProgress(c.start_at, c.end_at)
          const joined = active_campaign_id === c.id
          return (
            <li key={c.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{c.title || 'Season'}</span>
                    {joined ? <span className="text-xs rounded bg-primary/10 text-primary px-2 py-0.5">Active</span> : null}
                  </CardTitle>
                  <CardDescription>
                    {fmtDate(c.start_at)} – {fmtDate(c.end_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {c.summary ? <p className="text-sm mb-2">{c.summary}</p> : null}
                  <div className="h-2 w-full rounded bg-muted overflow-hidden mb-3">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  {/* Missions list for active seasons */}
                  {(() => {
                    const missions = missionsByCampaign[c.id] || []
                    if (missions.length === 0) return null
                    return (
                      <ul className="space-y-2 mb-3">
                        {missions.map((m) => {
                          const req = (m.required_actions || {}) as Record<string, number>
                          const st = useMissionsStore.getState()
                          const bucket = st.byCampaign[c.id]
                          const prog = bucket?.progress[m.id] || {}
                          // compute pct by averaging action completion
                          const keys = Object.keys(req)
                          const pct = keys.length === 0 ? 0 : Math.round(keys.reduce((acc, k) => acc + Math.min(1, (prog[k] || 0) / (req[k] || 1)), 0) / keys.length * 100)
                          return (
                            <li key={m.id} className="text-xs">
                              <div className="font-medium">{m.title || 'Mission'}</div>
                              {m.description ? <div className="text-muted-foreground">{m.description}</div> : null}
                              <div className="h-1.5 w-full rounded bg-muted overflow-hidden mt-1">
                                <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {Object.entries(req).map(([k, v]) => `${k}:${prog[k] || 0}/${v}`).join(' • ')}
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )
                  })()}
                  <div className="flex gap-2">
                    {!joined ? (
                      <Button size="sm" onClick={() => setActiveCampaign(c)}>Join Season</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => clearActiveCampaign()}>Leave Season</Button>
                    )}
                    {c.art_link ? (
                      <Button asChild size="sm" variant="ghost">
                        <a href={c.art_link} target="_blank" rel="noopener noreferrer">Details</a>
                      </Button>
                    ) : null}
                    <Button asChild size="sm" variant="ghost">
                      <a href={`/seasons/${slugify((c.title || '').trim())}`}>Overview</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
      {loading && items.length === 0 ? <div className="text-sm text-muted-foreground">Loading seasons…</div> : null}
      {!loading && items.length === 0 ? <div className="text-sm text-muted-foreground">No active or upcoming seasons</div> : null}
    </section>
  )
}
