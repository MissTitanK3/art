import { humanize } from '../../lib/utils';
import type { TrackVariant } from '../../components/academy/TrackBadge';
import { ACADEMY_COURSE_DETAILS, ACADEMY_COURSE_GROUPS } from './course-groups';

export type CourseBlueprintCourse = {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  type: 'qualified' | 'certified';
  version?: number;
  durationHours: number;
  modality: 'in_person' | 'online' | 'hybrid';
  instructorType: 'dispatcher' | 'mentor' | 'expert';
  certId?: string;
};

export type CourseBlueprint = {
  id: string;
  label: string;
  trackLabel?: string;
  variant?: TrackVariant;
  courses: CourseBlueprintCourse[];
};

export const QUALIFICATION_VARIANTS: Record<string, TrackVariant> = {
  'Getting Started (Everyone)': 'movement-strategy',
  'Level 1: Team Member Onboarding': 'community-care',
  'Level 2: Field Coordination Basics (Basic Dispatcher)': 'field-safety',
  'Level 3: Dispatcher Certification (Verified Dispatcher)': 'pod-leadership',
  'Level 4: Zone Lead (Admin Dispatcher)': 'logistics',
};

export function slugifyLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export const COURSE_GROUPS = ACADEMY_COURSE_GROUPS;

export const COURSE_BLUEPRINT: CourseBlueprint[] = COURSE_GROUPS.map((group) => {
  const fallbackId = slugifyLabel(group.label);
  const variant = QUALIFICATION_VARIANTS[group.label];
  const isCertifiedGroup = group.courses.some((course) => {
    const meta = ACADEMY_COURSE_DETAILS[course.slug];
    return meta?.type === 'certified';
  });

  return {
    id: fallbackId,
    label: group.label,
    trackLabel: group.track,
    variant,
    courses: group.courses.map((course) => {
      const meta = ACADEMY_COURSE_DETAILS[course.slug];
      return {
        slug: course.slug,
        title: meta?.title ?? humanize(course.slug),
        description: meta?.description ?? 'Details available in Academy.',
        icon: meta?.icon ?? course.icon ?? '📘',
        type: meta?.type ?? (isCertifiedGroup ? 'certified' : 'qualified'),
        version: meta?.version,
        durationHours: meta?.durationHours ?? 1,
        modality: meta?.modality ?? 'online',
        instructorType: meta?.instructorType ?? 'dispatcher',
        certId: meta?.certId,
      };
    }),
  };
});
