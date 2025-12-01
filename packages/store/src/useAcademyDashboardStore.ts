'use client';

import { persist } from 'zustand/middleware';
import { createStore, type StateCreator, type StoreApi } from 'zustand/vanilla';
import { cleanupLegacyStorageKeys, legacyStorageKeyCandidates, resolveScopedStorageKey } from './utils/storage';

import type {
  AcademyCourseGroup,
  AcademyInstructorProfile,
  AcademyInstructorDraft,
  AcademyMemberProgress,
  AcademySummaryStat,
  AcademyTrainingClass,
  AcademyTrainingSession,
  AcademyTrainingSessionDraft,
  AcademyTrainingSessionParticipant,
  AcademyTrainingSessionStatus,
} from './types/academy.ts';

export type AcademyDashboardStoreState = {
  stats: AcademySummaryStat[];
  courseGroups: AcademyCourseGroup[];
  members: AcademyMemberProgress[];
  instructors: AcademyInstructorProfile[];
  trainingClasses: AcademyTrainingClass[];
  sessions: AcademyTrainingSession[];
  setStats: (stats: AcademySummaryStat[]) => void;
  setCourseGroups: (groups: AcademyCourseGroup[]) => void;
  setMembers: (members: AcademyMemberProgress[]) => void;
  setInstructors: (instructors: AcademyInstructorProfile[]) => void;
  addInstructor: (instructor: AcademyInstructorDraft) => AcademyInstructorProfile;
  updateInstructor: (instructorId: string, patch: Partial<AcademyInstructorProfile>) => void;
  removeInstructor: (instructorId: string) => void;
  setTrainingClasses: (trainingClasses: AcademyTrainingClass[]) => void;
  setSessions: (sessions: AcademyTrainingSession[]) => void;
  addTrainingSession: (
    draft: AcademyTrainingSessionDraft,
    overrides?: Partial<
      Omit<AcademyTrainingSession, 'id' | 'seats' | 'start' | 'end' | 'modality' | 'status' | 'title'>
    >,
  ) => AcademyTrainingSession;
  updateTrainingSessionStatus: (sessionId: string, status: AcademyTrainingSessionStatus) => void;
  updateTrainingSession: (sessionId: string, patch: Partial<AcademyTrainingSession>) => void;
  removeTrainingSession: (sessionId: string) => void;
  reset: () => void;
};

export type CreateAcademyDashboardStoreOptions = {
  initialStats?: AcademySummaryStat[];
  initialCourseGroups?: AcademyCourseGroup[];
  initialMembers?: AcademyMemberProgress[];
  initialInstructors?: AcademyInstructorProfile[];
  initialTrainingClasses?: AcademyTrainingClass[];
  initialSessions?: AcademyTrainingSession[];
  persist?: boolean;
  storageKey?: string;
};

type DraftOverrides = Partial<
  Omit<
    AcademyTrainingSession,
    'id' | 'classId' | 'title' | 'start' | 'end' | 'modality' | 'status' | 'seats' | 'relatedTopic'
  >
>;

const globalCrypto: { randomUUID?: () => string } | undefined =
  typeof globalThis !== 'undefined' ? (globalThis as { crypto?: { randomUUID?: () => string } }).crypto : undefined;

function generateId(): string {
  const idGenerator =
    globalCrypto && typeof globalCrypto.randomUUID === 'function' ? globalCrypto.randomUUID.bind(globalCrypto) : null;
  return idGenerator ? idGenerator() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}


function generateInstructorId(): string {
  const idGenerator =
    globalCrypto && typeof globalCrypto.randomUUID === 'function' ? globalCrypto.randomUUID.bind(globalCrypto) : null;
  const suffix = idGenerator ? idGenerator() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `instructor-${suffix}`;
}

function normalizeParticipants(
  participants: AcademyTrainingSessionParticipant[] | undefined,
): AcademyTrainingSessionParticipant[] {
  if (!participants) return [];
  return participants.map((participant) => ({
    ...participant,
    id: participant.id || generateId(),
    understanding: participant.understanding ?? 'building',
    status: participant.status ?? 'confirmed',
  }));
}

function makeSessionFromDraft(
  draft: AcademyTrainingSessionDraft,
  overrides: DraftOverrides = {},
): AcademyTrainingSession {
  const id = generateId();

  return {
    id,
    classId: draft.relatedTopic ?? '',
    title: draft.title,
    start: draft.start,
    end: draft.end,
    modality: draft.modality,
    location: draft.location,
    meetingUrl: overrides.meetingUrl,
    instructorName: overrides.instructorName ?? 'TBD',
    instructorType: overrides.instructorType ?? 'dispatcher',
    status: draft.status,
    seats: {
      capacity: draft.seatsCapacity,
      confirmed: 0,
      waitlist: 0,
    },
    timezone: overrides.timezone,
    relatedTopic: draft.relatedTopic,
    participants: normalizeParticipants(draft.participants),
  };
}

export function createAcademyDashboardStore({
  initialStats = [],
  initialCourseGroups = [],
  initialMembers = [],
  initialInstructors = [],
  initialTrainingClasses = [],
  initialSessions = [],
  persist: shouldPersist = false,
  storageKey,
}: CreateAcademyDashboardStoreOptions = {}): StoreApi<AcademyDashboardStoreState> {
  const BASE_STORAGE_KEY = 'pod-academy-dashboard-store';
  const normalizedInitialSessions = initialSessions.map((session) => ({
    ...session,
    participants: normalizeParticipants(session.participants),
  }));

  const initializer: StateCreator<AcademyDashboardStoreState> = (set) => ({
    stats: initialStats,
    courseGroups: initialCourseGroups,
    members: initialMembers,
    instructors: initialInstructors,
    trainingClasses: initialTrainingClasses,
    sessions: normalizedInitialSessions,
    setStats: (stats) => set({ stats }),
    setCourseGroups: (groups) => set({ courseGroups: groups }),
    setMembers: (members) => set({ members }),
    setInstructors: (instructors) => set({ instructors }),
    addInstructor: (instructor) => {
      const newInstructor: AcademyInstructorProfile = {
        ...instructor,
        id: generateInstructorId(),
        certifications: instructor.certifications ?? [],
        vettingStatus: instructor.vettingStatus ?? 'awaiting_verification',
      };
      set((state) => ({
        instructors: [newInstructor, ...state.instructors],
      }));
      return newInstructor;
    },
    updateInstructor: (instructorId, patch) => {
      set((state) => ({
        instructors: state.instructors.map((instructor) =>
          instructor.id === instructorId
            ? {
                ...instructor,
                ...patch,
                certifications: patch.certifications ?? instructor.certifications,
                vettingStatus: patch.vettingStatus ?? instructor.vettingStatus,
              }
            : instructor,
        ),
      }));
    },
    removeInstructor: (instructorId) => {
      set((state) => ({
        instructors: state.instructors.filter((instructor) => instructor.id !== instructorId),
      }));
    },
    setTrainingClasses: (trainingClasses) => set({ trainingClasses }),
    setSessions: (sessions) =>
      set({
        sessions: sessions.map((session) => ({
          ...session,
          participants: normalizeParticipants(session.participants),
        })),
      }),
    addTrainingSession: (draft, overrides) => {
      const session = makeSessionFromDraft(draft, overrides);
      set((state) => ({
        sessions: [session, ...state.sessions],
      }));
      return session;
    },
    updateTrainingSessionStatus: (sessionId, status) => {
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                status,
              }
            : session,
        ),
      }));
    },
    updateTrainingSession: (sessionId, patch) => {
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                ...patch,
                seats: patch.seats ? { ...session.seats, ...patch.seats } : session.seats,
                participants: patch.participants ? normalizeParticipants(patch.participants) : session.participants,
              }
            : session,
        ),
      }));
    },
    removeTrainingSession: (sessionId) => {
      set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== sessionId),
      }));
    },
    reset: () =>
      set({
        stats: initialStats,
        courseGroups: initialCourseGroups,
        members: initialMembers,
        instructors: initialInstructors,
        trainingClasses: initialTrainingClasses,
        sessions: normalizedInitialSessions,
      }),
  });

  const resolvedStorageKey = resolveScopedStorageKey(BASE_STORAGE_KEY, storageKey);
  cleanupLegacyStorageKeys(resolvedStorageKey, legacyStorageKeyCandidates(BASE_STORAGE_KEY, storageKey));

  if (shouldPersist) {
    return createStore(
      persist(initializer, {
        name: resolvedStorageKey,
      }),
    );
  }

  return createStore(initializer);
}
