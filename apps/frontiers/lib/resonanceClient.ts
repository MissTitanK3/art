"use client"

import { supabase } from '@/lib/supabaseClient'
import { useProfileStore } from '@/store/useProfileStore'
import { useShipStore } from '@/store/useShipStore'
import { useSeasonStore } from '@/store/useSeasonStore'
import { useMissionsStore } from '@/store/useMissionsStore'
import { useAchievementsStore } from '@/store/useAchievementsStore'

export async function triggerResonance(sourceId: string) {
  const userId = useProfileStore.getState().profile?.id ?? 'anonymous'
  const expires = new Date(Date.now() + 86_400_000).toISOString()
  const { error } = await supabase.from('resonance_effects').insert({
    source_id: sourceId,
    recipient_id: userId,
    hop: 0,
    strength: 1.0,
    expires_at: expires,
  })
  if (!error) {
    // Sending a pulse: small fatigue increase locally
    try { useShipStore.getState().addFatigue(2) } catch {}
    try {
      const active = useSeasonStore.getState().active_campaign_id
      if (active) useMissionsStore.getState().recordAction(active, 'donate')
    } catch {}
    try { useAchievementsStore.getState().onPulse() } catch {}
  }
  return { error }
}
