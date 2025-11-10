import type { DetaineeIntake } from "../types/missing-person-intake";

const FALLBACK_PREFIX = "case-";

const encodeSlug = (value: string) =>
  encodeURIComponent(value.trim().toLowerCase());

/**
 * Generates a stable slug identifier for a missing person record.
 * Priority order: case ID → full name → A-number → created timestamp → random suffix.
 */
export function getMissingPersonSlug(record: DetaineeIntake): string {
  if (record.caseId) {
    return encodeSlug(record.caseId);
  }

  if (record.fullName) {
    return encodeSlug(record.fullName.replace(/\s+/g, "-"));
  }

  if (record.aNumber) {
    return encodeSlug(record.aNumber);
  }

  if (record.createdAt) {
    return encodeSlug(`${FALLBACK_PREFIX}${record.createdAt}`);
  }

  return encodeSlug(
    `${FALLBACK_PREFIX}${Math.random().toString(36).slice(2, 8)}`,
  );
}
