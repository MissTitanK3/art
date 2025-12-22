import { useStore } from 'zustand';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import { createJSONStorage, persist } from 'zustand/middleware';
import { cleanupLegacyStorageKeys, legacyStorageKeyCandidates, resolveScopedStorageKey } from './utils/storage';

const STORAGE_BASE_KEY = 'intake-draft-v1';
const scopedStores = new Map<string, StoreApi<IntakeDraftStoreState>>();

export type IntakeStatus = '' | 'detained' | 'missing' | 'transferred' | 'unknown';
export type IntakeUrgency = '' | 'high' | 'medium' | 'low';
export type InterpreterNeeded = '' | 'yes' | 'no';

export type ContactEntry = {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notes: string;
};

export type IntakeDraft = {
  caseRef: string;
  collectorCallSign: string;
  fullName: string;
  aliases: string;
  dateOfBirth: string;
  approximateAge: string;
  gender: string;
  pronouns: string;
  languages: string;
  lastSeenDateTime: string;
  lastSeenLocation: string;
  agency: string;
  reasonGiven: string;
  currentStatus: IntakeStatus;
  urgency: IntakeUrgency;
  physicalDescription: string;
  lastKnownFacility: string;
  lastKnownCity: string;
  aNumber: string;
  familyContacts: ContactEntry[];
  witnessContacts: ContactEntry[];
  belongings: string;
  dependents: string;
  interpreterNeeded: InterpreterNeeded;
  notes: string;
  isSubmitted: boolean;
  submittedAt: string;
  lastUpdatedAt: string;
};

export type IntakeDraftStoreState = {
  draft: IntakeDraft;
  updateField: <K extends keyof IntakeDraft>(field: K, value: IntakeDraft[K]) => void;
  overwriteDraft: (next: IntakeDraft) => void;
  markSubmitted: () => void;
  reset: () => void;
};

export interface CreateIntakeDraftStoreOptions {
  initialDraft?: Partial<IntakeDraft>;
  storageKey?: string;
  persist?: boolean;
}

function createContactEntry(seed?: Partial<ContactEntry>): ContactEntry {
  const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: seed?.id ?? id,
    name: '',
    phone: '',
    relation: '',
    notes: '',
    ...seed,
  };
}

function normalizeContacts(value?: ContactEntry[] | string): ContactEntry[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => createContactEntry(entry));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? [createContactEntry({ name: trimmed })] : [];
  }
  return [];
}

function nowIso() {
  return new Date().toISOString();
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

export function generateCaseRef(seed = new Date()) {
  const year = seed.getFullYear();
  const month = pad(seed.getMonth() + 1);
  const day = pad(seed.getDate());
  const hours = pad(seed.getHours());
  const minutes = pad(seed.getMinutes());
  return `IWIP-${year}${month}${day}-${hours}${minutes}`;
}

function createEmptyDraft(): IntakeDraft {
  const createdAt = nowIso();
  return {
    caseRef: generateCaseRef(),
    collectorCallSign: '',
    fullName: '',
    aliases: '',
    dateOfBirth: '',
    approximateAge: '',
    gender: '',
    pronouns: '',
    languages: '',
    lastSeenDateTime: '',
    lastSeenLocation: '',
    agency: '',
    reasonGiven: '',
    currentStatus: '',
    urgency: '',
    physicalDescription: '',
    lastKnownFacility: '',
    lastKnownCity: '',
    aNumber: '',
    familyContacts: [],
    witnessContacts: [],
    belongings: '',
    dependents: '',
    interpreterNeeded: '',
    notes: '',
    isSubmitted: false,
    submittedAt: '',
    lastUpdatedAt: createdAt,
  };
}

type IntakeDraftInitializer = StateCreator<IntakeDraftStoreState, [], [], IntakeDraftStoreState>;

type IntakeDraftPersistedInitializer = StateCreator<
  IntakeDraftStoreState,
  [],
  [['zustand/persist', unknown]],
  IntakeDraftStoreState
>;

const createIntakeDraftInitializer =
  (seedDraft?: Partial<IntakeDraft>): IntakeDraftInitializer =>
  (set) => ({
    draft: seedDraft
      ? {
          ...createEmptyDraft(),
          ...seedDraft,
          familyContacts: normalizeContacts(seedDraft.familyContacts),
          witnessContacts: normalizeContacts(seedDraft.witnessContacts),
          caseRef: seedDraft.caseRef?.length ? seedDraft.caseRef : generateCaseRef(),
          isSubmitted: seedDraft.isSubmitted ?? false,
          submittedAt: seedDraft.submittedAt ?? '',
          lastUpdatedAt: seedDraft.lastUpdatedAt ?? nowIso(),
        }
      : createEmptyDraft(),
    updateField: (field, value) =>
      set((state) => {
        if (state.draft.isSubmitted) return state;
        return {
          draft: {
            ...state.draft,
            [field]: value,
            lastUpdatedAt: nowIso(),
          },
        };
      }),
    overwriteDraft: (next) =>
      set(() => {
        const fallback = createEmptyDraft();
        return {
          draft: {
            ...fallback,
            ...next,
            caseRef: next.caseRef?.length ? next.caseRef : fallback.caseRef,
            lastUpdatedAt: next.lastUpdatedAt ?? nowIso(),
          },
        };
      }),
    markSubmitted: () =>
      set((state) => {
        if (state.draft.isSubmitted) return state;
        const submittedAt = nowIso();
        return {
          draft: {
            ...state.draft,
            isSubmitted: true,
            submittedAt,
            lastUpdatedAt: submittedAt,
          },
        };
      }),
    reset: () => set({ draft: createEmptyDraft() }),
  });

function withPersistence(initializer: IntakeDraftInitializer, storageKey: string): IntakeDraftPersistedInitializer {
  return persist(initializer, {
    name: storageKey,
    version: 1,
    storage: createJSONStorage(() => localStorage),
  });
}

export function createIntakeDraftStore(options?: CreateIntakeDraftStoreOptions): StoreApi<IntakeDraftStoreState> {
  const { initialDraft, storageKey, persist: shouldPersist = true } = options ?? {};
  const initializer = createIntakeDraftInitializer(initialDraft);
  const resolvedKey = resolveScopedStorageKey(STORAGE_BASE_KEY, storageKey);
  cleanupLegacyStorageKeys(resolvedKey, legacyStorageKeyCandidates(STORAGE_BASE_KEY, storageKey));
  const creator = shouldPersist ? withPersistence(initializer, resolvedKey) : initializer;
  return createStore<IntakeDraftStoreState>(creator as any);
}

const singletonStore = createIntakeDraftStore();

export async function clearIntakeDraftPersistence() {
  const store = getIntakeDraftStore();
  const nextDraft = createEmptyDraft();
  const persistApi = (store as any).persist;

  store.setState({ draft: nextDraft });

  if (persistApi?.clearStorage) {
    try {
      await persistApi.clearStorage();
    } catch {
      // Ignore storage clearance failures (private mode, etc.)
    }
  }
  persistApi?.rehydrate?.();

  return nextDraft;
}

export function useIntakeDraftStore<T>(
  selector: (state: IntakeDraftStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  return useStore(singletonStore, selector, equalityFn);
}

export function getIntakeDraftStore() {
  return singletonStore;
}

function resolveScopedKey(id: string, override?: string) {
  return resolveScopedStorageKey(`${STORAGE_BASE_KEY}:${id}`, override);
}

export function getIntakeDraftStoreFor(id: string, options?: Omit<CreateIntakeDraftStoreOptions, 'storageKey'>) {
  const resolvedKey = resolveScopedKey(id);
  if (scopedStores.has(resolvedKey)) return scopedStores.get(resolvedKey)!;
  const store = createIntakeDraftStore({ ...options, storageKey: resolvedKey });
  scopedStores.set(resolvedKey, store);
  return store;
}

export function useIntakeDraftStoreFor<T>(
  id: string,
  selector: (state: IntakeDraftStoreState) => T,
  equalityFn?: (a: T, b: T) => boolean,
) {
  const store = getIntakeDraftStoreFor(id);
  return useStore(store, selector, equalityFn);
}

export async function clearIntakeDraftPersistenceById(id: string) {
  const store = getIntakeDraftStoreFor(id);
  const nextDraft = createEmptyDraft();
  const persistApi = (store as any).persist;

  store.setState({ draft: nextDraft });

  if (persistApi?.clearStorage) {
    try {
      await persistApi.clearStorage();
    } catch {
      // Ignore storage clearance failures (private mode, etc.)
    }
  }
  persistApi?.rehydrate?.();

  return nextDraft;
}
