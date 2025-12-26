import { createStore, type StateCreator } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { useStore } from 'zustand';

import { cleanupLegacyStorageKeys, legacyStorageKeyCandidates, resolveScopedStorageKey } from './utils/storage';

const STORAGE_BASE_KEY = 'intake-draft-index-v1';

export type IntakeDraftIndexItem = {
  id: string;
  caseRef: string;
  lastUpdatedAt: string;
  createdAt: string;
  status: 'wip' | 'submitted';
  submittedAt?: string;
  fullName?: string;
};

export interface IntakeDraftIndexStoreState {
  drafts: IntakeDraftIndexItem[];
  upsertDraft: (item: IntakeDraftIndexItem) => void;
  removeDraft: (id: string) => void;
  clearAll: () => void;
}

const initializer: StateCreator<IntakeDraftIndexStoreState> = (set) => ({
  drafts: [],
  upsertDraft: (item) =>
    set((state) => {
      const existing = state.drafts.find((draft) => draft.id === item.id);
      const next: IntakeDraftIndexItem = existing
        ? {
            ...existing,
            ...item,
            status: item.status ?? existing.status,
            submittedAt: item.submittedAt ?? existing.submittedAt,
            fullName: item.fullName ?? existing.fullName ?? '',
          }
        : { ...item, status: item.status ?? 'wip', fullName: item.fullName ?? '' };
      const others = state.drafts.filter((draft) => draft.id !== item.id);
      return {
        drafts: [next, ...others].sort(
          (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime(),
        ),
      };
    }),
  removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((draft) => draft.id !== id) })),
  clearAll: () => set({ drafts: [] }),
});

function withPersistence(base: StateCreator<IntakeDraftIndexStoreState>) {
  return persist(base, {
    name: resolveScopedStorageKey(STORAGE_BASE_KEY),
    version: 2,
    migrate: (persistedState: any, version) => {
      if (!persistedState) return persistedState;
      const drafts = Array.isArray(persistedState.drafts)
        ? (persistedState.drafts as IntakeDraftIndexItem[])
        : [];
      if (version < 2) {
        return {
          ...persistedState,
          drafts: drafts.map((draft: IntakeDraftIndexItem) => ({
            ...draft,
            fullName: draft?.fullName ?? '',
          })),
        };
      }
      return persistedState;
    },
  });
}

const store = createStore(withPersistence(initializer));

cleanupLegacyStorageKeys(resolveScopedStorageKey(STORAGE_BASE_KEY), legacyStorageKeyCandidates(STORAGE_BASE_KEY));

export function useIntakeDraftIndexStore<T>(selector: (state: IntakeDraftIndexStoreState) => T) {
  return useStore(store, selector);
}

export function getIntakeDraftIndexStore() {
  return store;
}
