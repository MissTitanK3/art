import {
  type RegionOperationalMinimumDefinition,
  type RegionOperationalMinimumOverride,
  type RegionOperationalMinimumSnapshot,
  type RegionOperationalMinimumMemberSummary,
  type RegionOperationalMinimumMemberStatus,
  type RegionOperationalMinimumCoverage,
  type RegionOperationalMinimumCompletionsInput,
  type RegionReadinessChecklistItem,
  type RegionOperationalMinimumsOverridesPayload,
} from '@workspace/store/types/academy-readiness.ts';
import type { AcademyMemberProgress, AcademyTrainingSession } from '@workspace/store/types/academy.ts';
import type { NormalizedCertification } from '@workspace/store/types/pod.ts';

const DEFAULT_LABEL_FALLBACKS: Record<string, string> = {
  dispatch: 'Dispatch & Coordination',
  field: 'Field Safety & On-The-Ground Teams',
  comms: 'Communications & Technology',
  admin: 'Trust & Regional Governance',
  pod: 'Local Ops & Pod Management',
  engagement: 'Community Engagement',
};

export const DEFAULT_REGION_OPERATIONAL_MINIMUMS: RegionOperationalMinimumDefinition[] = [
  {
    key: 'dispatch',
    label: 'Dispatch & Coordination',
    description:
      'Certified dispatchers who can triage incidents, assign resources, and coordinate Meet-A-Need intakes around the clock.',
    requiredCount: 3,
    requiredCourses: ['responding-to-dispatch-calls', 'trust-and-ethics-in-dispatch'],
    staffingRange: [3, 5],
    tags: ['dispatch', 'coordination'],
    emphasis: 'Need 3–5 cleared dispatchers to operate minimum coverage windows.',
  },
  {
    key: 'field',
    label: 'Field Safety & On-The-Ground Teams',
    description:
      'Level 1 volunteers prepared for field deployments, basic bystander intervention, and mesh communications while on patrol.',
    requiredCount: 10,
    requiredCourses: ['field-role-training-hub', 'field-safety'],
    staffingRange: [10, 15],
    tags: ['field', 'safety'],
    emphasis: 'Sustain at least 10 trained volunteers to rotate into field teams without burnout.',
  },
  {
    key: 'comms',
    label: 'Communications & Technology',
    description: 'Radio leads who can configure mesh hardware, maintain power, and run briefings for deployments.',
    requiredCount: 2,
    requiredCourses: ['radio-communications', 'mesh-networks-hardware-guide', 'digital-resilience-contingency-comms'],
    staffingRange: [2, 3],
    tags: ['comms', 'technology'],
    emphasis: 'At least two comms leads keep radios, mesh, and daily briefings online.',
  },
  {
    key: 'admin',
    label: 'Trust & Regional Governance',
    description: 'Admins who can maintain trust signatures, validate roster entries, and manage signer rotations.',
    requiredCount: 1,
    requiredCourses: ['admin-tools', 'trust-networks-signature-management', 'regional-data-stewardship'],
    staffingRange: [1, 2],
    tags: ['trust', 'governance'],
    emphasis: 'Keep at least one trusted admin active to manage signatures and onboarding.',
  },
  {
    key: 'pod',
    label: 'Local Ops & Pod Management',
    description:
      'Pod leads who can stand up pods, run shifts, and facilitate after-action reviews for learning feedback loops.',
    requiredCount: 3,
    requiredCourses: ['create-a-pod', 'training-the-trainers', 'after-action-data-hygiene'],
    staffingRange: [3, 4],
    tags: ['leadership', 'pods'],
    emphasis: 'Ensure three trained pod leads to cover weekly rotations and relief coverage.',
  },
  {
    key: 'engagement',
    label: 'Community Engagement',
    description:
      'Outreach volunteers ready to run CDC deployments, coordinated foot patrols, and Meet-A-Need responses.',
    requiredCount: 4,
    requiredCourses: [
      'outreach-messaging-community-trust',
      'community-defense-center',
      'community-intelligence-situational-reporting',
    ],
    staffingRange: [4, 6],
    tags: ['community', 'outreach'],
    emphasis: 'Keep 4–6 outreach volunteers ready so community requests never stall.',
  },
];

const STATUS_ORDER: Record<RegionOperationalMinimumSnapshot['coverageStatus'], number> = {
  critical: 0,
  at_risk: 1,
  met: 2,
};

function humanizeKey(key: string): string {
  const fallback = DEFAULT_LABEL_FALLBACKS[key];
  if (fallback) return fallback;
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeCourses(courses: unknown): string[] {
  if (!courses) return [];
  if (Array.isArray(courses)) {
    return Array.from(
      new Set(
        courses
          .map((course) =>
            typeof course === 'string'
              ? course.trim()
              : typeof course === 'object' && course && 'id' in course
                ? String((course as { id: string }).id)
                : null,
          )
          .filter((value): value is string => !!value && value.length > 0),
      ),
    );
  }
  if (typeof courses === 'string' && courses.length > 0) {
    return courses
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
  return [];
}

function normalizeDefinition(definition: RegionOperationalMinimumDefinition): RegionOperationalMinimumDefinition {
  return {
    key: definition.key,
    label: definition.label || humanizeKey(definition.key),
    description: definition.description,
    requiredCount: Math.max(0, Math.floor(definition.requiredCount ?? 0)),
    requiredCourses: normalizeCourses(definition.requiredCourses),
    staffingRange: definition.staffingRange,
    tags: Array.isArray(definition.tags) ? [...definition.tags] : undefined,
    emphasis: definition.emphasis,
  };
}

function mergeDefinition(
  base: RegionOperationalMinimumDefinition,
  override?: RegionOperationalMinimumOverride,
): RegionOperationalMinimumDefinition {
  if (!override) {
    return normalizeDefinition(base);
  }

  const merged: RegionOperationalMinimumDefinition = {
    ...base,
    ...override,
    requiredCourses:
      override?.requiredCourses !== undefined ? normalizeCourses(override.requiredCourses) : base.requiredCourses,
    staffingRange: override?.staffingRange !== undefined ? override.staffingRange : base.staffingRange,
    tags: override?.tags !== undefined ? (Array.isArray(override.tags) ? [...override.tags] : undefined) : base.tags,
  };

  if (!merged.label) {
    merged.label = humanizeKey(merged.key);
  }

  merged.requiredCount = Math.max(0, Math.floor(merged.requiredCount ?? 0));
  merged.requiredCourses = normalizeCourses(merged.requiredCourses);

  return merged;
}

export function parseRegionOperationalMinimumOverrides(
  raw: RegionOperationalMinimumsOverridesPayload,
): RegionOperationalMinimumOverride[] {
  if (raw == null) return [];

  let source: unknown = raw;

  if (typeof raw === 'string') {
    try {
      source = JSON.parse(raw);
    } catch (error) {
      console.warn('[region-minimums] Failed to parse overrides JSON string', error);
      return [];
    }
  }

  if (Array.isArray(source)) {
    return source
      .map((entry) => {
        if (typeof entry !== 'object' || !entry) return null;
        const candidate = entry as Record<string, unknown>;
        const key = typeof candidate.key === 'string' ? candidate.key : null;
        if (!key) return null;
        const override: RegionOperationalMinimumOverride = {
          key,
        };
        if (typeof candidate.label === 'string') override.label = candidate.label;
        if (typeof candidate.description === 'string') override.description = candidate.description;
        if (typeof candidate.requiredCount === 'number') override.requiredCount = candidate.requiredCount;
        if (candidate.requiredCourses !== undefined)
          override.requiredCourses = normalizeCourses(candidate.requiredCourses);
        if (Array.isArray(candidate.staffingRange))
          override.staffingRange = candidate.staffingRange as [number, number?];
        if (Array.isArray(candidate.tags)) override.tags = candidate.tags as string[];
        if (typeof candidate.emphasis === 'string') override.emphasis = candidate.emphasis;
        return override;
      })
      .filter((value): value is RegionOperationalMinimumOverride => value !== null);
  }

  if (typeof source === 'object' && source) {
    const overrides: RegionOperationalMinimumOverride[] = [];
    for (const [key, value] of Object.entries(source)) {
      if (!key) continue;
      const base: RegionOperationalMinimumOverride = { key };
      if (typeof value === 'number') {
        base.requiredCount = value;
      } else if (typeof value === 'string') {
        base.label = value;
      } else if (typeof value === 'object' && value) {
        const typed = value as Record<string, unknown>;
        if (typeof typed.label === 'string') base.label = typed.label;
        if (typeof typed.description === 'string') base.description = typed.description;
        if (typeof typed.requiredCount === 'number') base.requiredCount = typed.requiredCount;
        if (typed.requiredCourses !== undefined) base.requiredCourses = normalizeCourses(typed.requiredCourses);
        if (Array.isArray(typed.staffingRange)) base.staffingRange = typed.staffingRange as [number, number?];
        if (Array.isArray(typed.tags)) base.tags = typed.tags as string[];
        if (typeof typed.emphasis === 'string') base.emphasis = typed.emphasis;
      }
      overrides.push(base);
    }
    return overrides;
  }

  return [];
}

export function buildRegionOperationalMinimums(
  overrides?: RegionOperationalMinimumOverride[] | null,
  base: RegionOperationalMinimumDefinition[] = DEFAULT_REGION_OPERATIONAL_MINIMUMS,
): RegionOperationalMinimumDefinition[] {
  if (!overrides || overrides.length === 0) {
    return base.map((definition) => ({ ...definition }));
  }

  const overrideMap = new Map<string, RegionOperationalMinimumOverride>();
  for (const override of overrides) {
    if (!override?.key) continue;
    overrideMap.set(override.key, override);
  }

  const merged: RegionOperationalMinimumDefinition[] = base.map((definition) =>
    mergeDefinition(definition, overrideMap.get(definition.key)),
  );

  for (const override of overrideMap.values()) {
    const alreadyPresent = merged.some((item) => item.key === override.key);
    if (alreadyPresent) continue;
    const label = override.label && override.label.length > 0 ? override.label : humanizeKey(override.key);
    merged.push(
      normalizeDefinition({
        key: override.key,
        label,
        description: override.description,
        requiredCount: Math.max(0, override.requiredCount ?? 0),
        requiredCourses: normalizeCourses(override.requiredCourses),
        staffingRange: override.staffingRange,
        tags: override.tags,
        emphasis: override.emphasis,
      }),
    );
  }

  return merged;
}

function arraysEqual<T>(a: T[] | undefined, b: T[] | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function rangesEqual(a?: [number, number?], b?: [number, number?]): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a[0] !== b[0]) return false;
  if (a[1] !== b[1]) return false;
  return true;
}

function cloneRange(range?: [number, number?]): [number, number?] | undefined {
  if (!Array.isArray(range)) return undefined;
  const [min, max] = range;
  if (typeof min !== 'number' || Number.isNaN(min)) return undefined;
  const cloned: [number, number?] = [min];
  if (typeof max === 'number' && !Number.isNaN(max)) {
    cloned[1] = max;
  }
  return cloned;
}

export function deriveRegionOperationalMinimumOverrides(
  definitions: RegionOperationalMinimumDefinition[],
  base: RegionOperationalMinimumDefinition[] = DEFAULT_REGION_OPERATIONAL_MINIMUMS,
): RegionOperationalMinimumOverride[] {
  const overrides: RegionOperationalMinimumOverride[] = [];
  if (!Array.isArray(definitions) || definitions.length === 0) {
    return overrides;
  }

  const baseMap = new Map<string, RegionOperationalMinimumDefinition>();
  for (const definition of base) {
    if (!definition?.key) continue;
    baseMap.set(definition.key, normalizeDefinition(definition));
  }

  for (const definition of definitions) {
    if (!definition?.key) continue;
    const normalized = normalizeDefinition(definition);
    const baseDefinition = baseMap.get(normalized.key);
    if (!baseDefinition) {
      overrides.push({
        key: normalized.key,
        label: normalized.label,
        description: normalized.description,
        requiredCount: normalized.requiredCount,
        requiredCourses: [...normalized.requiredCourses],
        staffingRange: cloneRange(normalized.staffingRange),
        tags: normalized.tags ? [...normalized.tags] : undefined,
        emphasis: normalized.emphasis,
      });
      continue;
    }

    const override: RegionOperationalMinimumOverride = { key: normalized.key };
    if (normalized.label !== baseDefinition.label) {
      override.label = normalized.label;
    }
    if ((normalized.description ?? '') !== (baseDefinition.description ?? '')) {
      override.description = normalized.description;
    }
    if (normalized.requiredCount !== baseDefinition.requiredCount) {
      override.requiredCount = normalized.requiredCount;
    }
    if (!arraysEqual(normalized.requiredCourses, baseDefinition.requiredCourses)) {
      override.requiredCourses = [...normalized.requiredCourses];
    }
    if (!rangesEqual(normalized.staffingRange, baseDefinition.staffingRange)) {
      override.staffingRange = cloneRange(normalized.staffingRange);
    }
    if (!arraysEqual(normalized.tags, baseDefinition.tags)) {
      override.tags = normalized.tags ? [...normalized.tags] : undefined;
    }
    if ((normalized.emphasis ?? '') !== (baseDefinition.emphasis ?? '')) {
      override.emphasis = normalized.emphasis;
    }

    if (Object.keys(override).length > 1) {
      overrides.push(override);
    }
  }

  return overrides;
}

function normalizeId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function matchCertificationToRequirement(
  requirement: string,
  certifications: NormalizedCertification[],
): {
  match?: NormalizedCertification;
  status: 'active' | 'in_progress' | 'expired' | 'missing';
} {
  if (!requirement) {
    return { match: undefined, status: 'missing' };
  }
  const normalizedRequirement = normalizeId(requirement);
  for (const certification of certifications) {
    const normalizedId = normalizeId(certification.id ?? '');
    const normalizedDisplay = normalizeId(certification.display_name ?? '');
    if (
      normalizedId === normalizedRequirement ||
      normalizedId.endsWith(normalizedRequirement) ||
      normalizedRequirement.endsWith(normalizedId) ||
      (normalizedDisplay.length > 0 && normalizedDisplay.includes(normalizedRequirement))
    ) {
      const level = certification.level ?? 'incomplete';
      if (level === 'completed' || level === 'mentor') {
        return { match: certification, status: 'active' };
      }
      if (level === 'in_progress') {
        return { match: certification, status: 'in_progress' };
      }
      if (level === 'expired') {
        return { match: certification, status: 'expired' };
      }
      return { match: certification, status: 'missing' };
    }
  }
  return { match: undefined, status: 'missing' };
}

const EXPIRING_SOON_THRESHOLD_DAYS = 45;

type MemberClassification = {
  status: RegionOperationalMinimumMemberStatus;
  missingCourses: string[];
  matchedCertifications: NormalizedCertification[];
  expiringSoon: NormalizedCertification[];
};

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isExpiringSoon(certification: NormalizedCertification, thresholdDays = EXPIRING_SOON_THRESHOLD_DAYS): boolean {
  const expiry = toDate(certification.expires_at ?? null);
  if (!expiry) return false;
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= thresholdDays;
}

function getEarliestExpiry(certifications: NormalizedCertification[]): string | null {
  let earliest: { date: Date; value: string } | null = null;
  for (const certification of certifications) {
    const expiresAt = certification.expires_at ?? null;
    const expiryDate = toDate(expiresAt);
    if (!expiryDate) continue;
    if (!earliest || expiryDate < earliest.date) {
      earliest = { date: expiryDate, value: expiresAt! };
    }
  }
  return earliest?.value ?? null;
}

function mergeCertifications(
  ...sources: Array<NormalizedCertification[] | null | undefined>
): NormalizedCertification[] {
  const merged = new Map<string, NormalizedCertification>();
  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const certification of source) {
      if (!certification || typeof certification !== 'object') continue;
      const existing = merged.get(certification.id);
      if (!existing) {
        merged.set(certification.id, { ...certification });
        continue;
      }
      merged.set(certification.id, {
        ...existing,
        ...certification,
        level: certification.level ?? existing.level,
        expires_at: certification.expires_at ?? existing.expires_at,
        completed_at: certification.completed_at ?? existing.completed_at,
        awarded_at: certification.awarded_at ?? existing.awarded_at,
      });
    }
  }
  return Array.from(merged.values());
}

function createCompletionMap(
  completions?: RegionOperationalMinimumCompletionsInput,
): Map<string, NormalizedCertification[]> {
  const map = new Map<string, NormalizedCertification[]>();
  if (!completions) return map;

  if (Array.isArray(completions)) {
    for (const entry of completions) {
      if (!entry || typeof entry !== 'object') continue;
      if ('memberId' in entry) {
        const certifications = Array.isArray(entry.certifications) ? entry.certifications : [];
        map.set(String(entry.memberId), certifications as NormalizedCertification[]);
        continue;
      }
      if ('id' in entry) {
        const rosterEntry = entry as AcademyMemberProgress;
        map.set(String(rosterEntry.id), Array.isArray(rosterEntry.certifications) ? rosterEntry.certifications : []);
      }
    }
    return map;
  }

  for (const [memberId, certificates] of Object.entries(completions)) {
    if (!memberId) continue;
    map.set(memberId, Array.isArray(certificates) ? (certificates as NormalizedCertification[]) : []);
  }

  return map;
}

function classifyMemberForMinimum(
  _member: AcademyMemberProgress,
  certifications: NormalizedCertification[],
  minimum: RegionOperationalMinimumDefinition,
): MemberClassification {
  if (!Array.isArray(minimum.requiredCourses) || minimum.requiredCourses.length === 0) {
    const activeCertifications = certifications.filter((cert) => cert.level === 'completed' || cert.level === 'mentor');
    const expiringSoon = activeCertifications.filter((cert) => isExpiringSoon(cert));
    return {
      status: 'active',
      missingCourses: [],
      matchedCertifications: activeCertifications,
      expiringSoon,
    };
  }

  let hasExpired = false;
  let hasInProgress = false;
  let completedCount = 0;
  const missingCourses: string[] = [];
  const matchedCertifications: NormalizedCertification[] = [];
  const expiringSoonMatches: NormalizedCertification[] = [];

  for (const requirement of minimum.requiredCourses) {
    const match = matchCertificationToRequirement(requirement, certifications ?? []);
    if (match.match) {
      matchedCertifications.push(match.match);
      if (match.status === 'active' && isExpiringSoon(match.match)) {
        expiringSoonMatches.push(match.match);
      }
    }

    if (match.status === 'active') {
      completedCount += 1;
    } else if (match.status === 'in_progress') {
      hasInProgress = true;
    } else if (match.status === 'expired') {
      hasExpired = true;
    } else {
      missingCourses.push(requirement);
    }
  }

  if (hasExpired) {
    return { status: 'expired', missingCourses, matchedCertifications, expiringSoon: expiringSoonMatches };
  }

  if (missingCourses.length === 0 && completedCount === minimum.requiredCourses.length) {
    return { status: 'active', missingCourses: [], matchedCertifications, expiringSoon: expiringSoonMatches };
  }

  if (hasInProgress || completedCount > 0) {
    return { status: 'in_progress', missingCourses, matchedCertifications, expiringSoon: expiringSoonMatches };
  }

  return { status: 'not_started', missingCourses, matchedCertifications, expiringSoon: expiringSoonMatches };
}

function dedupeById(members: RegionOperationalMinimumMemberSummary[]): RegionOperationalMinimumMemberSummary[] {
  const map = new Map<string, RegionOperationalMinimumMemberSummary>();
  for (const member of members) {
    if (!member?.id) continue;
    map.set(member.id, member);
  }
  return Array.from(map.values());
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0)));
}

function summarizeMembers(members: RegionOperationalMinimumMemberSummary[], limit = 3): string {
  if (members.length === 0) return '';
  const names = members.slice(0, limit).map((member) => member.name || 'Unknown');
  const remaining = members.length - names.length;
  if (remaining > 0) {
    return `${names.join(', ')} +${remaining}`;
  }
  return names.join(', ');
}

function extractMemberInterestedCourses(member: AcademyMemberProgress): string[] {
  const source = (member as AcademyMemberProgress & { interestedCourses?: string[] }).interestedCourses;
  if (!Array.isArray(source)) return [];
  const unique = new Set<string>();
  for (const entry of source) {
    if (typeof entry !== 'string') continue;
    const trimmed = entry.trim();
    if (trimmed.length === 0) continue;
    unique.add(trimmed);
  }
  return Array.from(unique);
}

function normalizeCourseKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function hasCourseInterest(interests: string[], requiredCourses: string[]): boolean {
  if (interests.length === 0 || requiredCourses.length === 0) return false;
  const normalizedRequired = requiredCourses.map(normalizeCourseKey);
  for (const interest of interests) {
    if (normalizedRequired.includes(normalizeCourseKey(interest))) {
      return true;
    }
  }
  return false;
}

export function computeCoverage(
  minimums: RegionOperationalMinimumDefinition[],
  roster: AcademyMemberProgress[],
  completions?: RegionOperationalMinimumCompletionsInput,
): Map<string, RegionOperationalMinimumCoverage> {
  const completionMap = createCompletionMap(completions);
  const coverage = new Map<string, RegionOperationalMinimumCoverage>();

  for (const minimum of minimums) {
    coverage.set(minimum.key, {
      key: minimum.key,
      active: [],
      inProgress: [],
      expired: [],
      pipeline: [],
      expiringSoon: [],
      dependencyWarnings: [],
    });
  }

  for (const member of roster) {
    const memberCertifications = mergeCertifications(member.certifications ?? [], completionMap.get(member.id));
    for (const minimum of minimums) {
      const bucket = coverage.get(minimum.key);
      if (!bucket) continue;

      const classification = classifyMemberForMinimum(member, memberCertifications, minimum);
      const summary: RegionOperationalMinimumMemberSummary = {
        id: member.id,
        name: member.name ?? 'Unknown',
        status: classification.status,
        missingCourses: classification.missingCourses,
      };

      const interestedCourses = extractMemberInterestedCourses(member);
      if (interestedCourses.length > 0) {
        summary.interestedCourses = interestedCourses;
      }
      const interestMatch = hasCourseInterest(interestedCourses, minimum.requiredCourses);

      if (classification.matchedCertifications.length > 0) {
        const primary = classification.matchedCertifications[0]!;
        summary.certificationId = primary.id;
        summary.certificationName = primary.display_name;
        summary.completedAt = primary.completed_at ?? primary.awarded_at ?? null;
      }

      const expiresAt = getEarliestExpiry(classification.matchedCertifications);
      if (expiresAt) {
        summary.expiresAt = expiresAt;
      }

      if (classification.expiringSoon.length > 0) {
        summary.expiringSoon = true;
      }

      switch (classification.status) {
        case 'active':
          bucket.active.push(summary);
          if (classification.expiringSoon.length > 0) {
            bucket.expiringSoon.push(summary);
          }
          break;
        case 'in_progress':
          bucket.inProgress.push(summary);
          bucket.pipeline.push(summary);
          break;
        case 'expired':
          bucket.expired.push(summary);
          bucket.pipeline.push(summary);
          break;
        default:
          if (interestMatch) {
            bucket.pipeline.push(summary);
          }
          break;
      }
    }
  }

  for (const minimum of minimums) {
    const bucket = coverage.get(minimum.key);
    if (!bucket) continue;

    bucket.pipeline = dedupeById(bucket.pipeline);
    bucket.expiringSoon = dedupeById(bucket.expiringSoon);
    bucket.dependencyWarnings = dedupeStrings(bucket.dependencyWarnings);

    const requiredCount = Math.max(0, minimum.requiredCount ?? 0);
    if (requiredCount > 0) {
      if (bucket.active.length < requiredCount && bucket.pipeline.length === 0) {
        bucket.dependencyWarnings.push('No volunteers in the pipeline to cover this requirement.');
      }

      const activeExpiringSoon = bucket.active.filter((member) => member.expiringSoon).length;
      if (bucket.active.length > 0 && activeExpiringSoon === bucket.active.length) {
        bucket.dependencyWarnings.push('All active members are near expiration—plan recertifications.');
      }

      if (bucket.expiringSoon.length > 0 && bucket.active.length <= requiredCount) {
        const count = bucket.expiringSoon.length;
        bucket.dependencyWarnings.push(
          `${count} active volunteer${count === 1 ? '' : 's'} close to expiring certifications.`,
        );
      }
    }

    bucket.dependencyWarnings = dedupeStrings(bucket.dependencyWarnings);
  }

  return coverage;
}

export function evaluateOperationalMinimums(
  minimums: RegionOperationalMinimumDefinition[],
  members: AcademyMemberProgress[],
  completions?: RegionOperationalMinimumCompletionsInput,
): RegionOperationalMinimumSnapshot[] {
  const coverageByKey = computeCoverage(minimums, members, completions);
  const snapshots: RegionOperationalMinimumSnapshot[] = [];

  for (const minimum of minimums) {
    const coverageForMinimum = coverageByKey.get(minimum.key) ?? {
      key: minimum.key,
      active: [],
      inProgress: [],
      expired: [],
      pipeline: [],
      expiringSoon: [],
      dependencyWarnings: [],
    };

    const requiredCount = Math.max(0, minimum.requiredCount ?? 0);
    const activeCount = coverageForMinimum.active.length;
    const inProgressCount = coverageForMinimum.inProgress.length;
    const expiredCount = coverageForMinimum.expired.length;
    const unmetCount = Math.max(0, requiredCount - activeCount);
    const coveragePercent = requiredCount === 0 ? 1 : Math.min(1, activeCount / requiredCount);

    let coverageStatus: RegionOperationalMinimumSnapshot['coverageStatus'] = 'met';
    if (requiredCount === 0) {
      coverageStatus = expiredCount > 0 ? 'at_risk' : 'met';
    } else if (activeCount >= requiredCount) {
      coverageStatus = expiredCount > 0 ? 'at_risk' : 'met';
    } else if (activeCount + inProgressCount >= requiredCount) {
      coverageStatus = 'at_risk';
    } else {
      coverageStatus = 'critical';
    }

    const gaps: string[] = [];
    if (requiredCount > 0 && activeCount < requiredCount) {
      const needed = requiredCount - activeCount;
      gaps.push(
        `Need ${needed} more ready volunteer${needed === 1 ? '' : 's'} (${activeCount}/${requiredCount} ready).`,
      );
    }
    if (coverageForMinimum.inProgress.length > 0 && activeCount < requiredCount) {
      gaps.push(`Close to ready: ${summarizeMembers(coverageForMinimum.inProgress)} waiting on certifications.`);
    }
    if (coverageForMinimum.expired.length > 0) {
      gaps.push(`Expired certifications: ${summarizeMembers(coverageForMinimum.expired)}.`);
    }
    if (coverageForMinimum.expiringSoon.length > 0) {
      gaps.push(`Expiring soon: ${summarizeMembers(coverageForMinimum.expiringSoon)}.`);
    }
    for (const warning of coverageForMinimum.dependencyWarnings) {
      if (warning && !gaps.includes(warning)) {
        gaps.push(warning);
      }
    }

    snapshots.push({
      key: minimum.key,
      label: minimum.label,
      description: minimum.description,
      requiredCount,
      staffingRange: minimum.staffingRange,
      requiredCourses: [...minimum.requiredCourses],
      coverageStatus,
      activeCount,
      inProgressCount,
      expiredCount,
      unmetCount,
      coveragePercent,
      supportingMembers: [...coverageForMinimum.active.slice(0, 6)],
      pipelineMembers: [...coverageForMinimum.pipeline.slice(0, 6)],
      expiringSoonMembers: coverageForMinimum.expiringSoon.slice(0, 6),
      dependencyWarnings: [...coverageForMinimum.dependencyWarnings],
      coverageSummary: summarizeMembers(coverageForMinimum.active),
      deficitSummary: summarizeMembers(coverageForMinimum.pipeline),
      gaps,
      recommendedCourses: [...minimum.requiredCourses],
      emphasis: minimum.emphasis,
    });
  }

  return snapshots.sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.coverageStatus] - STATUS_ORDER[b.coverageStatus];
    if (statusDiff !== 0) return statusDiff;
    return (b.requiredCount ?? 0) - (a.requiredCount ?? 0);
  });
}

function sessionsWithinRollingWindow(
  sessions: AcademyTrainingSession[],
  daysBefore = 30,
  daysAhead = 30,
): AcademyTrainingSession[] {
  const now = new Date();
  const earliest = new Date(now);
  earliest.setDate(now.getDate() - daysBefore);
  const latest = new Date(now);
  latest.setDate(now.getDate() + daysAhead);

  return sessions.filter((session) => {
    const start = new Date(session.start ?? session.end ?? '');
    if (Number.isNaN(start.getTime())) return false;
    return start >= earliest && start <= latest;
  });
}

function formatChecklistHelper(snapshot: RegionOperationalMinimumSnapshot): string {
  const base = `${snapshot.activeCount}/${snapshot.requiredCount} ready`;
  const extra: string[] = [];
  if (snapshot.inProgressCount > 0) {
    extra.push(`${snapshot.inProgressCount} in training`);
  }
  if (snapshot.expiredCount > 0) {
    extra.push(`${snapshot.expiredCount} expired`);
  }
  return extra.length > 0 ? `${base} · ${extra.join(' · ')}` : base;
}

function summarizeKeys(keys: Array<string | undefined>): string {
  const filtered = keys.filter((key): key is string => typeof key === 'string' && key.length > 0);
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0]!;
  if (filtered.length === 2) return `${filtered[0]!} & ${filtered[1]!}`;
  return `${filtered.slice(0, 2).join(', ')} +${filtered.length - 2}`;
}

export function createRegionReadinessChecklist(
  snapshots: RegionOperationalMinimumSnapshot[],
  sessions: AcademyTrainingSession[],
): RegionReadinessChecklistItem[] {
  const checklist: RegionReadinessChecklistItem[] = [];
  const snapshotMap = new Map<string, RegionOperationalMinimumSnapshot>();
  for (const snapshot of snapshots) {
    snapshotMap.set(snapshot.key, snapshot);
  }

  const orderedKeys: Array<[string, string]> = [
    ['dispatch', 'Dispatch team staffed and certified'],
    ['field', 'Field volunteers trained to Level 1'],
    ['comms', 'Radio/comms staff ready'],
    ['admin', 'Trust admin appointed and verified'],
    ['pod', 'Pod leads identified and trained'],
    ['engagement', 'Community engagement team ready'],
  ];

  for (const [key, label] of orderedKeys) {
    const snapshot = snapshotMap.get(key);
    if (!snapshot) {
      checklist.push({
        id: key,
        label,
        status: 'critical',
        helper: 'No data for this competency yet.',
      });
      continue;
    }
    checklist.push({
      id: key,
      label,
      status: snapshot.coverageStatus,
      helper: formatChecklistHelper(snapshot),
    });
  }

  const sessionsWindow = sessionsWithinRollingWindow(sessions, 30, 30);
  const scheduledCount = sessionsWindow.length;
  const coursesStatus =
    scheduledCount >= Math.max(1, snapshots.length) ? 'met' : scheduledCount > 0 ? 'at_risk' : 'critical';

  checklist.push({
    id: 'courses-scheduled',
    label: 'Required courses scheduled at least once per month',
    status: coursesStatus,
    helper:
      scheduledCount > 0
        ? `${scheduledCount} session${scheduledCount === 1 ? '' : 's'} scheduled within ±30 days.`
        : 'No sessions scheduled within the last or next 30 days.',
  });

  const sessionsWithWaitlist = sessions.filter((session) => {
    const waitlistParticipants = session.participants?.filter((participant) => participant.status === 'waitlist');
    const waitlistCount = session.seats?.waitlist ?? waitlistParticipants.length;
    return waitlistCount > 0;
  });

  const waitlistsBlocking = sessionsWithWaitlist.filter((session) => {
    const capacity = session.seats?.capacity ?? 0;
    const confirmed = session.seats?.confirmed ?? 0;
    return capacity > 0 && confirmed >= capacity;
  });

  const waitlistStatus =
    waitlistsBlocking.length > 0 ? 'critical' : sessionsWithWaitlist.length > 0 ? 'at_risk' : 'met';

  checklist.push({
    id: 'waitlists',
    label: 'Waitlists monitored and not blocking certification',
    status: waitlistStatus,
    helper:
      waitlistsBlocking.length > 0
        ? `${waitlistsBlocking.length} session${waitlistsBlocking.length === 1 ? '' : 's'} at capacity with waitlists.`
        : sessionsWithWaitlist.length > 0
          ? `${sessionsWithWaitlist.length} session${sessionsWithWaitlist.length === 1 ? '' : 's'} have waitlists — review openings.`
          : 'No active waitlists blocking enrollment.',
  });

  const totalExpired = snapshots.reduce((acc, snapshot) => acc + snapshot.expiredCount, 0);
  const expiredStatus = totalExpired === 0 ? 'met' : totalExpired <= 2 ? 'at_risk' : 'critical';

  checklist.push({
    id: 'expiring',
    label: 'Expiring certifications flagged',
    status: expiredStatus,
    helper:
      totalExpired === 0
        ? 'All tracked certifications are current.'
        : `${totalExpired} volunteer${totalExpired === 1 ? '' : 's'} need recertification.`,
  });

  const criticalKeys = snapshots
    .filter((snapshot) => snapshot.coverageStatus === 'critical')
    .map((snapshot) => snapshot.label)
    .filter((label): label is string => typeof label === 'string' && label.length > 0);
  const atRiskKeys = snapshots
    .filter((snapshot) => snapshot.coverageStatus === 'at_risk')
    .map((snapshot) => snapshot.label)
    .filter((label): label is string => typeof label === 'string' && label.length > 0);

  const criticalStatus = criticalKeys.length > 0 ? 'critical' : atRiskKeys.length > 0 ? 'at_risk' : 'met';

  checklist.push({
    id: 'no-critical-role',
    label: 'No critical role left unfilled',
    status: criticalStatus,
    helper:
      criticalKeys.length > 0
        ? `${summarizeKeys(criticalKeys)} need immediate coverage.`
        : atRiskKeys.length > 0
          ? `${summarizeKeys(atRiskKeys)} trending toward gaps.`
          : 'All operational minimums are currently covered.',
  });

  return checklist;
}
