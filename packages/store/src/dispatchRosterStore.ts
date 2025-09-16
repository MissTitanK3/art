// apps/region-template/store/dispatchRosterStore.ts
'use client';

import { create } from 'zustand';
import { fakeUUID } from '@workspace/ui/lib/utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface DispatchShift {
  id: string;
  podId?: string;
  volunteerId?: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string
  notes?: string;
}

export interface DispatchRosterState {
  shifts: DispatchShift[];
  addShift: (shift: Omit<DispatchShift, 'id'>) => void;
  updateShift: (id: string, updates: Partial<DispatchShift>) => void;
  removeShift: (id: string) => void;
  getActiveShifts: () => DispatchShift[];
  getUpcomingShifts: (hoursAhead?: number) => DispatchShift[];
  getShiftsByVolunteer: (volunteerId: string) => DispatchShift[];
  isShiftActive: (shift: DispatchShift) => boolean;
}

// -----------------------------------------------------------------------------
// Dummy Seed Data
// -----------------------------------------------------------------------------
const now = new Date();
const oneHour = 60 * 60 * 1000;

const dummyShifts: DispatchShift[] = [
  {
    id: 'r1',
    podId: 'c3f7b0dc-6c2a-4a9f-82c5-001',
    volunteerId: 'r1',
    startsAt: new Date(now.getTime() - oneHour).toISOString(),
    endsAt: new Date(now.getTime() + oneHour).toISOString(),
    notes: 'Covering morning dispatch',
  },
  {
    id: fakeUUID(),
    podId: '7d1d1c9f-3a22-47e2-9b0f-002',
    volunteerId: 'r3',
    startsAt: new Date(now.getTime() + oneHour).toISOString(),
    endsAt: new Date(now.getTime() + 3 * oneHour).toISOString(),
    notes: 'Scheduled afternoon shift',
  },
  {
    id: fakeUUID(),
    podId: 'a2b94fbe-91b1-4b6a-9923-003',
    volunteerId: 'r5',
    startsAt: new Date(now.getTime() + 4 * oneHour).toISOString(),
    endsAt: new Date(now.getTime() + 6 * oneHour).toISOString(),
    notes: 'Evening coverage',
  },
];

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------
export const useDispatchRosterStore = create<DispatchRosterState>((set, get) => ({
  shifts: dummyShifts,

  addShift: (shift) =>
    set((state) => ({
      shifts: [
        ...state.shifts,
        {
          ...shift,
          id: fakeUUID(),
        },
      ],
    })),

  updateShift: (id, updates) =>
    set((state) => ({
      shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  removeShift: (id) =>
    set((state) => ({
      shifts: state.shifts.filter((s) => s.id !== id),
    })),

  // Derived "active" calculation
  isShiftActive: (shift) => {
    const now = new Date();
    return new Date(shift.startsAt) <= now && new Date(shift.endsAt) >= now;
  },

  getActiveShifts: () => {
    const now = new Date();
    return get().shifts.filter((s) => new Date(s.startsAt) <= now && new Date(s.endsAt) >= now);
  },

  getUpcomingShifts: (hoursAhead = 24) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    return get()
      .shifts.filter((s) => new Date(s.startsAt) > now && new Date(s.startsAt) <= cutoff)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  },

  getShiftsByVolunteer: (volunteerId) =>
    get()
      .shifts.filter((s) => s.volunteerId === volunteerId)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
}));
