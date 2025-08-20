'use client';

import { create } from 'zustand';

export type Channel = 'Signal' | 'Matrix' | 'LoRa';

export type Pod = {
  id: string;
  slug: string;
  name: string;
  area: string;
  channel: Channel;
  channelLink?: string;
};

type PodState = {
  pods: Pod[];
  addPod: (pod: Pod) => void;
  updatePod: (id: string, patch: Partial<Pod>) => void;
  removePod: (id: string) => void;
};

const seedPods: Pod[] = [
  {
    id: 'c3f7b0dc-6c2a-4a9f-82c5-001',
    slug: 'pod-downtown',
    name: 'Downtown',
    area: 'Core & East Bay',
    channel: 'Signal',
    channelLink: 'https://signal.group/#CjQKICdowntown_public_recruiting_placeholder',
  },
  {
    id: '7d1d1c9f-3a22-47e2-9b0f-002',
    slug: 'pod-westside',
    name: 'Westside',
    area: 'West District',
    channel: 'Matrix',
    channelLink: 'https://matrix.to/#/#westside-public:example.org',
  },
  {
    id: 'a2b94fbe-91b1-4b6a-9923-003',
    slug: 'pod-hilltop',
    name: 'Hilltop',
    area: 'North Ridge',
    channel: 'LoRa',
  },
];

export const usePodStore = create<PodState>((set) => ({
  pods: seedPods,
  addPod: (pod) => set((s) => ({ pods: [...s.pods, pod] })),
  updatePod: (id, patch) =>
    set((s) => ({
      pods: s.pods.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removePod: (id) => set((s) => ({ pods: s.pods.filter((p) => p.id !== id) })),
}));
