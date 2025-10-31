import { persist } from 'zustand/middleware';
import { createStore, type StateCreator } from 'zustand/vanilla';
import { useStore } from 'zustand';
import type { MeetANeed } from './types/meet-a-need';

const DEFAULT_STORAGE_KEY = 'meet-a-need-store';

export interface MeetANeedStoreState {
  needs: MeetANeed[];
  addNeed: (need: MeetANeed) => void;
  updateNeed: (id: string, patch: Partial<MeetANeed>) => void;
  removeNeed: (id: string) => void;
  setAll: (needs: MeetANeed[]) => void;
  clear: () => void;
}

export interface CreateMeetANeedStoreOptions {
  initialNeeds?: MeetANeed[];
  persist?: boolean;
  storageKey?: string;
}

const createInitializer = (initialNeeds: MeetANeed[]): StateCreator<MeetANeedStoreState> => (set) => ({
  needs: initialNeeds,
  addNeed: (need) => set((s) => ({ needs: [need, ...s.needs.filter((n) => n.id !== need.id)] })),
  updateNeed: (id, patch) =>
    set((s) => ({ needs: s.needs.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
  removeNeed: (id) => set((s) => ({ needs: s.needs.filter((n) => n.id !== id) })),
  setAll: (needs) => set({ needs }),
  clear: () => set({ needs: [] }),
});

function withPersistence(initializer: StateCreator<MeetANeedStoreState>, storageKey: string) {
  return persist(initializer, { name: storageKey, version: 1 });
}

export function createMeetANeedStore({
  initialNeeds = [],
  persist: shouldPersist = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: CreateMeetANeedStoreOptions = {}) {
  const initializer = createInitializer(initialNeeds);
  return shouldPersist ? createStore(withPersistence(initializer, storageKey)) : createStore(initializer);
}

const store = createMeetANeedStore();
export const useMeetANeedStore = <T>(selector: (state: MeetANeedStoreState) => T) => useStore(store, selector);

