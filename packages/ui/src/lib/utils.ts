import { CertificationLevel } from '@workspace/store/types/pod.ts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateTime } from 'luxon';

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

/**
 * Format an ISO start/end into a human-readable range in a given timezone.
 *
 * Example:
 *   formatDateRange(
 *     "2025-08-24T19:40:00.000Z",
 *     "2025-08-25T01:40:00.000Z",
 *     "America/Los_Angeles"
 *   )
 * → "Aug 24, 2025 12:40 PM → 6:40 PM (America/Los_Angeles)"
 */
export function formatDateRange(startIso: string, endIso: string, tz: string): string {
  const start = DateTime.fromISO(startIso, { zone: 'utc' }).setZone(tz);
  const end = DateTime.fromISO(endIso, { zone: 'utc' }).setZone(tz);

  const sameDay = start.hasSame(end, 'day');

  if (sameDay) {
    // e.g. "Aug 24, 2025 12:40 PM → 6:40 PM (America/Los_Angeles)"
    return `${start.toFormat('MMM d, yyyy h:mm a')} → ${end.toFormat('h:mm a')} (${tz})`;
  } else {
    // e.g. "Aug 24, 2025 11:40 PM → Aug 25, 2025 5:40 AM (America/Los_Angeles)"
    return `${start.toFormat('MMM d, yyyy h:mm a')} → ${end.toFormat('MMM d, yyyy h:mm a')} (${tz})`;
  }
}
