/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { usePodStore } from '@/providers/PodStoreProvider';
import { Button } from '@workspace/ui/components/button';
import {
  PodAcademyDashboardLayout,
  type AcademyCourseGroup,
  type AcademyInstructorProfile,
  type AcademyMemberProgress,
  type AcademySummaryStat,
  type AcademyTrainingClass,
  type AcademyTrainingSession,
} from '@workspace/ui/layout/pods/PodAcademyDashboardLayout';
import { COURSE_BLUEPRINT } from '@workspace/ui/data/academy/course-blueprint';
import type { NormalizedCertification, Pod } from '@workspace/store/types/pod.ts';
import type { AcademyClass } from '@workspace/store/usePodStore';


function determineCourseStatus(
  certId: string | undefined,
  memberProgress: AcademyMemberProgress[],
): 'completed' | 'in_progress' | 'review' | 'not_started' {
  if (!certId) {
    return 'not_started';
  }

  let completed = 0;
  let inProgress = 0;
  let expired = 0;

  for (const member of memberProgress) {
    for (const cert of member.certifications) {
      if (cert.id !== certId) continue;
      if (cert.level === 'completed' || cert.level === 'mentor') {
        completed += 1;
      } else if (cert.level === 'expired') {
        expired += 1;
      } else if (cert.level === 'in_progress') {
        inProgress += 1;
      }
    }
  }

  if (expired > 0) return 'review';
  if (completed > 0 && completed >= Math.max(1, Math.round(memberProgress.length * 0.6))) {
    return 'completed';
  }
  if (completed > 0 || inProgress > 0) {
    return 'in_progress';
  }
  return 'not_started';
}

function deriveStats(
  pods: Pod[],
  members: AcademyMemberProgress[],
  sessions: AcademyTrainingSession[],
): AcademySummaryStat[] {
  const totalPods = pods.length;
  const totalMembers = members.length;
  const fullyCertified = members.filter((member) =>
    member.certifications.length > 0 &&
    member.certifications.every((cert) => cert.level === 'completed' || cert.level === 'mentor'),
  ).length;
  const activelyTraining = members.filter((member) =>
    member.certifications.some((cert) => cert.level === 'in_progress'),
  ).length;
  const mentors = members.filter((member) =>
    member.certifications.some((cert) => cert.level === 'mentor'),
  ).length;
  const scheduledSessions = sessions.filter((session) => session.status !== 'completed').length;
  const completedSessions = sessions.filter((session) => session.status === 'completed').length;

  return [
    {
      label: 'Active Volunteers',
      value: String(totalMembers),
      helper: `Across ${totalPods} pods`,
    },
    {
      label: 'Fully Certified',
      value: `${fullyCertified}`,
      helper: `${Math.round(totalMembers === 0 ? 0 : (fullyCertified / totalMembers) * 100)}% of roster`,
    },
    {
      label: 'In Qualification',
      value: `${activelyTraining}`,
      helper: 'Currently taking academy modules',
    },
    {
      label: 'Sessions Scheduled',
      value: `${scheduledSessions}`,
      helper: `${completedSessions} completed · ${mentors} mentors guiding`,
    },
  ];
}

function convertPodsToMemberProgress(pods: Pod[]): AcademyMemberProgress[] {
  const results: AcademyMemberProgress[] = [];
  for (const pod of pods) {
    for (const member of pod.team) {
      const completedLessons = member.certs.filter((cert) => cert.level === 'completed' || cert.level === 'mentor').length;
      const pendingLessons = Math.max(0, 3 - completedLessons);
      results.push({
        id: member.id,
        name: member.volunteer.display_name,
        podName: pod.name,
        role: member.role,
        status: member.status,
        certifications: member.certs ?? ([] as NormalizedCertification[]),
        completedLessons,
        pendingLessons,
        lastActivity: member.lastShiftAt,
      });
    }
  }
  return results;
}

function humanizeLabel(input: string): string {
  return input
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildInstructorProfiles(pods: Pod[]): AcademyInstructorProfile[] {
  const seen = new Set<string>();
  const instructors: AcademyInstructorProfile[] = [];

  for (const pod of pods) {
    for (const member of pod.team) {
      if (seen.has(member.id)) continue;

      const hasMentorLevel = member.certs.some((cert) => cert.level === 'mentor');
      const dispatchCertified = member.certs.some((cert) => cert.id.startsWith('dispatch-'));
      const type: AcademyInstructorProfile['type'] = hasMentorLevel
        ? 'mentor'
        : dispatchCertified
          ? 'dispatcher'
          : 'expert';
      const availability: AcademyInstructorProfile['availability'] =
        member.status === 'active' ? 'available' : member.status === 'inactive' ? 'limited' : 'unavailable';

      const focusSource =
        member.fieldRoles?.[0] ?? member.skills?.[0] ?? member.volunteer.affiliation ?? 'Operational Support';
      const focus = humanizeLabel(typeof focusSource === 'string' ? focusSource : String(focusSource));

      instructors.push({
        id: member.id,
        name: member.volunteer.display_name,
        type,
        availability,
        focus,
        timezone: member.volunteer.coordination_zone ?? undefined,
        certifications: member.certs ?? [],
      });

      seen.add(member.id);
    }
  }

  return instructors;
}

function buildTrainingSessions(instructors: AcademyInstructorProfile[]): AcademyTrainingSession[] {
  if (instructors.length === 0) return [];

  const pickInstructor = (index: number) => instructors[index % instructors.length];
  const base = new Date();
  const isoFromNow = (days: number, startHour: number, durationHours: number) => {
    const start = new Date(base);
    start.setDate(start.getDate() + days);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + durationHours);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const firstInstructor = pickInstructor(0);
  const secondInstructor = pickInstructor(1);
  const thirdInstructor = pickInstructor(2);

  const dispatchDrill = isoFromNow(2, 19, 2);
  const medicLab = isoFromNow(5, 10, 3);
  const legalWorkshop = isoFromNow(-3, 18, 2);

  return [
    {
      id: 'session-dispatch-drill',
      classId: 'responding-to-dispatch-calls',
      title: 'Responding to Dispatch Calls · Live Drill',
      ...dispatchDrill,
      modality: 'online',
      meetingUrl: 'https://meet.alwaysready.tools/dispatch-drill',
      instructorName: firstInstructor?.name ?? 'TBD',
      instructorType: firstInstructor?.type ?? 'expert',
      status: 'scheduled',
      seats: { capacity: 18, confirmed: 12, waitlist: 2 },
      timezone: firstInstructor?.timezone ?? 'America/Los_Angeles',
    },
    {
      id: 'session-medic-lab',
      classId: 'medical-basics-field-safety',
      title: 'Medical Basics · Scenario Lab',
      ...medicLab,
      modality: 'in_person',
      location: 'Community Safety Hub — Oakland',
      instructorName: secondInstructor?.name ?? 'TBD',
      instructorType: secondInstructor?.type ?? 'expert',
      status: 'in_progress',
      seats: { capacity: 12, confirmed: 10, waitlist: 1 },
      timezone: secondInstructor?.timezone ?? 'America/Los_Angeles',
    },
    {
      id: 'session-legal-clinic',
      classId: 'trust-and-ethics-in-dispatch',
      title: 'Trust & Ethics · After Action Clinic',
      ...legalWorkshop,
      modality: 'hybrid',
      meetingUrl: 'https://meet.alwaysready.tools/legal-clinic',
      location: 'Hybrid — Oakland & Zoom',
      instructorName: thirdInstructor?.name ?? 'TBD',
      instructorType: thirdInstructor?.type ?? 'expert',
      status: 'completed',
      seats: { capacity: 16, confirmed: 14, waitlist: 0 },
      timezone: thirdInstructor?.timezone ?? 'America/Los_Angeles',
    },
  ];
}

export default function AcademyDashboardPage() {
  const router = useRouter();
  const pods = usePodStore((state) => state.pods);
  const academyClasses = usePodStore((state) => state.academyClasses);

  const members = useMemo(() => convertPodsToMemberProgress(pods), [pods]);
  const instructors = useMemo(() => buildInstructorProfiles(pods), [pods]);
  const sessions = useMemo(() => buildTrainingSessions(instructors), [instructors]);
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
    () =>
      COURSE_BLUEPRINT.map((group) => ({
        id: group.id,
        label: group.label,
        trackLabel: group.trackLabel,
        variant: group.variant,
        courses: group.courses.map((course) => ({
          slug: course.slug,
          title: course.title,
          description: course.description,
          icon: course.icon,
          type: course.type,
          version: course.version,
          status: determineCourseStatus('certId' in course ? course.certId : undefined, members),
        })),
      })),
    [members],
  );

  const headingCta = (
    <Button asChild variant="outline">
      <a href="https://academy.alwaysreadytools.org" target="_blank" rel="noreferrer">
        Open Academy
      </a>
    </Button>
  );

  return (
    <PodAcademyDashboardLayout
      heading={{
        title: 'Dispatch Academy Hub',
        subtitle:
          'Coordinate live classes with mentors and dispatchers while tracking qualification progress in every pod.',
        cta: headingCta,
      }}
      stats={stats}
      courseGroups={courseGroups}
      members={members}
      instructors={instructors}
      trainingClasses={trainingClasses}
      sessions={sessions}
      onScheduleClass={(classId) => {
        router.push(`/academy/class/${classId}`);
      }}
      onUpdateSessionStatus={(sessionId, status) => {
        console.info('Update session status', sessionId, status);
      }}
      onContactInstructor={(instructorId) => {
        console.info('Contact instructor', instructorId);
      }}
      onCreatePathwayClass={(pathwayId) => {
        router.push(`/academy/class/${pathwayId}`);
      }}
    />
  );
}
