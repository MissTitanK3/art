"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createIndexedDBStorage } from './idbStorage'

type NotifState = {
  seenPulseIds: Record<string, true>
  lastCheckAt: string | null
  markSeen: (id: string) => void
  setLastCheck: (iso: string) => void
  reset: () => void
}

export const useNotifStore = create<NotifState>()(
  persist(
    (set, get) => ({
      seenPulseIds: {},
      lastCheckAt: null,
      markSeen: (id) => {
        const map = { ...get().seenPulseIds, [id]: true as const }
        set({ seenPulseIds: map })
      },
      setLastCheck: (iso) => set({ lastCheckAt: iso }),
      reset: () => set({ seenPulseIds: {}, lastCheckAt: null }),
    }),
    {
      name: 'notif-store',
      storage: createIndexedDBStorage(),
      version: 1,
      partialize: (s) => ({ seenPulseIds: s.seenPulseIds, lastCheckAt: s.lastCheckAt }),
    },
  ),
)

