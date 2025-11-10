import { COURSE_BLUEPRINT } from '@workspace/ui/data/academy/course-blueprint';
import type { NormalizedCertification } from '@workspace/store/types/pod';

export function slugifyIdentifier(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function createCertification(label: string, idOverride?: string, idPrefix = 'custom'): NormalizedCertification {
  const trimmed = label.trim();
  const slug = slugifyIdentifier(trimmed);
  const fallback = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id: idOverride ?? `${idPrefix}-${slug || fallback}`,
    display_name: trimmed,
  };
}

export const academyCertificationOptions: Array<{ id: string; label: string }> = (() => {
  const unique = new Map<string, string>();
  for (const group of COURSE_BLUEPRINT) {
    for (const course of group.courses) {
      const optionId = course.certId ?? course.slug;
      const optionLabel = course.title;
      if (!optionLabel) continue;
      if (!unique.has(optionId)) {
        unique.set(optionId, optionLabel);
      }
    }
  }
  return Array.from(unique.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => String(a.label ?? '').localeCompare(String(b.label ?? '')));
})();
