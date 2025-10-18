'use client'

import type {
  AcademyInstructorProfile,
  AcademyInstructorRegistrationStatus,
  AcademyInstructorVettingStatus,
  AcademyTrainingSession,
} from '@workspace/store/types/academy.ts'

export const modalityLabels: Record<AcademyTrainingSession['modality'], string> = {
  in_person: 'In Person',
  online: 'Online',
  hybrid: 'Hybrid',
}

export const instructorTypeLabels: Record<AcademyInstructorProfile['type'], string> = {
  dispatcher: 'Dispatcher Instructor',
  mentor: 'Mentor',
  expert: 'Subject Expert',
}

export const availabilityLabels: Record<AcademyInstructorProfile['availability'], string> = {
  available: 'Available',
  limited: 'Limited',
  unavailable: 'Unavailable',
}

export const instructorRegistrationLabels: Record<AcademyInstructorRegistrationStatus, string> = {
  registered: 'Registered',
  guest: 'Guest SME',
}

export const instructorVettingLabels: Record<AcademyInstructorVettingStatus, string> = {
  awaiting_verification: 'Awaiting Verification',
  needs_review: 'Needs Review',
  cleared: 'Cleared',
}

export const instructorVettingMessages: Record<AcademyInstructorVettingStatus, string> = {
  awaiting_verification: 'Awaiting verification before leading sessions.',
  needs_review: 'Needs re-verification before leading sessions.',
  cleared: 'Cleared for live instruction.',
}

export const instructorVettingClasses: Record<AcademyInstructorVettingStatus, string> = {
  awaiting_verification: 'text-amber-500',
  needs_review: 'text-rose-500',
  cleared: 'text-emerald-600',
}

export function formatSessionRange(startIso: string, endIso: string, tz?: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)

  let safeTz: string | undefined = tz
  try {
    if (tz) {
      new Intl.DateTimeFormat(undefined, { timeZone: tz })
    }
  } catch {
    safeTz = undefined
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    timeZone: safeTz,
  })
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: safeTz,
  })

  const startDate = dateFormatter.format(start)
  const startTime = timeFormatter.format(start)
  const endTime = timeFormatter.format(end)
  const tzLabel = safeTz ? ` (${safeTz})` : ''

  return `${startDate} • ${startTime} → ${endTime}${tzLabel}`
}

export function formatDurationLabel(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) {
    return '1 hr'
  }
  if (hours < 1) {
    const minutes = Math.round(hours * 60)
    return `${minutes} min`
  }
  if (Number.isInteger(hours)) {
    return `${hours} hr${hours === 1 ? '' : 's'}`
  }
  return `${hours.toFixed(1)} hr`
}

export function formatNextSessionLabel(startIso?: string) {
  if (!startIso) {
    return undefined
  }
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) {
    return undefined
  }
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return formatter.format(start)
}
