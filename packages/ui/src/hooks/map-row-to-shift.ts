import type { DispatchShift } from "@workspace/store/useDispatchStore";

/**
 * Normalizes a raw shift row into the DispatchShift shape used by the UI.
 */
export function mapRowToShift(row: unknown): DispatchShift {
  const typedRow = row as Record<string, unknown> | null;

  return {
    id: String(typedRow?.id ?? crypto.randomUUID()),
    podId:
      typeof typedRow?.pod_id === "string"
        ? typedRow.pod_id
        : (typedRow?.podId as string | undefined),
    volunteerId:
      typeof typedRow?.volunteer_id === "string"
        ? typedRow.volunteer_id
        : (typedRow?.volunteerId as string | undefined),
    volunteerName:
      typeof typedRow?.volunteer_name === "string"
        ? typedRow.volunteer_name
        : typeof (typedRow as any)?.profile?.display_name === "string"
          ? (typedRow as any).profile.display_name
          : (typedRow?.volunteerName as string | undefined),
    startsAt: String(
      typedRow?.starts_at ??
        typedRow?.startsAt ??
        new Date().toISOString()
    ),
    endsAt: String(
      typedRow?.ends_at ??
        typedRow?.endsAt ??
        new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    ),
    notes:
      typeof typedRow?.notes === "string" ? typedRow.notes : undefined,
  };
}
