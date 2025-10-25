/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { usePodStore } from '@/providers/PodStoreProvider';
import { Button } from '@workspace/ui/components/button';
import { PodAcademyDashboardLayout } from '@workspace/ui/layout/pods/PodAcademyDashboardLayout';
import { COURSE_BLUEPRINT } from '@workspace/ui/data/academy/course-blueprint';
import type { AcademyClass } from '@workspace/store/usePodStore';
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
import { attachCourseStatusToGroups, buildInstructorProfiles, buildTrainingSessions, convertPodsToMemberProgress, deriveStats } from '@/lib/utils';


export default function AcademyDashboardPage() {
  const router = useRouter();
  const pods = usePodStore((state) => state.pods);
  const academyClasses = usePodStore((state) => state.academyClasses);

  const members = useMemo(() => convertPodsToMemberProgress(pods), [pods]);
  const instructors = useMemo(() => buildInstructorProfiles(pods), [pods]);
  const sessions = useMemo(() => buildTrainingSessions(instructors), [instructors]);
  console.log('sessions', sessions);

  const stats = useMemo(() => deriveStats(pods, members, sessions), [pods, members, sessions]);
  const trainingClasses: AcademyTrainingClass[] = useMemo(
    () =>
      academyClasses.map((academyClass: AcademyClass) => ({
        id: academyClass.id,
        title: academyClass.title,
        description: academyClass.description,
        track: academyClass.pathwayLabel,
        modality: academyClass.modality,
        instructorType: academyClass.instructorType,
        durationHours: academyClass.durationHours,
        sessionsScheduled: academyClass.sessionsScheduled,
        nextSession: academyClass.nextSession,
        status: academyClass.status,
      })),
    [academyClasses],
  );

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
      initialInstructors={instructors}
      initialTrainingClasses={trainingClasses}
      initialSessions={sessions}
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
    setInstructors(instructors);
    setTrainingClasses(trainingClasses);
    setSessions(sessions);
  }, [
    courseGroups,
    instructors,
    members,
    sessions,
    setCourseGroups,
    setInstructors,
    setMembers,
    setSessions,
    setStats,
    setTrainingClasses,
    stats,
    trainingClasses,
  ]);

  const storeStats = usePodAcademyDashboardStore((state) => state.stats);
  const storeCourseGroups = usePodAcademyDashboardStore((state) => state.courseGroups);
  const storeMembers = usePodAcademyDashboardStore((state) => state.members);
  const storeInstructors = usePodAcademyDashboardStore((state) => state.instructors);
  const storeTrainingClasses = usePodAcademyDashboardStore((state) => state.trainingClasses);
  const storeSessions = usePodAcademyDashboardStore((state) => state.sessions);

  return (
    <PodAcademyDashboardLayout
      heading={heading}
      stats={storeStats}
      courseGroups={storeCourseGroups}
      members={storeMembers}
      instructors={storeInstructors}
      trainingClasses={storeTrainingClasses}
      sessions={storeSessions}
      onScheduleClass={onScheduleClass}
      onUpdateSessionStatus={updateTrainingSessionStatus}
      onCreateInstructor={(draft) => {
        const instructor = addInstructor(draft);
        console.info('Added instructor', instructor.id);
      }}
      onUpdateInstructor={(instructorId, patch) => {
        updateInstructor(instructorId, patch);
        console.info('Updated instructor', instructorId, patch);
      }}
      onDeleteInstructor={(instructorId) => {
        removeInstructor(instructorId);
        console.info('Removed instructor', instructorId);
      }}
      onCreatePathwayClass={onCreatePathwayClass}
      onCreateTrainingSession={(draft) => {
        const session = addTrainingSession(draft);
        console.info('Created training session', session.id);
      }}
      onUpdateTrainingSession={(sessionId, patch) => {
        patchTrainingSession(sessionId, patch);
        console.info('Updated training session', sessionId, patch);
      }}
      onDeleteTrainingSession={(sessionId) => {
        removeTrainingSession(sessionId);
        console.info('Deleted training session', sessionId);
      }}
    />
  );
}
