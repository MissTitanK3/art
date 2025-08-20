'use client';

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Dispatch, Id, Pod, Shift, Volunteer } from './types';

type RosterSlice = {
  volunteers: Record<Id, Volunteer>;
  upsertVolunteer: (v: Volunteer) => void;
};

type PodsSlice = {
  pods: Record<Id, Pod>;
  upsertPod: (p: Pod) => void;
};

type ShiftsSlice = {
  shifts: Record<Id, Shift>;
  upsertShift: (s: Shift) => void;
};

type DispatchSlice = {
  dispatches: Record<Id, Dispatch>;
  createDispatch: (d: Omit<Dispatch, 'id' | 'openedAt' | 'status'>) => Id;
  updateDispatch: (id: Id, patch: Partial<Omit<Dispatch, 'id' | 'openedAt'>>) => void;
};

type MetaSlice = {
  __demo: { version: string; scenario?: string };
  resetAll: (scenario?: string) => void;
};

export type AppState = RosterSlice & PodsSlice & ShiftsSlice & DispatchSlice & MetaSlice;

const STORAGE_KEY = 'region-template:v1';

function makeBase(): AppState {
  return {
    volunteers: {},
    pods: {},
    shifts: {},
    dispatches: {},
    upsertVolunteer(v) {
      this.volunteers[v.id] = v;
    },
    upsertPod(p) {
      this.pods[p.id] = p;
    },
    upsertShift(s) {
      this.shifts[s.id] = s;
    },
    createDispatch(d) {
      const id = nanoid();
      this.dispatches[id] = { id, openedAt: new Date().toISOString(), status: 'open', ...d };
      return id;
    },
    updateDispatch(id, patch) {
      const curr = this.dispatches[id];
      if (!curr) return;
      const { /* drop */ id: _x, openedAt: _y, ...safe } = patch as any;
      this.dispatches[id] = { ...curr, ...safe } as Dispatch;
    },
    __demo: { version: '1.0.0' },
    resetAll(scenario) {
      const fresh = makeBase();
      seed(fresh, scenario);
      Object.assign(this, fresh);
    },
  };
}

function seed(s: AppState, scenario?: string) {
  const podId = nanoid();
  s.pods[podId] = { id: podId, name: 'Downtown Pod', area: 'Downtown / Central' };

  const v1 = nanoid(),
    v2 = nanoid(),
    v3 = nanoid();
  s.volunteers[v1] = { id: v1, handle: 'river', langs: ['en'], skills: ['observer'], status: 'active' };
  s.volunteers[v2] = { id: v2, handle: 'luna', langs: ['en', 'es'], skills: ['translator'], status: 'active' };
  s.volunteers[v3] = { id: v3, handle: 'sage', langs: ['en'], skills: ['driver'], status: 'inactive' };

  const d1 = s.createDispatch({ podId, type: 'observation', summary: 'Demo incident' });
  if (scenario === 'busy') s.updateDispatch(d1, { status: 'assigned' });

  const sh = nanoid();
  s.shifts[sh] = {
    id: sh,
    podId,
    startsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notes: 'Patrol near transit hub',
  };
}

const isEphemeral = () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('ephemeral');

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector(
      isEphemeral()
        ? (set, get) => {
            const base = makeBase();
            seed(base);
            return new Proxy(base as AppState, {
              get: (_, k: keyof AppState) => (base as any)[k],
              set: (_, k, v) => (((base as any)[k] = v), true),
            });
          }
        : persist(
            (set, get) => {
              const base = makeBase();
              if (!Object.keys(base.pods).length) seed(base);
              return base as AppState;
            },
            { name: STORAGE_KEY },
          ),
    ),
  ),
);
