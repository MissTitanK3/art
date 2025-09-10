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

export function fakeUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Convert identifiers (snake_case, kebab-case, lowercase) into
 * human-readable, capitalized strings.
 */
export function humanize(input: string): string {
  if (!input) return '';

  return (
    input
      // replace underscores and dashes with spaces
      .replace(/[_-]+/g, ' ')
      // collapse multiple spaces
      .replace(/\s+/g, ' ')
      // trim
      .trim()
      // capitalize each word
      .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1))
  );
}

export const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300',
};

export const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export function chunkMessage(message: string, maxChars = 200): string[] {
  const words = message.split(' ');
  const chunks: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).length > maxChars) {
      chunks.push(current.trim());
      current = word;
    } else {
      current += ' ' + word;
    }
  }
  if (current) chunks.push(current.trim());

  return chunks;
}
