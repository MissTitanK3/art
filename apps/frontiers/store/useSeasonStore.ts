"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campaign } from '@/schemas/campaigns'

type SeasonState = {
  active_campaign_id: string | null
  active_campaign: Campaign | null
  reward_schema: any | null
  setActiveCampaign: (c: Campaign) => void
  clearActiveCampaign: () => void
}

export const useSeasonStore = create<SeasonState>()(
  persist(
    (set) => ({
      active_campaign_id: null,
      active_campaign: null,
      reward_schema: null,
      setActiveCampaign: (c) => set({ active_campaign_id: c.id, active_campaign: c, reward_schema: c.reward_schema ?? null }),
      clearActiveCampaign: () => set({ active_campaign_id: null, active_campaign: null, reward_schema: null }),
    }),
    { name: 'frontiers-season' }
  )
)

