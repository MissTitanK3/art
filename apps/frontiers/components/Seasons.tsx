"use client"

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Campaign } from '@/schemas/campaigns'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

function daysRemaining(endAt?: string | null) {
  if (!endAt) return null
  const end = new Date(endAt).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function SeasonsRibbon({ regionId }: { regionId?: string | null }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const nowIso = new Date().toISOString()
        let q = supabase
          .from('campaigns')
          .select('*')
          .lte('start_at', nowIso)
          .gte('end_at', nowIso)
          .order('end_at', { ascending: true })

        // Region scoped or global (NULL region_id treated as global)
        if (regionId) {
          q = q.or(`region_id.is.null,region_id.eq.${regionId}`)
        }

        const { data, error } = await q
        if (error) throw error
        setCampaigns(Array.isArray(data) ? (data as Campaign[]) : [])
      } catch {
        setCampaigns([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [regionId])

  const items = useMemo(() => campaigns.slice(0, 3), [campaigns])
  if (loading && items.length === 0) return null
  if (items.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto px-2 sm:px-0">
      {items.map((c) => {
        const remain = daysRemaining(c.end_at)
        return (
          <Card key={c.id} className="px-3 py-2 border-primary/40 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="text-xs">
                <div className="font-semibold leading-tight">{c.title || 'Season'}</div>
                <div className="text-muted-foreground leading-tight">{remain ? `${remain}d left` : ''}</div>
              </div>
              {c.art_link ? (
                <Button asChild variant="link" size="sm" className="px-1">
                  <Link href={c.art_link} target="_blank" rel="noopener noreferrer">Details</Link>
                </Button>
              ) : null}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

