import { useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Label } from "@workspace/ui/components/label";
import { academyCertificationOptions } from "@workspace/ui/lib/academy-utils.ts";
import {
  OPERATIONAL_COVERAGE_AREAS,
  computeCoverageAreaStatuses,
  type OperationalCoverageAreaStatus,
  matchCertificationToCourse,
  normalizeCourseKey,
} from "@workspace/ui/lib/operational-coverage.ts";
import { humanize } from "@workspace/ui/lib/utils";
import type {
  NormalizedCertification,
  RosterEntryFormInput,
} from "@workspace/store/types/pod.ts";

import CertificationEditor from "../certifications/CertificationsEditor.tsx";
import { CoverageAreaToggleButton } from "./CoverageAreaToggleButton.tsx";

const COVERAGE_COURSE_LOOKUP = (() => {
  const map = new Map<string, { id: string; label: string }>();
  for (const option of academyCertificationOptions) {
    const key = normalizeCourseKey(option.id);
    if (!map.has(key)) {
      map.set(key, { id: option.id, label: option.label });
    }
  }
  return map;
})();

function resolveCoverageCourse(courseId: string): { id: string; label: string } {
  const normalized = normalizeCourseKey(courseId);
  const match = COVERAGE_COURSE_LOOKUP.get(normalized);
  if (match) {
    return match;
  }
  return {
    id: courseId,
    label: humanize(courseId),
  };
}

function certificationMatchesCourse(
  cert: NormalizedCertification,
  courseId: string,
) {
  const courseKey = normalizeCourseKey(courseId);
  if (!courseKey) return false;
  if (normalizeCourseKey(cert.id) === courseKey) return true;
  if (cert.display_name && normalizeCourseKey(cert.display_name) === courseKey) {
    return true;
  }
  return false;
}

function dedupeById(certs: NormalizedCertification[]): NormalizedCertification[] {
  const seen = new Map<string, NormalizedCertification>();
  for (const cert of certs) {
    seen.set(cert.id, cert);
  }
  return Array.from(seen.values());
}

type FormValues = RosterEntryFormInput;

type RosterEntryCoverageSectionProps = {
  isActive: boolean;
};

export function RosterEntryCoverageSection({
  isActive,
}: RosterEntryCoverageSectionProps) {
  const {
    watch,
    setValue,
    getValues,
  } = useFormContext<FormValues>();

  const certs = watch("certs") ?? [];

  const coverageStatuses = useMemo(
    () => computeCoverageAreaStatuses(certs),
    [certs],
  );

  const coverageStatusMap = useMemo(() => {
    const map = new Map<string, OperationalCoverageAreaStatus>();
    for (const status of coverageStatuses) {
      map.set(status.area.key, status);
    }
    return map;
  }, [coverageStatuses]);

  const activeCoverageStatuses = useMemo(
    () => coverageStatuses.filter((status) => status.status !== "missing"),
    [coverageStatuses],
  );

  const handleToggleCoverageArea = useCallback(
    (areaKey: string) => {
      const area = OPERATIONAL_COVERAGE_AREAS.find((entry) => entry.key === areaKey);
      if (!area) return;
      const currentCerts = getValues("certs") ?? [];
      const currentStatuses = computeCoverageAreaStatuses(currentCerts);
      const targetStatus = currentStatuses.find((entry) => entry.area.key === areaKey);
      const isActiveArea = targetStatus?.status !== "missing";

      if (isActiveArea) {
        const nextCerts = currentCerts.filter((cert) => {
          const matchesArea = area.requiredCourses.some((courseId) =>
            certificationMatchesCourse(cert, courseId),
          );
          if (!matchesArea) return true;
          const usedElsewhere = currentStatuses.some((entry) => {
            if (entry.area.key === areaKey) return false;
            if (entry.status === "missing") return false;
            return entry.area.requiredCourses.some((courseId) =>
              certificationMatchesCourse(cert, courseId),
            );
          });
          return usedElsewhere;
        });
        setValue("certs", nextCerts, { shouldDirty: true, shouldTouch: true });
        return;
      }

      const nextCerts: NormalizedCertification[] = [...currentCerts];
      for (const courseId of area.requiredCourses) {
        const existing = matchCertificationToCourse(courseId, nextCerts);
        if (existing) continue;
        const courseDetails = resolveCoverageCourse(courseId);
        nextCerts.push({
          id: courseDetails.id,
          display_name: courseDetails.label,
        });
      }
      setValue("certs", nextCerts, { shouldDirty: true, shouldTouch: true });
    },
    [getValues, setValue],
  );

  const handleCoverageCoursesChange = useCallback(
    (areaKey: string, nextAreaCerts: NormalizedCertification[]) => {
      const area = OPERATIONAL_COVERAGE_AREAS.find((entry) => entry.key === areaKey);
      if (!area) return;
      const currentCerts = getValues("certs") ?? [];
      const areaCourseKeys = new Set(
        area.requiredCourses.map((courseId) => normalizeCourseKey(courseId)),
      );
      const retained = currentCerts.filter((cert) => {
        const idKey = normalizeCourseKey(cert.id);
        const nameKey = cert.display_name
          ? normalizeCourseKey(cert.display_name)
          : "";
        return !areaCourseKeys.has(idKey) && !areaCourseKeys.has(nameKey);
      });
      const merged = [...retained, ...dedupeById(nextAreaCerts)];
      setValue("certs", merged, { shouldDirty: true, shouldTouch: true });
    },
    [getValues, setValue],
  );

  return (
    <div
      className={`grid gap-2${isActive ? "" : " hidden"}`}
      aria-hidden={!isActive}
    >
      <Label>Operational Coverage</Label>
      <p className="text-xs text-muted-foreground">
        Toggle coverage areas to auto-add required courses and update their
        progress.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPERATIONAL_COVERAGE_AREAS.map((area) => (
          <CoverageAreaToggleButton
            key={area.key}
            area={area}
            status={coverageStatusMap.get(area.key)}
            onToggle={handleToggleCoverageArea}
          />
        ))}
      </div>
      {activeCoverageStatuses.length > 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed bg-muted/40 p-3">
          {activeCoverageStatuses.map((status) => {
            const coverageCerts = status.area.requiredCourses
              .map((courseId) => matchCertificationToCourse(courseId, certs))
              .filter((cert): cert is NormalizedCertification => Boolean(cert));
            const missingLabels = status.missingCourses.map(
              (courseId) => resolveCoverageCourse(courseId).label,
            );

            return (
              <div
                key={status.area.key}
                className="space-y-2 rounded-md border border-border/60 bg-background/40 p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {status.area.label}
                  </p>
                  {status.area.description ? (
                    <p className="text-xs text-muted-foreground">
                      {status.area.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {status.status === "ready"
                      ? "All required courses completed."
                      : "Keep course statuses current so coverage dashboards stay accurate."}
                  </p>
                </div>
                <CertificationEditor
                  value={coverageCerts}
                  onChange={(next) =>
                    handleCoverageCoursesChange(status.area.key, next)
                  }
                />
                {missingLabels.length > 0 ? (
                  <p className="text-xs text-amber-600">
                    Missing: {missingLabels.join(", ")}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Select a coverage area above to start tracking operational
          requirements.
        </p>
      )}
    </div>
  );
}
