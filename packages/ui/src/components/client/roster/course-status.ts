import type { CertificationLevel } from '@workspace/store/types/pod.ts';
import { certificationLabel } from '@workspace/ui/lib/utils';

import type { CoverageCourseStatus } from './coverage-types';

const CERTIFICATION_STATUS_BADGES: Record<CertificationLevel, string> = {
  incomplete: 'border-slate-300 bg-slate-100 text-slate-700',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  mentor: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  expired: 'border-rose-200 bg-rose-50 text-rose-700',
};

const EXTRA_STATUS_BADGES: Record<Exclude<CoverageCourseStatus, CertificationLevel>, string> = {
  missing: 'border-rose-300 bg-rose-100 text-rose-800',
  untracked: 'border-border/60 bg-muted/30 text-muted-foreground',
};

export function getCourseStatusBadgeClass(status: CoverageCourseStatus) {
  if (status === 'missing' || status === 'untracked') {
    return EXTRA_STATUS_BADGES[status];
  }
  return CERTIFICATION_STATUS_BADGES[status];
}

export function getCourseStatusLabel(status: CoverageCourseStatus) {
  if (status === 'missing') {
    return 'Missing';
  }
  if (status === 'untracked') {
    return 'Not Tracked';
  }
  return certificationLabel(status);
}
