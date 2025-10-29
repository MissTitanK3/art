/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { usePodStore } from '@/providers/PodStoreProvider';
import { Button } from '@workspace/ui/components/button';
import { PodAcademyDashboardLayout } from '@workspace/ui/layout/pods/PodAcademyDashboardLayout';
import { COURSE_BLUEPRINT } from '@workspace/ui/data/academy/course-blueprint';
import type {
  AcademyCourseGroup,
  AcademyInstructorProfile,
  AcademyTrainingClass,
  AcademyTrainingSession,
  AcademySummaryStat,
  AcademyMemberProgress,
} from '@workspace/store/types/academy.ts';
import {
  PodAcademyDashboardStoreProvider,
  usePodAcademyDashboardStore,
} from '@/providers/PodAcademyDashboardStoreProvider';
import { attachCourseStatusToGroups, convertPodsToMemberProgress, deriveStats } from '@/lib/utils';
import type { AcademyTrainingSessionParticipant } from '@workspace/store/types/academy.ts';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase/client';
import { useProfileStore } from '@workspace/store/useProfileStore';


export default function AcademyDashboardPage() {
  const router = useRouter();
  const pods = usePodStore((state) => state.pods);
  // Using Supabase-backed classes; do not pull from local pod store

  const members = useMemo(() => convertPodsToMemberProgress(pods), [pods]);
  const instructors: AcademyInstructorProfile[] = [];
  const sessions: AcademyTrainingSession[] = [];

  const stats = useMemo(() => deriveStats(pods, members, sessions), [pods, members, sessions]);
  const trainingClasses: AcademyTrainingClass[] = [];

  const courseGroups: AcademyCourseGroup[] = useMemo(
    () => attachCourseStatusToGroups(COURSE_BLUEPRINT, members),
    [members],
  );

  const headingCta = (
    <Button asChild variant="outline">
      <a href="https://academy.alwaysreadytools.org" target="_blank" rel="noreferrer">
        Open Academy
      </a>
    </Button>
  );

  const heading = {
    title: 'Dispatch Academy Hub',
    subtitle:
      'Coordinate live classes with mentors and dispatchers while tracking qualification progress in every pod.',
    cta: headingCta,
  };

  return (
    <PodAcademyDashboardStoreProvider
      initialStats={stats}
      initialCourseGroups={courseGroups}
      initialMembers={members}
      initialInstructors={[]}
      initialTrainingClasses={[]}
      initialSessions={[]}
    >
      <AcademyDashboardContent
        heading={heading}
        stats={stats}
        courseGroups={courseGroups}
        members={members}
        instructors={instructors}
        trainingClasses={trainingClasses}
        sessions={sessions}
        onScheduleClass={(classId) => {
          router.push(`/academy/class/${classId}`);
        }}
        onCreatePathwayClass={(pathwayId) => {
          router.push(`/academy/class/${pathwayId}`);
        }}
      />
    </PodAcademyDashboardStoreProvider>
  );
}

type AcademyDashboardContentProps = {
  heading: {
    title: string;
    subtitle: string;
    cta?: React.ReactNode;
  };
  stats: AcademySummaryStat[];
  courseGroups: AcademyCourseGroup[];
  members: AcademyMemberProgress[];
  instructors: AcademyInstructorProfile[];
  trainingClasses: AcademyTrainingClass[];
  sessions: AcademyTrainingSession[];
  onScheduleClass: (classId: string) => void;
  onCreatePathwayClass: (pathwayId: string) => void;
};

function AcademyDashboardContent({
  heading,
  stats,
  courseGroups,
  members,
  instructors,
  trainingClasses,
  sessions,
  onScheduleClass,
  onCreatePathwayClass,
}: AcademyDashboardContentProps) {
  const setStats = usePodAcademyDashboardStore((state) => state.setStats);
  const setCourseGroups = usePodAcademyDashboardStore((state) => state.setCourseGroups);
  const setMembers = usePodAcademyDashboardStore((state) => state.setMembers);
  const setInstructors = usePodAcademyDashboardStore((state) => state.setInstructors);
  const addInstructor = usePodAcademyDashboardStore((state) => state.addInstructor);
  const updateInstructor = usePodAcademyDashboardStore((state) => state.updateInstructor);
  const removeInstructor = usePodAcademyDashboardStore((state) => state.removeInstructor);
  const setTrainingClasses = usePodAcademyDashboardStore((state) => state.setTrainingClasses);
  const setSessions = usePodAcademyDashboardStore((state) => state.setSessions);
  const addTrainingSession = usePodAcademyDashboardStore((state) => state.addTrainingSession);
  const updateTrainingSessionStatus = usePodAcademyDashboardStore(
    (state) => state.updateTrainingSessionStatus,
  );
  const patchTrainingSession = usePodAcademyDashboardStore((state) => state.updateTrainingSession);
  const removeTrainingSession = usePodAcademyDashboardStore((state) => state.removeTrainingSession);

  useEffect(() => {
    setStats(stats);
    setCourseGroups(courseGroups);
    setMembers(members);
  }, [courseGroups, members, setCourseGroups, setMembers, setStats, stats]);

  // Supabase: hydrate sessions + participants and persist changes
  const supabaseSetSessions = usePodAcademyDashboardStore((state) => state.setSessions);
  const supabaseSetInstructors = usePodAcademyDashboardStore((state) => state.setInstructors);
  const supabaseSetClasses = usePodAcademyDashboardStore((state) => state.setTrainingClasses);

  function mapRowToSession(
    row: any,
    participantsBySession: Record<string, AcademyTrainingSessionParticipant[]>,
  ): AcademyTrainingSession {
    const participants = participantsBySession[String(row.id)] ?? [];
    const derivedConfirmed = participants.filter((p) => p.status === 'confirmed').length;
    const derivedWaitlist = participants.filter((p) => p.status === 'waitlist').length;
    const seatsFromDb = (typeof row.seats === 'object' && row.seats !== null) ? row.seats : null;
    const seats = {
      capacity: Number(seatsFromDb?.capacity ?? 0),
      confirmed: Number.isFinite(Number(seatsFromDb?.confirmed)) ? Number(seatsFromDb.confirmed) : derivedConfirmed,
      waitlist: Number.isFinite(Number(seatsFromDb?.waitlist)) ? Number(seatsFromDb.waitlist) : derivedWaitlist,
    } as const;

    return {
      id: String(row.id),
      classId: row.class_id ? String(row.class_id) : '',
      title: String(row.title ?? 'Untitled Session'),
      start: String(row.start),
      end: String(row.end),
      modality: row.modality ?? 'online',
      location: row.location ?? undefined,
      meetingUrl: row.meeting_url ?? undefined,
      instructorName: String(row.instructor_name ?? 'TBD'),
      instructorType: row.instructor_type ?? 'expert',
      status: row.status ?? 'scheduled',
      seats,
      timezone: row.timezone ?? undefined,
      relatedTopic: row.related_topic ?? undefined,
      participants,
    } as AcademyTrainingSession;
  }

  async function fetchSessionsFromDatabase(): Promise<void> {
    try {
      const client = getSupabaseBrowserClient();
      const [{ data: sessions, error: sErr }, { data: participants, error: pErr }] = await Promise.all([
        client.from('academy_sessions').select('*').order('start', { ascending: true }),
        client.from('academy_participants').select('*'),
      ]);
      if (sErr) throw sErr;
      if (pErr) throw pErr;

      const partsBySession: Record<string, AcademyTrainingSessionParticipant[]> = {};
      for (const p of participants ?? []) {
        const sid = String(p.session_id);
        if (!partsBySession[sid]) partsBySession[sid] = [];
        partsBySession[sid].push({
          id: String(p.id),
          name: String(p.name ?? ''),
          signalHandle: p.signal_handle ?? undefined,
          understanding: p.understanding ?? 'building',
          status: p.status ?? 'confirmed',
        });
      }

      const mapped = (sessions ?? []).map((row: any) => mapRowToSession(row, partsBySession));
      supabaseSetSessions(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[AcademyDashboard] supabase fetch sessions error', e);
    }
  }

  useEffect(() => {
    // Hydrate from Supabase; if not configured, safely no-op
    fetchSessionsFromDatabase();
    fetchInstructorsFromDatabase();
    fetchClassesFromDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function persistSessionToDatabase(session: AcademyTrainingSession): Promise<void> {
    try {
      const client = getSupabaseBrowserClient();
      const payload = {
        id: session.id,
        class_id: session.classId && session.classId.length > 0 ? session.classId : null,
        title: session.title,
        start: session.start,
        end: session.end,
        modality: session.modality,
        location: session.location,
        meeting_url: session.meetingUrl,
        instructor_name: session.instructorName,
        instructor_type: session.instructorType,
        status: session.status,
        seats: session.seats,
        timezone: session.timezone,
        related_topic: session.relatedTopic,
      } as const;
      const { error } = await client.from('academy_sessions').upsert(payload);
      if (error) throw error;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[AcademyDashboard] supabase upsert session failed', e);
    }
  }

  async function persistParticipantsForSession(
    sessionId: string,
    participantsList: AcademyTrainingSessionParticipant[],
  ): Promise<void> {
    try {
      const client = getSupabaseBrowserClient();
      // Replace set for simplicity
      const del = await client.from('academy_participants').delete().eq('session_id', sessionId);
      if (del.error) throw del.error;
      if (participantsList.length === 0) return;
      const rows = participantsList.map((p) => ({
        id: p.id,
        session_id: sessionId,
        name: p.name,
        signal_handle: p.signalHandle ?? null,
        understanding: p.understanding,
        status: p.status,
      }));
      const ins = await client.from('academy_participants').insert(rows);
      if (ins.error) throw ins.error;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[AcademyDashboard] supabase replace participants failed', e);
    }
  }

  // Instructors
  function mapRowToInstructor(row: any): AcademyInstructorProfile {
    return {
      id: String(row.id),
      name: String(row.name ?? 'Unknown'),
      type: (row.type ?? 'expert') as AcademyInstructorProfile['type'],
      focus: String(row.focus ?? 'General'),
      availability: (row.availability ?? 'available') as AcademyInstructorProfile['availability'],
      timezone: row.timezone ?? undefined,
      certifications: Array.isArray(row.certifications) ? (row.certifications as any) : [],
      registrationStatus: (row.registration_status ?? 'pending') as any,
      vettingStatus: (row.vetting_status ?? 'awaiting_verification') as any,
    };
  }

  async function fetchInstructorsFromDatabase(): Promise<void> {
    try {
      const client = getSupabaseBrowserClient();
      const { data, error } = await client.from('academy_instructors').select('*');
      if (error) throw error;
      const mapped = (data ?? []).map(mapRowToInstructor);
      supabaseSetInstructors(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[AcademyDashboard] supabase fetch instructors error', e);
    }
  }

  // Classes
  function mapRowToClass(row: any): AcademyTrainingClass {
    return {
      id: String(row.id),
      title: String(row.title ?? ''),
      description: String(row.description ?? ''),
      track: String(row.pathway_label ?? ''),
      modality: (row.modality ?? 'online') as AcademyTrainingClass['modality'],
      instructorType: (row.instructor_type ?? 'dispatcher') as AcademyTrainingClass['instructorType'],
      durationHours: Number(row.duration_hours ?? 0),
      sessionsScheduled: Number(row.sessions_scheduled ?? 0),
      nextSession: row.next_session ?? undefined,
      status: (row.status ?? 'draft') as AcademyTrainingClass['status'],
    };
  }

  async function fetchClassesFromDatabase(): Promise<void> {
    try {
      const client = getSupabaseBrowserClient();
      const { data, error } = await client.from('academy_classes').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      const mapped = (data ?? []).map(mapRowToClass);
      supabaseSetClasses(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[AcademyDashboard] supabase fetch classes error', e);
    }
  }

  const storeStats = usePodAcademyDashboardStore((state) => state.stats);
  const storeCourseGroups = usePodAcademyDashboardStore((state) => state.courseGroups);
  const storeMembers = usePodAcademyDashboardStore((state) => state.members);
  const storeInstructors = usePodAcademyDashboardStore((state) => state.instructors);
  const storeTrainingClasses = usePodAcademyDashboardStore((state) => state.trainingClasses);
  const storeSessions = usePodAcademyDashboardStore((state) => state.sessions);
  const profile = useProfileStore((s) => s.profile);
  const canManageInstructors = profile?.access_role === 'dispatcher_admin';

  return (
    <PodAcademyDashboardLayout
      heading={heading}
      stats={storeStats}
      courseGroups={storeCourseGroups}
      members={storeMembers}
      instructors={storeInstructors}
      trainingClasses={storeTrainingClasses}
      sessions={storeSessions}
      canManageInstructors={canManageInstructors}
      onScheduleClass={onScheduleClass}
      onUpdateSessionStatus={async (sessionId, status) => {
        updateTrainingSessionStatus(sessionId, status);
        try {
          const client = getSupabaseBrowserClient();
          await client.from('academy_sessions').update({ status }).eq('id', sessionId);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.info('[AcademyDashboard] status update local-only (no supabase)', e);
        }
      }}
      onCreateInstructor={async (draft) => {
        // Optimistic create in local store, then persist
        const instructor = addInstructor(draft);
        console.info('Added instructor', instructor.id);
        try {
          const client = getSupabaseBrowserClient();
          const payload = {
            id: instructor.id,
            name: instructor.name,
            type: instructor.type,
            focus: instructor.focus,
            availability: instructor.availability,
            timezone: instructor.timezone ?? null,
            certifications: instructor.certifications ?? [],
            registration_status: instructor.registrationStatus,
            vetting_status: instructor.vettingStatus,
          } as const;
          const { error } = await client.from('academy_instructors').upsert(payload);
          if (error) throw error;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[AcademyDashboard] supabase upsert instructor failed', e);
        }
      }}
      onUpdateInstructor={async (instructorId, patch) => {
        updateInstructor(instructorId, patch);
        console.info('Updated instructor', instructorId, patch);
        try {
          const client = getSupabaseBrowserClient();
          const payload: Record<string, any> = {
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.type !== undefined ? { type: patch.type } : {}),
            ...(patch.focus !== undefined ? { focus: patch.focus } : {}),
            ...(patch.availability !== undefined ? { availability: patch.availability } : {}),
            ...(patch.timezone !== undefined ? { timezone: patch.timezone ?? null } : {}),
            ...(patch.certifications !== undefined ? { certifications: patch.certifications ?? [] } : {}),
            ...(patch.registrationStatus !== undefined
              ? { registration_status: patch.registrationStatus }
              : {}),
            ...(patch.vettingStatus !== undefined ? { vetting_status: patch.vettingStatus } : {}),
          };
          if (Object.keys(payload).length > 0) {
            const { error } = await client.from('academy_instructors').update(payload).eq('id', instructorId);
            if (error) throw error;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[AcademyDashboard] supabase update instructor failed', e);
        }
      }}
      onDeleteInstructor={async (instructorId) => {
        removeInstructor(instructorId);
        console.info('Removed instructor', instructorId);
        try {
          const client = getSupabaseBrowserClient();
          const { error } = await client.from('academy_instructors').delete().eq('id', instructorId);
          if (error) throw error;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('[AcademyDashboard] supabase delete instructor failed', e);
        }
      }}
      onCreatePathwayClass={onCreatePathwayClass}
      onCreateTrainingSession={async (draft) => {
        const session = addTrainingSession(draft);
        console.info('Created training session', session.id);
        await persistSessionToDatabase(session);
        await persistParticipantsForSession(session.id, session.participants ?? []);
      }}
      onUpdateTrainingSession={async (sessionId, patch) => {
        patchTrainingSession(sessionId, patch);
        console.info('Updated training session', sessionId, patch);
        const current = storeSessions.find((s) => s.id === sessionId);
        if (current) {
          const next: AcademyTrainingSession = {
            ...current,
            ...patch,
            seats: patch.seats ? { ...current.seats, ...patch.seats } : current.seats,
            participants: patch.participants ? (patch.participants as AcademyTrainingSessionParticipant[]) : current.participants,
          } as AcademyTrainingSession;
          await persistSessionToDatabase(next);
          if (patch.participants) {
            await persistParticipantsForSession(sessionId, next.participants ?? []);
          }
        }
      }}
      onDeleteTrainingSession={async (sessionId) => {
        removeTrainingSession(sessionId);
        console.info('Deleted training session', sessionId);
        try {
          const client = getSupabaseBrowserClient();
          await client.from('academy_sessions').delete().eq('id', sessionId); // cascade deletes participants
        } catch (e) {
          // eslint-disable-next-line no-console
          console.info('[AcademyDashboard] delete session local-only (no supabase)', e);
        }
      }}
    />
  );
}
