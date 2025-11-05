// Art signals table shape for Supabase autocompletion
export type ArtSignal = {
  id: string
  source_id?: string
  source_type: string
  region_id: string
  sector_code?: string
  title: string
  summary: string
  tags?: string[]
  created_at: string // ISO timestamp
  expires_at: string | null // ISO timestamp or null
  is_discovered?: boolean
}
