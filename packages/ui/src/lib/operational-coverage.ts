import type { NormalizedCertification } from '@workspace/store/types/pod.ts';

export type OperationalCoverageArea = {
  key: string;
  label: string;
  description?: string;
  requiredCourses: string[];
};

export const OPERATIONAL_COVERAGE_AREAS: OperationalCoverageArea[] = [
  {
    key: 'dispatch',
    label: 'Dispatch & Coordination',
    description: 'Dispatchers who triage incidents, manage intake, and coordinate resources across pods.',
    requiredCourses: ['responding-to-dispatch-calls', 'trust-and-ethics-in-dispatch'],
  },
  {
    key: 'field',
    label: 'Field Safety & Teams',
    description: 'Field responders ready for deployments, basic intervention, and mesh communications on patrol.',
    requiredCourses: ['field-role-training-hub', 'field-safety'],
  },
  {
    key: 'comms',
    label: 'Communications & Technology',
    description: 'Radio and mesh leads who keep communications hardware and briefings online.',
    requiredCourses: ['radio-communications', 'mesh-networks-hardware-guide', 'digital-resilience-contingency-comms'],
  },
  {
    key: 'admin',
    label: 'Trust & Governance',
    description: 'Regional admins who steward signatures, roster integrity, and onboarding flows.',
    requiredCourses: ['admin-tools', 'trust-networks-signature-management', 'regional-data-stewardship'],
  },
  {
    key: 'pod',
    label: 'Pod Operations',
    description: 'Pod leads who stand up pods, run shifts, and facilitate after-action reviews.',
    requiredCourses: ['create-a-pod', 'training-the-trainers', 'after-action-data-hygiene'],
  },
  {
    key: 'engagement',
    label: 'Community Engagement',
    description: 'Outreach volunteers who run CDC deployments, patrols, and Meet-A-Need responses.',
    requiredCourses: [
      'outreach-messaging-community-trust',
      'community-defense-center',
      'community-intelligence-situational-reporting',
    ],
  },
];

export type OperationalCoverageCourseStatus = 'missing' | 'in_progress' | 'completed' | 'expired';

export type OperationalCoverageAreaStatus = {
  area: OperationalCoverageArea;
  status: 'ready' | 'interested' | 'missing';
  completedCourses: string[];
  inProgressCourses: string[];
  missingCourses: string[];
};

export function normalizeCourseKey(value?: string | null): string {
  if (!value) return '';
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function matchCertificationToCourse(
  courseId: string,
  certifications: NormalizedCertification[],
): NormalizedCertification | undefined {
  const target = normalizeCourseKey(courseId);
  for (const cert of certifications) {
    const idKey = normalizeCourseKey(cert.id);
    if (idKey && idKey === target) {
      return cert;
    }
    const nameKey = normalizeCourseKey(cert.display_name);
    if (nameKey && nameKey === target) {
      return cert;
    }
  }
  return undefined;
}

export function computeCoverageAreaStatuses(
  certifications: NormalizedCertification[] | undefined | null,
): OperationalCoverageAreaStatus[] {
  const certs = Array.isArray(certifications) ? certifications : [];
  return OPERATIONAL_COVERAGE_AREAS.map((area) => {
    const completed: string[] = [];
    const inProgress: string[] = [];
    const missing: string[] = [];

    for (const courseId of area.requiredCourses) {
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
    if (area.requiredCourses.length > 0 && completed.length === area.requiredCourses.length) {
      status = 'ready';
    } else if (completed.length > 0 || inProgress.length > 0) {
      status = 'interested';
    }

    return {
      area,
      status,
      completedCourses: completed,
      inProgressCourses: inProgress,
      missingCourses: missing,
    };
  });
}
