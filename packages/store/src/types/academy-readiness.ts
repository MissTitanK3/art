import type { AcademyMemberProgress, AcademyTrainingSession } from './academy.ts';
import type { NormalizedCertification } from './pod.ts';

export type RegionOperationalMinimumKey =
  | 'dispatch'
  | 'field'
  | 'comms'
  | 'admin'
  | 'pod'
  | 'engagement'
  | (string & {});

export type RegionOperationalMinimumDefinition = {
  key: RegionOperationalMinimumKey;
  label: string;
  description?: string;
  requiredCount: number;
  requiredCourses: string[];
  staffingRange?: [number, number?];
  tags?: string[];
  emphasis?: string;
};

export type RegionOperationalMinimumOverride = Partial<Omit<RegionOperationalMinimumDefinition, 'key'>> & {
  key: RegionOperationalMinimumKey;
};

export type RegionOperationalMinimumMemberStatus = 'active' | 'in_progress' | 'expired' | 'not_started';

export type RegionOperationalMinimumMemberSummary = {
  id: string;
  name: string;
  status: RegionOperationalMinimumMemberStatus;
  missingCourses?: string[];
  certificationId?: string;
  certificationName?: string;
  completedAt?: string | null;
  expiresAt?: string | null;
  expiringSoon?: boolean;
  interestedCourses?: string[];
};

export type RegionOperationalMinimumCoverage = {
  key: RegionOperationalMinimumKey;
  active: RegionOperationalMinimumMemberSummary[];
  inProgress: RegionOperationalMinimumMemberSummary[];
  expired: RegionOperationalMinimumMemberSummary[];
  pipeline: RegionOperationalMinimumMemberSummary[];
  expiringSoon: RegionOperationalMinimumMemberSummary[];
  dependencyWarnings: string[];
};

export type RegionOperationalMinimumCompletionRecord = {
  memberId: string;
  certifications: NormalizedCertification[];
};

export type RegionOperationalMinimumCompletionsInput =
  | RegionOperationalMinimumCompletionRecord[]
  | Record<string, NormalizedCertification[]>
  | AcademyMemberProgress[]
  | undefined;

export type RegionOperationalMinimumSnapshotStatus = 'met' | 'at_risk' | 'critical';

export type RegionOperationalMinimumSnapshot = {
  key: RegionOperationalMinimumKey;
  label: string;
  description?: string;
  requiredCount: number;
  staffingRange?: [number, number?];
  requiredCourses: string[];
  coverageStatus: RegionOperationalMinimumSnapshotStatus;
  activeCount: number;
  inProgressCount: number;
  expiredCount: number;
  unmetCount: number;
  coveragePercent: number;
  supportingMembers: RegionOperationalMinimumMemberSummary[];
  pipelineMembers: RegionOperationalMinimumMemberSummary[];
  expiringSoonMembers?: RegionOperationalMinimumMemberSummary[];
  dependencyWarnings?: string[];
  coverageSummary?: string;
  deficitSummary?: string;
  gaps: string[];
  recommendedCourses: string[];
  emphasis?: string;
};

export type RegionReadinessChecklistStatus = 'met' | 'at_risk' | 'critical';

export type RegionReadinessChecklistItem = {
  id: string;
  label: string;
  status: RegionReadinessChecklistStatus;
  helper?: string;
};

export type RegionOperationalMinimumEvaluationContext = {
  minimums: RegionOperationalMinimumDefinition[];
  members: AcademyMemberProgress[];
};

export type RegionReadinessChecklistContext = {
  snapshots: RegionOperationalMinimumSnapshot[];
  sessions: AcademyTrainingSession[];
};

export type RegionOperationalMinimumsOverridesPayload =
  | RegionOperationalMinimumOverride[]
  | Record<string, unknown>
  | null
  | undefined;

export type RegionOperationalMinimumCertificationMatch = {
  requirement: string;
  certification?: NormalizedCertification;
  status: 'active' | 'in_progress' | 'expired' | 'missing';
};
