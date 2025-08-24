import { CertificationLevel } from '@workspace/store/types/pod.ts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const CERTIFICATION_LEVELS: CertificationLevel[] = [
  'incomplete',
  'in_progress',
  'completed',
  'mentor', // new
  'expired',
];

export const CERTIFICATION_LABELS: Record<CertificationLevel, string> = {
  incomplete: 'Incomplete',
  in_progress: 'In Progress',
  completed: 'Completed',
  expired: 'Expired',
  mentor: 'Mentor / Peer Guide',
};

export const CERTIFICATION_COLORS: Record<CertificationLevel, string> = {
  incomplete: 'text-zinc-400',
  in_progress: 'text-amber-500',
  completed: 'text-emerald-600',
  expired: 'text-rose-500',
  mentor: 'text-indigo-500',
};

export const CERTIFICATION_FILL: Record<CertificationLevel, number> = {
  incomplete: 0,
  in_progress: 2,
  completed: 3,
  mentor: 4,
  expired: 1,
};
// convenient helpers
export function certificationLabel(level?: CertificationLevel) {
  return level ? CERTIFICATION_LABELS[level] : '—';
}

export function certificationColor(level?: CertificationLevel) {
  return level ? CERTIFICATION_COLORS[level] : 'text-zinc-400';
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function combineLocalDateTime(dateStr: string, timeStr: string) {
  // Treats values as local time and returns an ISO string
  // If either is missing, return empty so validation can catch it.
  if (!dateStr || !timeStr) return '';
  // `new Date("YYYY-MM-DDTHH:mm")` is parsed in local TZ
  const d = new Date(`${dateStr}T${timeStr}`);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}
