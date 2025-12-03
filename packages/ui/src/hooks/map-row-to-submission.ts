import type { DispatchSubmission } from "@workspace/store/types/global";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeLocation(
  raw: unknown,
): DispatchSubmission["location"] | undefined {
  if (!isRecord(raw)) return undefined;
  const lat = raw.lat;
  const lng = raw.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  return { ...raw, lat, lng } as DispatchSubmission["location"];
}

function toOptionalString(value: unknown): string | null | undefined {
  if (typeof value === "string") return value;
  if (value === null) return null;
  return undefined;
}

function normalizeAssignedVolunteers(
  raw: unknown,
): DispatchSubmission["assigned_volunteers"] {
  if (Array.isArray(raw)) return raw as DispatchSubmission["assigned_volunteers"];
  if (raw && typeof raw === "object") {
    const entries = Object.values(raw as Record<string, unknown>).flatMap(
      (value) => {
        if (Array.isArray(value)) return value as any[];
        return value ? [value] : [];
      },
    );
    return entries.length ? (entries as DispatchSubmission["assigned_volunteers"]) : undefined;
  }
  return undefined;
}

function normalizeRequiredRolesByType(
  raw: unknown,
): Record<string, number> | undefined {
  if (!isRecord(raw) || Array.isArray(raw)) return undefined;
  const next: Record<string, number> = {};
  let hasValue = false;
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === "number") {
      next[key] = val;
      hasValue = true;
    }
  }
  return hasValue ? next : undefined;
}

/**
 * Normalizes a raw dispatch submission row into the shape expected by the UI.
 */
export function mapRowToSubmission(row: unknown): DispatchSubmission {
  const typedRow: Record<string, unknown> = isRecord(row) ? row : {};
  const updates = Array.isArray(typedRow.updates) ? typedRow.updates : [];
  const logistics = Array.isArray(typedRow.logistics) ? typedRow.logistics : [];
  const location = normalizeLocation(typedRow.location);

  return {
    id: String(typedRow.id ?? crypto.randomUUID()),
    type: typedRow.type as DispatchSubmission["type"] | undefined,
    location,
    timestamp: String(typedRow.timestamp ?? new Date().toISOString()),
    date_of_event:
      typeof typedRow.date_of_event === "string"
        ? typedRow.date_of_event
        : (typedRow.date_of_event as DispatchSubmission["date_of_event"]),
    flagged: Boolean(typedRow.flagged ?? false),
    required_roles: Array.isArray(typedRow.required_roles)
      ? typedRow.required_roles
      : undefined,
    encrypted_payload:
      typeof typedRow.encrypted_payload === "string"
        ? typedRow.encrypted_payload
        : undefined,
    auto_delete_after: toOptionalString(typedRow.auto_delete_after) ?? null,
    integrity_hash:
      typeof typedRow.integrity_hash === "string"
        ? typedRow.integrity_hash
        : undefined,
    submitted_by: toOptionalString(typedRow.submitted_by) ?? null,
    source: typedRow.source as DispatchSubmission["source"] | undefined,
    visibility_radius_km:
      typeof typedRow.visibility_radius_km === "number"
        ? typedRow.visibility_radius_km
        : undefined,
    status: (typedRow.status as DispatchSubmission["status"]) ?? "unconfirmed",
    assigned_volunteers: normalizeAssignedVolunteers(typedRow.assigned_volunteers),
    required_roles_by_type:
      normalizeRequiredRolesByType(typedRow.required_roles_by_type),
    location_label:
      typeof typedRow.location_label === "string"
        ? typedRow.location_label
        : undefined,
    point_of_contact: toOptionalString(typedRow.point_of_contact) ?? null,
    state: typeof typedRow.state === "string" ? typedRow.state : undefined,
    intended_action_preset:
      typeof typedRow.intended_action_preset === "string"
        ? typedRow.intended_action_preset
        : undefined,
    intended_action_notes:
      typeof typedRow.intended_action_notes === "string"
        ? typedRow.intended_action_notes
        : undefined,
    intended_actions: Array.isArray(typedRow.intended_actions)
      ? typedRow.intended_actions
      : undefined,
    intended_actions_custom:
      typeof typedRow.intended_actions_custom === "string"
        ? typedRow.intended_actions_custom
        : undefined,
    signal_link:
      typeof typedRow.signal_link === "string" ? typedRow.signal_link : undefined,
    public_signal_link:
      typeof typedRow.public_signal_link === "string"
        ? typedRow.public_signal_link
        : undefined,
    training: Boolean(typedRow.training ?? false),
    people_served:
      typeof typedRow.people_served === "number"
        ? typedRow.people_served
        : undefined,
    resources_distributed:
      typeof typedRow.resources_distributed === "number"
        ? typedRow.resources_distributed
        : undefined,
    risk_level: typedRow.risk_level as DispatchSubmission["risk_level"],
    updated_by: toOptionalString(typedRow.updated_by),
    updated_at:
      typeof typedRow.updated_at === "string"
        ? typedRow.updated_at
        : undefined,
    volunteer_attributions: Array.isArray(typedRow.volunteer_attributions)
      ? (typedRow.volunteer_attributions as DispatchSubmission["volunteer_attributions"])
      : undefined,
    updates,
    logistics,
  };
}
