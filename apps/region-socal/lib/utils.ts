import {
  AcademyCourseGroup,
  AcademyInstructorProfile,
  AcademyMemberProgress,
  AcademySummaryStat,
  AcademyTrainingSession,
} from '@workspace/store/types/academy';
import { NormalizedCertification, Pod } from '@workspace/store/types/pod';
import { CourseBlueprint } from '@workspace/ui/data/academy/course-blueprint';

export function humanizeLabel(input: string): string {
  return input
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function determineCourseStatus(
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

export function deriveStats(
  pods: Pod[],
  members: AcademyMemberProgress[],
  sessions: AcademyTrainingSession[],
): AcademySummaryStat[] {
  const totalPods = pods.length;
  const totalMembers = members.length;
  const fullyCertified = members.filter(
    (member) =>
      member.certifications.length > 0 &&
      member.certifications.every((cert) => cert.level === 'completed' || cert.level === 'mentor'),
  ).length;
  const activelyTraining = members.filter((member) =>
    member.certifications.some((cert) => cert.level === 'in_progress'),
  ).length;
  const mentors = members.filter((member) => member.certifications.some((cert) => cert.level === 'mentor')).length;
  const activeSessions = sessions.filter(
    (session) => session.status === 'scheduled' || session.status === 'in_progress',
  ).length;
  const completedSessions = sessions.filter((session) => session.status === 'completed').length;
  const archivedSessions = sessions.filter((session) => session.status === 'archived').length;

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
      value: `${activeSessions}`,
      helper: `${completedSessions} completed · ${archivedSessions} archived · ${mentors} mentors guiding`,
    },
  ];
}

export function convertPodsToMemberProgress(pods: Pod[]): AcademyMemberProgress[] {
  const results: AcademyMemberProgress[] = [];
  for (const pod of pods) {
    for (const member of pod.team) {
      const completedLessons = member.certs.filter(
        (cert) => cert.level === 'completed' || cert.level === 'mentor',
      ).length;
      const pendingLessons = Math.max(0, 3 - completedLessons);
      const profile = member.profile as any;
      results.push({
        id: member.id,
        name: (profile?.display_name ?? member.handle ?? '').toString(),
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
export function buildInstructorProfiles(pods: Pod[]): AcademyInstructorProfile[] {
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
        member.profile.field_roles?.[0] ?? member.skills?.[0] ?? member.profile.affiliation ?? 'Operational Support';
      const focus = humanizeLabel(typeof focusSource === 'string' ? focusSource : String(focusSource));
      const hasExpiredCert = member.certs.some((cert) => cert.level === 'expired');
      const hasCompletedCert = member.certs.some((cert) => cert.level === 'completed' || cert.level === 'mentor');
      const vettingStatus: AcademyInstructorProfile['vettingStatus'] = hasExpiredCert
        ? 'needs_review'
        : hasCompletedCert
          ? 'cleared'
          : 'awaiting_verification';

      const profile = member.profile as any;
      instructors.push({
        id: member.id,
        name: (profile?.display_name ?? member.handle ?? 'Unknown').toString(),
        type,
        availability,
        focus,
        timezone: profile?.coordination_zone ?? undefined,
        certifications: member.certs ?? [],
        registrationStatus: profile?.user_id ? 'registered' : 'unregistered',
        vettingStatus,
      });

      seen.add(member.id);
    }
  }

  return instructors;
}

export function attachCourseStatusToGroups(
  groups: CourseBlueprint[],
  members: AcademyMemberProgress[],
): AcademyCourseGroup[] {
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    trackLabel: group.trackLabel,
    variant: group.variant,
    courses: group.courses.map((course) => {
      const normalizedType: 'qualified' | 'certified' = course.type === 'certified' ? 'certified' : 'qualified';
      return {
        slug: course.slug,
        title: course.title,
        description: course.description,
        icon: course.icon,
        type: normalizedType,
        version: course.version,
        status: determineCourseStatus('certId' in course ? course.certId : undefined, members),
      };
    }),
  }));
}

// Builds demo training sessions relative to the current date
type BaseSessionInput = {
  slug?: string;
  classId?: string;
  title?: string;
  modality?: 'in_person' | 'online' | 'hybrid';
  location?: string;
  meetingUrl?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'archived';
  seats?: { capacity: number; confirmed: number; waitlist: number };
  timezoneFallback?: string;
  relatedTopic?: string;
  dayOffset?: number;
  startHour?: number;
  durationHours?: number;
  participants?: AcademyTrainingSession['participants'];
};
type BuildSessionsOptions = {
  count?: number;
  baseDate?: Date;
  dayStep?: number;
};

// Overloads: allow calling with (instructors, options) or (data, instructors, options)
export function buildTrainingSessions(
  instructors: AcademyInstructorProfile[],
  options?: BuildSessionsOptions,
): AcademyTrainingSession[];
export function buildTrainingSessions<T extends BaseSessionInput>(
  data: T[],
  instructors: AcademyInstructorProfile[],
  options?: BuildSessionsOptions,
): AcademyTrainingSession[];
export function buildTrainingSessions(
  dataOrInstructors: BaseSessionInput[] | AcademyInstructorProfile[],
  instructorsOrOptions?: AcademyInstructorProfile[] | BuildSessionsOptions,
  maybeOptions?: BuildSessionsOptions,
): AcademyTrainingSession[] {
  // Determine invocation shape
  const first = Array.isArray(dataOrInstructors) ? dataOrInstructors[0] : undefined;
  const looksLikeData = !!first && ("slug" in (first as any) || "classId" in (first as any) || "status" in (first as any));

  let data: BaseSessionInput[] = [];
  let instructors: AcademyInstructorProfile[] = [];
  let options: BuildSessionsOptions | undefined;

  if (looksLikeData) {
    data = (dataOrInstructors as BaseSessionInput[]) ?? [];
    instructors = (instructorsOrOptions as AcademyInstructorProfile[]) ?? [];
    options = maybeOptions as BuildSessionsOptions;
  } else {
    instructors = (dataOrInstructors as AcademyInstructorProfile[]) ?? [];
    options = (instructorsOrOptions as BuildSessionsOptions) ?? undefined;
    // Provide a small default template when only instructors are supplied
    data = [
      {
        slug: 'dispatch-drill',
        classId: 'responding-to-dispatch-calls',
        title: 'Responding to Dispatch Calls · Live Drill',
        modality: 'online',
        meetingUrl: 'https://meet.alwaysready.tools/dispatch-drill',
        status: 'scheduled',
        dayOffset: 1,
        startHour: 18,
        durationHours: 2,
        seats: { capacity: 6, confirmed: 0, waitlist: 0 },
      },
      {
        slug: 'medical-lab',
        classId: 'medical-basics-field-safety',
        title: 'Medical Basics · Scenario Lab',
        modality: 'in_person',
        location: 'Community Safety Hub',
        status: 'in_progress',
        dayOffset: 3,
        startHour: 17,
        durationHours: 3,
        seats: { capacity: 8, confirmed: 0, waitlist: 0 },
      },
      {
        slug: 'legal-clinic',
        classId: 'trust-and-ethics-in-dispatch',
        title: 'Trust & Ethics · After Action Clinic',
        modality: 'hybrid',
        meetingUrl: 'https://meet.alwaysready.tools/legal-clinic',
        location: 'Hybrid — Oakland & Zoom',
        status: 'completed',
        dayOffset: -2,
        startHour: 20,
        durationHours: 2,
        seats: { capacity: 5, confirmed: 0, waitlist: 0 },
      },
    ];
  }

  if (!Array.isArray(data) || data.length === 0) return [];
  
  const { count = data.length, baseDate = new Date(), dayStep = 7 } = options ?? {};

  const isoFromNow = (days: number, startHour: number, durationHours: number) => {
    const start = new Date(baseDate);
    start.setDate(start.getDate() + days);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + durationHours);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const sessions: AcademyTrainingSession[] = [];

  for (let i = 0; i < count; i++) {
    const instructor = instructors.length > 0 ? instructors[i % instructors.length] : undefined;
    const item = (data[i % data.length] ?? {}) as BaseSessionInput; // ensure typed fallback
    const cycle = Math.floor(i / data.length);

    const {
      slug = `session-${i + 1}`,
      classId = '',
      title = 'Untitled Session',
      modality = 'online',
      location,
      meetingUrl,
      status = 'scheduled',
      seats = { capacity: 5, confirmed: 0, waitlist: 0 },
      timezoneFallback = 'UTC',
      relatedTopic,
      dayOffset = 0,
      startHour = 12,
      durationHours = 2,
      participants = [],
    } = item;

    const days =
      status === 'completed' || status === 'archived' ? dayOffset - dayStep * cycle : dayOffset + dayStep * cycle;

    const time = isoFromNow(days, startHour, durationHours);
    const id = `${slug}-${String(i + 1).padStart(2, '0')}`;

    sessions.push({
      id,
      classId,
      title,
      ...time,
      modality,
      location,
      meetingUrl,
      instructorName: instructor?.name ?? 'TBD',
      instructorType: instructor?.type ?? 'expert',
      status,
      seats,
      timezone: instructor?.timezone ?? timezoneFallback,
      relatedTopic,
      participants,
    });
  }

  return sessions;
}
