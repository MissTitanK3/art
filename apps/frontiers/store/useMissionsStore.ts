'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Campaign } from '@/schemas/campaigns';

export type Mission = {
  id: string;
  campaign_id: string;
  title?: string | null;
  description?: string | null;
  required_actions?: Record<string, number> | null;
  reward?: any;
};

type MissionProgress = {
  [action: string]: number;
};

type CampaignState = {
  missions: Record<string, Mission>;
  progress: Record<string, MissionProgress>; // mission_id -> action counters
};

type MissionsState = {
  byCampaign: Record<string, CampaignState>;
  lastSyncAt?: number;
  dirty: boolean;
  registerMissions: (campaignId: string, missions: Mission[]) => void;
  recordAction: (campaignId: string, action: string) => void;
  snapshotForSync: (
    profileId: string | null,
  ) => { profile_id: string; campaign_id: string; mission_id: string; progress: any; completed_at: string | null }[];
  markSynced: () => void;
};

export const useMissionsStore = create<MissionsState>()(
  persist(
    (set, get) => ({
      byCampaign: {},
      dirty: false,
      registerMissions: (campaignId, missions) =>
        set((state) => {
          const bucket = state.byCampaign[campaignId] || { missions: {}, progress: {} };
          for (const m of missions) {
            bucket.missions[m.id] = m;
            if (!bucket.progress[m.id]) bucket.progress[m.id] = {};
          }
          // After registration, check completion in case prior actions already satisfy
          setTimeout(() => {
            import('@/store/useAchievementsStore')
              .then((m) => m.useAchievementsStore.getState().checkSeasonComplete(campaignId))
              .catch(() => {});
          }, 0);
          return { byCampaign: { ...state.byCampaign, [campaignId]: bucket } };
        }),
      recordAction: (campaignId, action) =>
        set((state) => {
          const bucket = state.byCampaign[campaignId];
          if (!bucket) return {};
          // increment for any mission in this campaign that requires this action
          const nextProgress = { ...bucket.progress };
          for (const missionId of Object.keys(bucket.missions)) {
            const mission = bucket.missions[missionId];
            if (!mission) continue;
            const required = (mission.required_actions || {}) as Record<string, number>;
            if (required && typeof required[action] === 'number') {
              const cur = nextProgress[missionId] || {};
              nextProgress[missionId] = { ...cur, [action]: (cur[action] || 0) + 1 };
            }
          }
          // After updating, check if campaign is completed for achievements
          setTimeout(() => {
            import('@/store/useAchievementsStore')
              .then((m) => m.useAchievementsStore.getState().checkSeasonComplete(campaignId))
              .catch(() => {});
          }, 0);
          return {
            byCampaign: { ...state.byCampaign, [campaignId]: { ...bucket, progress: nextProgress } },
            dirty: true,
          };
        }),
      snapshotForSync: (profileId) => {
        if (!profileId) return [];
        const res: {
          profile_id: string;
          campaign_id: string;
          mission_id: string;
          progress: any;
          completed_at: string | null;
        }[] = [];
        const now = new Date().toISOString();
        const state = get();
        for (const [campaignId, bucket] of Object.entries(state.byCampaign)) {
          for (const missionId of Object.keys(bucket.missions)) {
            const mission = bucket.missions[missionId];
            if (!mission) continue;
            const prog = bucket.progress[missionId] || {};
            const req = (mission.required_actions || {}) as Record<string, number>;
            // Completed if every required action meets threshold
            let completed = true;
            for (const [k, v] of Object.entries(req)) {
              if ((prog[k] || 0) < (v || 0)) {
                completed = false;
                break;
              }
            }
            res.push({
              profile_id: profileId,
              campaign_id: campaignId,
              mission_id: missionId,
              progress: prog,
              completed_at: completed ? now : null,
            });
          }
        }
        return res;
      },
      markSynced: () => set({ dirty: false, lastSyncAt: Date.now() }),
    }),
    { name: 'frontiers-missions' },
  ),
);
