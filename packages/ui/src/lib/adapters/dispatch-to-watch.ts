import type { WizardReport } from "@workspace/store/types/watch.ts";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";

export function toWatchReports(submissions: DispatchSubmission[]): {
  reports: WizardReport[];
  idMap: Record<number, string>;
} {
  const idMap: Record<number, string> = {};
  const reports: WizardReport[] = submissions.map((d, i) => ({
    id: i + 1,
    timestamp: d.timestamp,
    agency_type: d.type ? [d.type] : null,
    agency_other: d.type ?? null,
    location: d.location as any,
    media_url: null,
    officer_moving: null,
    officer_direction: null,
    lights_on: null,
    sirens_on: null,
    submitted_by: d.submitted_by ?? null,
    test: d.training ?? null,
  }));
  reports.forEach((r, idx) => {
    const id = submissions[idx]?.id;
    if (id) idMap[r.id] = id;
  });
  return { reports, idMap };
}

