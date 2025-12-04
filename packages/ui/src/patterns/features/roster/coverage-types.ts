import type { CertificationLevel } from '@workspace/store/types/pod.ts';

export type CoverageCourseSelection = CertificationLevel | 'unset' | 'remove';

export type CoverageCourseStatus = CertificationLevel | 'missing' | 'untracked';
