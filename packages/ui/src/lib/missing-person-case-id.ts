export const DEFAULT_CASE_ZONE = "REGION";
export const CASE_ID_STORAGE_KEY = "missing-persons-case-ids";
const SEQUENCE_LENGTH = 3;

export function normaliseCaseId(caseId: string): string {
  return caseId.trim().toUpperCase();
}

export function buildCaseIdPrefix(
  zone: string = DEFAULT_CASE_ZONE,
  now: Date = new Date(),
): string {
  return `${normaliseCaseId(zone)}-${now.getFullYear()}`;
}

export function nextCaseId(
  prefix: string,
  existingIds: Iterable<string>,
): string {
  const normalisedPrefix = normaliseCaseId(prefix);
  const regex = new RegExp(
    `^${normalisedPrefix}-([0-9]{${SEQUENCE_LENGTH}})$`,
    "i",
  );

  let maxSequence = 0;
  for (const id of existingIds) {
    const match = normaliseCaseId(id).match(regex);
    if (match && match[1]) {
      const current = Number.parseInt(match[1], 10);
      if (!Number.isNaN(current) && current > maxSequence) {
        maxSequence = current;
      }
    }
  }

  const nextSequence = (maxSequence + 1)
    .toString()
    .padStart(SEQUENCE_LENGTH, "0");

  return `${normalisedPrefix}-${nextSequence}`;
}

export function generateNextCaseId(
  zone: string,
  existingIds: Iterable<string>,
  now: Date = new Date(),
): string {
  const prefix = buildCaseIdPrefix(zone, now);
  return nextCaseId(prefix, existingIds);
}

export function collectCaseIds(
  records: Iterable<{ caseId?: string | null }>,
): string[] {
  const seen = new Map<string, string>();
  for (const record of records) {
    const value = record.caseId;
    if (!value) continue;
    const normalised = normaliseCaseId(value);
    if (!seen.has(normalised)) {
      seen.set(normalised, value);
    }
  }
  return Array.from(seen.values());
}

export function isCaseIdDuplicate(
  caseId: string,
  existingIds: Iterable<string>,
): boolean {
  const target = normaliseCaseId(caseId);
  for (const id of existingIds) {
    if (normaliseCaseId(id) === target) {
      return true;
    }
  }
  return false;
}
