import { COURSE_GROUPS } from '@workspace/ui/data/academy/course-blueprint';
import { slugifyIdentifier } from '@workspace/ui/lib/academy-utils.ts';
import { matchCertificationToCourse, normalizeCourseKey } from '@workspace/ui/lib/operational-coverage.ts';
import type { NormalizedCertification } from '@workspace/store/types/pod.ts';

export type QualificationPathway = {
  key: string;
  label: string;
  courseSlugs: string[];
};

export const QUALIFICATION_PATHWAYS: QualificationPathway[] = COURSE_GROUPS.map((group, index) => {
  const keyBase = slugifyIdentifier(group.label || `pathway-${index}`);
  return {
    key: `${keyBase || 'pathway'}-${index}`,
    label: group.label,
    courseSlugs: group.courses.map((course) => course.slug),
  };
});

export type QualificationPathwayStatus = {
  pathway: QualificationPathway;
  status: 'ready' | 'interested' | 'missing';
  completedCourses: string[];
  inProgressCourses: string[];
  missingCourses: string[];
};

export function computeQualificationPathwayStatuses(
  certifications: NormalizedCertification[] | undefined | null,
): QualificationPathwayStatus[] {
  const certs = Array.isArray(certifications) ? certifications : [];
  return QUALIFICATION_PATHWAYS.map((pathway) => {
    const completed: string[] = [];
    const inProgress: string[] = [];
    const missing: string[] = [];

    for (const courseId of pathway.courseSlugs) {
      const match = matchCertificationToCourse(courseId, certs);
      if (!match) {
        missing.push(courseId);
        continue;
      }
      const level = (match.level ?? '').toLowerCase();
      if (level === 'completed' || level === 'mentor') {
        completed.push(courseId);
      } else if (level === 'expired') {
        missing.push(courseId);
      } else {
        inProgress.push(courseId);
      }
    }

    let status: 'ready' | 'interested' | 'missing' = 'missing';
    if (pathway.courseSlugs.length > 0 && completed.length === pathway.courseSlugs.length) {
      status = 'ready';
    } else if (completed.length > 0 || inProgress.length > 0) {
      status = 'interested';
    }

    return {
      pathway,
      status,
      completedCourses: completed,
      inProgressCourses: inProgress,
      missingCourses: missing,
    };
  });
}

export function summarizeQualificationProgress(certifications: NormalizedCertification[] | undefined | null): string {
  const statuses = computeQualificationPathwayStatuses(certifications);
  const ready = statuses.filter((status) => status.status === 'ready').length;
  const interested = statuses.filter((status) => status.status === 'interested').length;
  if (ready === 0 && interested === 0) {
    return 'No pathways tagged yet';
  }
  const parts: string[] = [];
  if (ready > 0) {
    parts.push(`${ready} ready`);
  }
  if (interested > 0) {
    parts.push(`${interested} in progress`);
  }
  return parts.join(' • ');
}

export function dedupePathwayCourses(courseSlugs: string[]): string[] {
  const map = new Map<string, string>();
  for (const slug of courseSlugs) {
    const key = normalizeCourseKey(slug);
    if (!map.has(key)) {
      map.set(key, slug);
    }
  }
  return Array.from(map.values());
}
