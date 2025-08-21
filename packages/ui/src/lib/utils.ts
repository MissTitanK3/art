import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
