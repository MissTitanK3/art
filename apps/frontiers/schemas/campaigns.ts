// Campaigns (Seasons) table shape for Supabase autocompletion
export type Campaign = {
  id: string
  title: string | null
  region_id: string | null
  start_at: string | null
  end_at: string | null
  summary: string | null
  reward_schema: any | null
  art_link: string | null
  created_at: string | null
}

