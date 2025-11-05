"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createIndexedDBStorage } from './idbStorage'
import { useProfileStore } from './useProfileStore'
import { useMissionsStore } from './useMissionsStore'

export type AchievementDef = {
  id: string
  title: string
  trigger: 'first_repair' | 'first_pulse' | 'rest_streak_7' | 'season_master'
  reward?: { xp?: number; cosmetic?: string; badge?: string }
}

export type Unlocked = { id: string; earnedAt: string }

const DEFINITIONS: AchievementDef[] = [
  { id: 'first_repair', title: 'First Repair', trigger: 'first_repair', reward: { xp: 25, badge: 'wrench' } },
  { id: 'first_pulse', title: 'First Resonance Pulse', trigger: 'first_pulse', reward: { xp: 25, badge: 'wave' } },
  { id: 'rest_streak_7', title: 'Rested 7 Days Straight', trigger: 'rest_streak_7', reward: { xp: 50, badge: 'moon' } },
  { id: 'season_master', title: 'Season Master', trigger: 'season_master', reward: { xp: 100, badge: 'laurel' } },
]

type AchState = {
  unlocked: Record<string, Unlocked>
  stats: {
    repairs: number
    pulses: number
    rest: { lastDate: string | null; streak: number }
    seasonsCompleted: Record<string, boolean> // campaign_id -> true
  }
  list: () => AchievementDef[]
  isUnlocked: (id: string) => boolean
  award: (id: string) => void
  onRepair: () => void
  onPulse: () => void
  onRest: () => void
  checkSeasonComplete: (campaignId: string) => void
}

export const useAchievementsStore = create<AchState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      stats: { repairs: 0, pulses: 0, rest: { lastDate: null, streak: 0 }, seasonsCompleted: {} },
      list: () => DEFINITIONS,
      isUnlocked: (id) => Boolean(get().unlocked[id]),
      award: (id) => {
        if (get().unlocked[id]) return
        const def = DEFINITIONS.find((d) => d.id === id)
        const now = new Date().toISOString()
        // apply reward
        try {
          const xp = def?.reward?.xp || 0
          if (xp > 0) useProfileStore.getState().addEngineeringXp(xp)
        } catch {}
        set((state) => ({ unlocked: { ...state.unlocked, [id]: { id, earnedAt: now } } }))
      },
      onRepair: () => set((state) => {
        const repairs = (state.stats.repairs || 0) + 1
        // award first repair
        if (repairs === 1) setTimeout(() => useAchievementsStore.getState().award('first_repair'), 0)
        return { stats: { ...state.stats, repairs } }
      }),
      onPulse: () => set((state) => {
        const pulses = (state.stats.pulses || 0) + 1
        if (pulses === 1) setTimeout(() => useAchievementsStore.getState().award('first_pulse'), 0)
        return { stats: { ...state.stats, pulses } }
      }),
      onRest: () => set((state) => {
        const today = new Date(); today.setHours(0,0,0,0)
        const last = state.stats.rest.lastDate ? new Date(state.stats.rest.lastDate) : null
        if (last) last.setHours(0,0,0,0)
        let streak = state.stats.rest.streak || 0
        if (!last) {
          streak = 1
        } else {
          const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays === 0) {
            // already counted today; keep streak
          } else if (diffDays === 1) {
            streak = streak + 1
          } else {
            streak = 1
          }
        }
        if (streak >= 7 && !useAchievementsStore.getState().isUnlocked('rest_streak_7')) {
          setTimeout(() => useAchievementsStore.getState().award('rest_streak_7'), 0)
        }
        return { stats: { ...state.stats, rest: { lastDate: today.toISOString(), streak } } }
      }),
      checkSeasonComplete: (campaignId: string) => {
        try {
          const bucket = useMissionsStore.getState().byCampaign[campaignId]
          if (!bucket) return
          const missions = Object.values(bucket.missions)
          if (missions.length === 0) return
          for (const m of missions) {
            const req = (m.required_actions || {}) as Record<string, number>
            const prog = bucket.progress[m.id] || {}
            for (const [k, v] of Object.entries(req)) {
              if ((prog[k] || 0) < (v || 0)) return
            }
          }
          // All missions satisfied
          set((state) => {
            if (state.stats.seasonsCompleted[campaignId]) return {}
            // award once
            setTimeout(() => useAchievementsStore.getState().award('season_master'), 0)
            return { stats: { ...state.stats, seasonsCompleted: { ...state.stats.seasonsCompleted, [campaignId]: true } } }
          })
        } catch {}
      },
    }),
    { name: 'frontiers-achievements', storage: createIndexedDBStorage() }
  )
)

