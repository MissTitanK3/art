import { useStore } from 'zustand';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import { createRouteId } from './persistence/ids';
import { loadIntakeDraft, removeIntakeDraft, saveIntakeDraft } from './persistence/intakeDraftPersistence';
import { listRouteIndexEntries } from './persistence/routeIndex';

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

export function generateIntakeDraftId() {
  return createRouteId('intake');
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
export function createIntakeDraftStore(options?: CreateIntakeDraftStoreOptions): StoreApi<IntakeDraftStoreState> {
  const { initialDraft } = options ?? {};
  const initializer = createIntakeDraftInitializer(initialDraft);
  return createStore<IntakeDraftStoreState>(initializer as any);
}

const singletonStore = createIntakeDraftStore();

type HydrationResult = { draft: IntakeDraft; restored: boolean };

const hydrationPromises = new Map<string, Promise<HydrationResult>>();
const attachedStores = new WeakSet<StoreApi<IntakeDraftStoreState>>();

function attachPersistence(id: string, store: StoreApi<IntakeDraftStoreState>) {
  if (attachedStores.has(store)) return;
  attachedStores.add(store);
  let lastDraft = store.getState().draft;
  void saveIntakeDraft(id, lastDraft);
  store.subscribe((state) => {
    if (state.draft === lastDraft) return;
    lastDraft = state.draft;
    void saveIntakeDraft(id, state.draft);
  });
}

async function hydrateDraft(id: string, store: StoreApi<IntakeDraftStoreState>): Promise<HydrationResult> {
  const record = await loadIntakeDraft(id);
  if (record?.draft) {
    store.setState({ draft: record.draft });
    return { draft: record.draft, restored: true };
  }
  return { draft: store.getState().draft, restored: false };
}

export function ensureIntakeDraftHydrated(id: string) {
  const store = getIntakeDraftStoreFor(id);
  if (!hydrationPromises.has(id)) {
    const promise = hydrateDraft(id, store).then((draft) => {
      attachPersistence(id, store);
      return draft;
    });
    hydrationPromises.set(id, promise);
  }
  return hydrationPromises.get(id)!;
}

export async function initializeIntakeDraft(id: string, seed?: Partial<IntakeDraft>) {
  const store = getIntakeDraftStoreFor(id, { initialDraft: seed });
  const current = store.getState().draft;
  await saveIntakeDraft(id, current);
  attachPersistence(id, store);
  hydrationPromises.set(id, Promise.resolve({ draft: current, restored: true }));
  return current;
}

export async function clearIntakeDraftPersistence() {
  const store = getIntakeDraftStore();
  const nextDraft = createEmptyDraft();
  store.setState({ draft: nextDraft });
  const indexed = await listRouteIndexEntries('intake');
  await Promise.all(indexed.map((entry) => removeIntakeDraft(entry.id)));
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

function resolveScopedKey(id: string) {
  return `${STORAGE_BASE_KEY}:${id}`;
}

export function getIntakeDraftStoreFor(id: string, options?: Omit<CreateIntakeDraftStoreOptions, 'storageKey'>) {
  const resolvedKey = resolveScopedKey(id);
  if (scopedStores.has(resolvedKey)) return scopedStores.get(resolvedKey)!;
  const store = createIntakeDraftStore({ ...options });
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
  store.setState({ draft: nextDraft });
  await removeIntakeDraft(id);
  return nextDraft;
}
