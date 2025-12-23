import { useStore } from 'zustand';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';

import { createRouteId } from './persistence/ids';
import {
  loadRegionResponseSession,
  removeRegionResponseSession,
  saveRegionResponseSession,
} from './persistence/regionResponsePersistence';
import { listRouteIndexEntries } from './persistence/routeIndex';

export type SafetyStatus = 'en-route' | 'on-site' | 'leaving' | 'safe' | 'unable';

export type SituationGeneralStatus = 'calm' | 'active' | 'escalating' | 'resolved';
export type TernaryChoice = 'yes' | 'no' | 'unknown';
export type LocationCondition = 'normal' | 'restricted' | 'disrupted' | '';
export type SafetyConcernLevel = 'none' | 'low' | 'high' | '';

export type SafetyCheckIn = {
  id: string;
  status: SafetyStatus;
  recordedAt: string;
};

export type SituationUpdateInput = {
  observedAt?: string;
  generalStatus: SituationGeneralStatus;
  assistanceNeeded: TernaryChoice;
  authoritiesPresent: TernaryChoice;
  publicAffected: TernaryChoice;
  locationCondition?: LocationCondition;
  safetyConcern?: SafetyConcernLevel;
  notes?: string;
  summary?: string;
  assistanceDetail?: string;
  authoritiesDetail?: string;
  publicImpactDetail?: string;
  locationDetail?: string;
  safetyDetail?: string;
  additionalNotes?: string;
};

export type SituationUpdate = SituationUpdateInput & {
  id: string;
  observedAt: string;
  recordedAt: string;
};

export type RegionResponseSession = {
  id: string;
  responseRef: string;
  startedAt: string;
  lastUpdatedAt: string;
  checkIns: SafetyCheckIn[];
  situationUpdates: SituationUpdate[];
};

export type RegionResponseHistoryItem =
  | { kind: 'safety-check'; entry: SafetyCheckIn }
  | { kind: 'situation-update'; entry: SituationUpdate };

export interface RegionResponseStoreState {
  sessions: Record<string, RegionResponseSession>;
  activeId: string | null;
  startSession: (seedDate?: Date) => Promise<RegionResponseSession>;
  hydrateSession: (id: string) => Promise<RegionResponseSession | null>;
  setActive: (id: string | null) => void;
  clearSession: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  recordCheckIn: (sessionId: string, status: SafetyStatus, recordedAt?: string) => SafetyCheckIn | null;
  addSituationUpdate: (sessionId: string, input: SituationUpdateInput) => SituationUpdate | null;
  updateSituationUpdate: (sessionId: string, updateId: string, input: SituationUpdateInput) => SituationUpdate | null;
  deleteHistoryItem: (sessionId: string, item: RegionResponseHistoryItem) => boolean;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function nowIso() {
  return new Date().toISOString();
}

export function generateResponseRef(seed = new Date()) {
  const year = seed.getFullYear();
  const month = pad(seed.getMonth() + 1);
  const day = pad(seed.getDate());
  const hours = pad(seed.getHours());
  const minutes = pad(seed.getMinutes());
  return `RR-${year}${month}${day}-${hours}${minutes}`;
}

function createEmptySession(seed = new Date()): RegionResponseSession {
  const responseRef = generateResponseRef(seed);
  const nonce = createRouteId('region-response').split('-').pop() ?? 'local';
  const id = `${responseRef}-${nonce}`;
  const startedAt = seed.toISOString();
  return {
    id,
    responseRef,
    startedAt,
    lastUpdatedAt: startedAt,
    checkIns: [],
    situationUpdates: [],
  };
}

export function formatLocalDateTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function formatSafetyStatus(value: SafetyStatus) {
  switch (value) {
    case 'en-route':
      return 'En route';
    case 'on-site':
      return 'On site';
    case 'leaving':
      return 'Leaving area';
    case 'safe':
      return 'Safe at home';
    case 'unable':
      return 'Unable to continue';
    default:
      return value;
  }
}

export function formatGeneralStatus(value: SituationGeneralStatus) {
  switch (value) {
    case 'calm':
      return 'Calm';
    case 'active':
      return 'Active';
    case 'escalating':
      return 'Escalating';
    case 'resolved':
      return 'Resolved';
    default:
      return value;
  }
}

export function formatTernary(value: TernaryChoice) {
  switch (value) {
    case 'yes':
      return 'Yes';
    case 'no':
      return 'No';
    default:
      return 'Unknown';
  }
}

export function formatLocationCondition(value?: LocationCondition) {
  switch (value) {
    case 'normal':
      return 'Normal';
    case 'restricted':
      return 'Restricted';
    case 'disrupted':
      return 'Disrupted';
    default:
      return '';
  }
}

export function formatSafetyConcern(value?: SafetyConcernLevel) {
  switch (value) {
    case 'none':
      return 'None';
    case 'low':
      return 'Low';
    case 'high':
      return 'High';
    default:
      return '';
  }
}

function createHistoryItems(session: RegionResponseSession): RegionResponseHistoryItem[] {
  const history: RegionResponseHistoryItem[] = [
    ...session.checkIns.map<RegionResponseHistoryItem>((entry) => ({ kind: 'safety-check', entry })),
    ...session.situationUpdates.map<RegionResponseHistoryItem>((entry) => ({ kind: 'situation-update', entry })),
  ];
  return history.sort((a, b) => {
    const aTime = a.kind === 'safety-check' ? a.entry.recordedAt : a.entry.observedAt;
    const bTime = b.kind === 'safety-check' ? b.entry.recordedAt : b.entry.observedAt;
    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });
}

function buildSafetyCheckDetails(entry: SafetyCheckIn) {
  return [`Status: ${formatSafetyStatus(entry.status)}`].join('\n');
}

function buildSituationUpdateDetails(entry: SituationUpdate) {
  const lines = [
    `General Status: ${formatGeneralStatus(entry.generalStatus)}`,
    `Assistance Needed: ${formatTernary(entry.assistanceNeeded)}`,
    `Authorities Present: ${formatTernary(entry.authoritiesPresent)}`,
    `Public Affected: ${formatTernary(entry.publicAffected)}`,
  ];

  const location = formatLocationCondition(entry.locationCondition);
  if (location) lines.push(`Location Condition: ${location}`);
  const concern = formatSafetyConcern(entry.safetyConcern);
  if (concern) lines.push(`Safety Concerns: ${concern}`);
  const addLine = (label: string, value?: string) => {
    if (value?.trim()) lines.push(`${label}: ${value.trim()}`);
  };
  addLine('Summary', entry.summary);
  addLine('Assistance Detail', entry.assistanceDetail);
  addLine('Authorities Detail', entry.authoritiesDetail);
  addLine('Public Impact', entry.publicImpactDetail);
  addLine('Location Detail', entry.locationDetail);
  addLine('Safety Detail', entry.safetyDetail);
  addLine('Notes', entry.notes);
  addLine('Additional Notes', entry.additionalNotes);

  return lines.join('\n');
}

export function buildIndividualUpdateCopy(session: RegionResponseSession, item: RegionResponseHistoryItem) {
  const isCheck = item.kind === 'safety-check';
  const time = isCheck ? item.entry.recordedAt : item.entry.observedAt;
  const detailText = isCheck
    ? buildSafetyCheckDetails(item.entry as SafetyCheckIn)
    : buildSituationUpdateDetails(item.entry as SituationUpdate);

  return `[REGION RESPONSE UPDATE]\n\nResponse Ref: ${session.responseRef}\nType: ${
    isCheck ? 'Safety Check' : 'Situation Update'
  }\nTime: ${formatLocalDateTime(time)}\n\nDetails:\n${detailText}`;
}

export function buildResponseSummary(session: RegionResponseSession) {
  const checkIns = [...session.checkIns]
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .map((entry) => `• ${formatLocalDateTime(entry.recordedAt)} – ${formatSafetyStatus(entry.status)}`)
    .join('\n');

  const updates = [...session.situationUpdates]
    .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime())
    .map((entry) => {
      const lines = [
        `• ${formatLocalDateTime(entry.observedAt)}`,
        `  • Status: ${formatGeneralStatus(entry.generalStatus)}`,
        `  • Assist: ${formatTernary(entry.assistanceNeeded)}`,
        `  • Authorities: ${formatTernary(entry.authoritiesPresent)}`,
        `  • Public: ${formatTernary(entry.publicAffected)}`,
      ];
      const location = formatLocationCondition(entry.locationCondition);
      if (location) lines.push(`  • Location: ${location}`);
      const concern = formatSafetyConcern(entry.safetyConcern);
      if (concern) lines.push(`  • Safety: ${concern}`);
      if (entry.notes?.trim()) lines.push(`  • Notes: ${entry.notes.trim()}`);
      return lines.join('\n');
    })
    .join('\n');

  return `[REGION RESPONSE SUMMARY]\n\nResponse Ref: ${session.responseRef}\nStarted At: ${formatLocalDateTime(
    session.startedAt,
  )}\nLast Updated: ${formatLocalDateTime(session.lastUpdatedAt)}\n\nSAFETY CHECK-INS\n${
    checkIns || ''
  }\n\nSITUATION UPDATES\n${updates || ''}\n\nEND OF SUMMARY`;
}

async function persistSessionSnapshot(session: RegionResponseSession) {
  await saveRegionResponseSession(session);
}

async function persistSessionById(get: () => RegionResponseStoreState, sessionId: string) {
  const current = get().sessions[sessionId];
  if (current) {
    await persistSessionSnapshot(current);
  }
}

const createRegionResponseInitializer: StateCreator<RegionResponseStoreState> = (set, get) => ({
  sessions: {},
  activeId: null,
  startSession: async (seedDate) => {
    const session = createEmptySession(seedDate ?? new Date());
    set((state) => ({
      sessions: { ...state.sessions, [session.id]: session },
      activeId: session.id,
    }));
    await persistSessionSnapshot(session);
    return session;
  },
  hydrateSession: async (id) => {
    const cached = get().sessions[id];
    if (cached) return cached;
    const record = await loadRegionResponseSession(id);
    if (!record) return null;
    set((state) => ({
      sessions: { ...state.sessions, [record.id]: record },
      activeId: state.activeId ?? record.id,
    }));
    return record;
  },
  setActive: (id) => set({ activeId: id }),
  clearSession: async (id) => {
    set((state) => {
      if (!state.sessions[id]) return state;
      const nextSessions = { ...state.sessions };
      delete nextSessions[id];
      const nextActive = state.activeId === id ? null : state.activeId;
      return { sessions: nextSessions, activeId: nextActive };
    });
    await removeRegionResponseSession(id);
  },
  clearAll: async () => {
    const ids = new Set<string>(Object.keys(get().sessions));
    const indexed = await listRouteIndexEntries('region-response');
    for (const entry of indexed) ids.add(entry.id);
    set({ sessions: {}, activeId: null });
    await Promise.all(Array.from(ids).map((id) => removeRegionResponseSession(id)));
  },
  recordCheckIn: (sessionId, status, recordedAt) => {
    if (!status) return null;
    const id = `check_${Date.now()}`;
    const timestamp = recordedAt ?? nowIso();
    let recorded: SafetyCheckIn | null = null;
    set((state) => {
      const target = state.sessions[sessionId];
      if (!target) return state;
      recorded = { id, status, recordedAt: timestamp };
      const updated: RegionResponseSession = {
        ...target,
        checkIns: [...target.checkIns, recorded],
        lastUpdatedAt: nowIso(),
      };
      return {
        sessions: { ...state.sessions, [sessionId]: updated },
      };
    });
    void persistSessionById(get, sessionId);
    return recorded;
  },
  addSituationUpdate: (sessionId, input) => {
    if (!input?.generalStatus) return null;
    const id = `update_${Date.now()}`;
    const observedAt = input.observedAt?.length ? input.observedAt : nowIso();
    const recordedAt = nowIso();
    let recorded: SituationUpdate | null = null;
    set((state) => {
      const target = state.sessions[sessionId];
      if (!target) return state;
      recorded = {
        id,
        observedAt,
        recordedAt,
        generalStatus: input.generalStatus,
        assistanceNeeded: input.assistanceNeeded,
        authoritiesPresent: input.authoritiesPresent,
        publicAffected: input.publicAffected,
        locationCondition: input.locationCondition ?? '',
        safetyConcern: input.safetyConcern ?? '',
        notes: input.notes?.trim() ?? '',
        summary: input.summary?.trim() ?? '',
        assistanceDetail: input.assistanceDetail?.trim() ?? '',
        authoritiesDetail: input.authoritiesDetail?.trim() ?? '',
        publicImpactDetail: input.publicImpactDetail?.trim() ?? '',
        locationDetail: input.locationDetail?.trim() ?? '',
        safetyDetail: input.safetyDetail?.trim() ?? '',
        additionalNotes: input.additionalNotes?.trim() ?? '',
      };
      const updated: RegionResponseSession = {
        ...target,
        situationUpdates: [...target.situationUpdates, recorded],
        lastUpdatedAt: recordedAt,
      };
      return {
        sessions: { ...state.sessions, [sessionId]: updated },
      };
    });
    void persistSessionById(get, sessionId);
    return recorded;
  },
  updateSituationUpdate: (sessionId, updateId, input) => {
    if (!input?.generalStatus) return null;
    const recordedAt = nowIso();
    let updatedEntry: SituationUpdate | null = null;
    set((state) => {
      const target = state.sessions[sessionId];
      if (!target) return state;
      const index = target.situationUpdates.findIndex((entry) => entry.id === updateId);
      if (index === -1) return state;
      const existing = target.situationUpdates[index];
      if (!existing) return state;
      const observedAt = input.observedAt?.length ? input.observedAt : existing.observedAt;
      const nextEntry: SituationUpdate = {
        ...existing,
        observedAt,
        generalStatus: input.generalStatus,
        assistanceNeeded: input.assistanceNeeded,
        authoritiesPresent: input.authoritiesPresent,
        publicAffected: input.publicAffected,
        locationCondition: input.locationCondition ?? '',
        safetyConcern: input.safetyConcern ?? '',
        notes: input.notes?.trim() ?? '',
        summary: input.summary?.trim() ?? '',
        assistanceDetail: input.assistanceDetail?.trim() ?? '',
        authoritiesDetail: input.authoritiesDetail?.trim() ?? '',
        publicImpactDetail: input.publicImpactDetail?.trim() ?? '',
        locationDetail: input.locationDetail?.trim() ?? '',
        safetyDetail: input.safetyDetail?.trim() ?? '',
        additionalNotes: input.additionalNotes?.trim() ?? '',
      };
      updatedEntry = nextEntry;
      const nextUpdates = [...target.situationUpdates];
      nextUpdates[index] = nextEntry;
      const updatedSession: RegionResponseSession = {
        ...target,
        situationUpdates: nextUpdates,
        lastUpdatedAt: recordedAt,
      };
      return { sessions: { ...state.sessions, [sessionId]: updatedSession } };
    });
    void persistSessionById(get, sessionId);
    return updatedEntry;
  },
  deleteHistoryItem: (sessionId, item) => {
    let deleted = false;
    set((state) => {
      const target = state.sessions[sessionId];
      if (!target) return state;
      if (item.kind === 'safety-check') {
        const nextCheckIns = target.checkIns.filter((entry) => entry.id !== item.entry.id);
        if (nextCheckIns.length === target.checkIns.length) return state;
        deleted = true;
        const updatedSession: RegionResponseSession = {
          ...target,
          checkIns: nextCheckIns,
          lastUpdatedAt: nowIso(),
        };
        return { sessions: { ...state.sessions, [sessionId]: updatedSession } };
      }
      const nextUpdates = target.situationUpdates.filter((entry) => entry.id !== item.entry.id);
      if (nextUpdates.length === target.situationUpdates.length) return state;
      deleted = true;
      const updatedSession: RegionResponseSession = {
        ...target,
        situationUpdates: nextUpdates,
        lastUpdatedAt: nowIso(),
      };
      return { sessions: { ...state.sessions, [sessionId]: updatedSession } };
    });
    if (deleted) void persistSessionById(get, sessionId);
    return deleted;
  },
});

const regionResponseStore: StoreApi<RegionResponseStoreState> = createStore(createRegionResponseInitializer);

export function useRegionResponseStore<T>(selector: (state: RegionResponseStoreState) => T) {
  return useStore(regionResponseStore, selector);
}

export function getRegionResponseStore() {
  return regionResponseStore;
}

export async function hydrateRegionResponseSession(id: string) {
  return regionResponseStore.getState().hydrateSession(id);
}

export function getRegionResponseHistory(session: RegionResponseSession | null) {
  if (!session) return [] as RegionResponseHistoryItem[];
  return createHistoryItems(session);
}

export function getSessionsList(sessions: Record<string, RegionResponseSession>) {
  return Object.values(sessions).sort(
    (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime(),
  );
}
