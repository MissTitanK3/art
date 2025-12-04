import { useCallback, useMemo } from 'react';

import { academyCertificationOptions } from '@workspace/ui/lib/academy-utils.ts';
import { humanize } from '@workspace/ui/lib/utils';
import { normalizeCourseKey } from '@workspace/ui/lib/operational-coverage.ts';

export function useCourseLabelLookup() {
  const courseLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of academyCertificationOptions) {
      const key = normalizeCourseKey(option.id);
      if (!key) continue;
      map.set(key, option.label);
    }
    return map;
  }, []);

  const getCourseLabel = useCallback(
    (courseId: string) => {
      if (!courseId) return '';
      const normalized = normalizeCourseKey(courseId);
      return courseLabelMap.get(normalized) ?? humanize(courseId);
    },
    [courseLabelMap],
  );

  return {
    courseLabelMap,
    getCourseLabel,
  };
}
