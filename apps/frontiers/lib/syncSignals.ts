import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

export type ImportSignalPayload = {
  source_type: 'dispatch' | 'class' | 'session' | string
  source_id: string
  region_id: string
  title: string
  summary?: string
  tags?: string[]
  expires_at?: string | null
}

const DEFAULT_TTL_DAYS = 14

export async function importSignal(payload: ImportSignalPayload) {
  const now = Date.now()
  const expiresAt = payload.expires_at ?? new Date(now + DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('art_signals')
    .insert({
      source_type: payload.source_type,
      source_id: payload.source_id,
      region_id: payload.region_id,
      title: payload.title,
      summary: payload.summary ?? '',
      tags: payload.tags ?? [],
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cleanupExpiredSignals(daysPastExpiry = 14) {
  const cutoff = new Date(Date.now() - daysPastExpiry * 24 * 60 * 60 * 1000).toISOString()
  const { error } = await supabase.from('art_signals').delete().lt('expires_at', cutoff)
  if (error) throw error
}
