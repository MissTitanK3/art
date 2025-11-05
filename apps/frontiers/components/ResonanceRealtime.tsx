"use client"

import * as React from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useProfileStore } from '@/store/useProfileStore'
import { useNotifStore } from '@/store/useNotifStore'
import { toast } from 'sonner'
import { useShipStore } from '@/store/useShipStore'

export function ResonanceRealtime() {
  const profileId = useProfileStore((s) => s.profile?.id ?? null)
  // Keep minimal reactive state; use store getters inside effects to avoid loops
  const lastCheckRef = React.useRef<string | null>(null)

  // Realtime subscription
  React.useEffect(() => {
    if (!profileId) return
    const ch = supabase
      .channel(`resonance_rx_${profileId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'resonance_effects', filter: `recipient_id=eq.${profileId}` }, (payload) => {
        const row: any = payload.new
        if (!row?.id) return
        const seen = useNotifStore.getState().seenPulseIds
        if (seen[row.id]) return
        const who = row.source_email || row.source_id || 'ally'
        toast(`A resonance from ${who} stabilizes your reactor.`)
        // Apply rest boost locally based on normalized strength (0..1)
        try { useShipStore.getState().applyPulse(Math.max(0, Math.min(1, Number(row.strength) || 0))) } catch { }
        useNotifStore.getState().markSeen(row.id)
      })
      .subscribe()
    return () => { try { supabase.removeChannel(ch) } catch { } }
  }, [profileId])

  // 5-minute polling fallback
  React.useEffect(() => {
    if (!profileId) return
    let active = true
    // Initialize from store on effect start
    lastCheckRef.current = useNotifStore.getState().lastCheckAt
    const poll = async () => {
      const since = lastCheckRef.current || new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('resonance_effects')
        .select('id, source_email, source_id, created_at, strength')
        .eq('recipient_id', profileId)
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(50)
      if (!active) return
      for (const row of data || []) {
        const id = (row as any).id
        const seen = useNotifStore.getState().seenPulseIds
        if (seen[id]) continue
        const who = (row as any).source_email || (row as any).source_id || 'ally'
        toast(`A resonance from ${who} stabilizes your reactor.`)
        try { useShipStore.getState().applyPulse(Math.max(0, Math.min(1, Number((row as any).strength) || 0))) } catch { }
        useNotifStore.getState().markSeen(id)
      }
      const nowIso = new Date().toISOString()
      lastCheckRef.current = nowIso
      try { useNotifStore.getState().setLastCheck(nowIso) } catch { }
    }
    poll()
    const t = setInterval(poll, 5 * 60 * 1000)
    return () => { active = false; clearInterval(t) }
  }, [profileId])

  return null
}
