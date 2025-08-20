// lib/rosterStore.ts
'use client';

import { create } from 'zustand';
import { NormalizedLanguage } from '@workspace/ui/components/client/language/LanguagePicker';
import { FieldRole } from '@workspace/ui/components/client/roles/roles';

export type RosterEntry = {
  id: string;
  podId: string; // 🔑 link roster to a pod
  handle: string;
  role: 'lead' | 'member' | 'trainee';
  status: 'active' | 'inactive' | 'suspended';
  langs: NormalizedLanguage[];
  skills: string;
  fieldRoles: FieldRole[];
};

type RosterState = {
  roster: RosterEntry[];
  addEntry: (entry: RosterEntry) => void;
  updateEntry: (id: string, patch: Partial<RosterEntry>) => void;
  removeEntry: (id: string) => void;
};

const seedRoster: RosterEntry[] = [
  {
    id: 'u-001',
    podId: 'pod-downtown',
    handle: '@amber',
    role: 'lead',
    status: 'active',
    langs: [
      { tag: 'en', display_name: 'English', proficiency: 'fluent' },
      { tag: 'es', display_name: 'Spanish', proficiency: 'fluent' },
    ],
    skills: 'comms, dispatch',
    fieldRoles: ['legal', 'dispatch_aide'],
  },
  {
    id: 'u-002',
    podId: 'pod-downtown',
    handle: '@ben',
    role: 'member',
    status: 'active',
    langs: [{ tag: 'en', display_name: 'English', proficiency: 'fluent' }],
    skills: 'ops',
    fieldRoles: ['logistics', 'vehicle_support'],
  },
];

export const useRosterStore = create<RosterState>((set) => ({
  roster: seedRoster,
  addEntry: (entry) => set((s) => ({ roster: [...s.roster, entry] })),
  updateEntry: (id, patch) =>
    set((s) => ({
      roster: s.roster.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
  removeEntry: (id) => set((s) => ({ roster: s.roster.filter((e) => e.id !== id) })),
}));
