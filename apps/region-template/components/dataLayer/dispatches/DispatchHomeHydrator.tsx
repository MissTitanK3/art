"use client";

import * as React from "react";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import type { DispatchSubmission } from "@workspace/store/types/global";
import type { DispatchShift } from "@workspace/store/useDispatchStore";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

function mapRowToSubmission(row: any): DispatchSubmission {
  const updates = Array.isArray(row?.updates) ? row.updates : [];
  const logistics = Array.isArray(row?.logistics) ? row.logistics : [];
  const location =
    row?.location && typeof row.location === "object"
      ? row.location
      : undefined;
  return {
    id: String(row.id ?? crypto.randomUUID()),
    type: row?.type ?? undefined,
    location,
    timestamp: String(row?.timestamp ?? new Date().toISOString()),
    date_of_event:
      typeof row?.date_of_event === "string" ? row.date_of_event : undefined,
    flagged: Boolean(row?.flagged ?? false),
    required_roles: Array.isArray(row?.required_roles)
      ? row.required_roles
      : undefined,
    encrypted_payload:
      typeof row?.encrypted_payload === "string"
        ? row.encrypted_payload
        : undefined,
    auto_delete_after: row?.auto_delete_after ?? null,
    integrity_hash:
      typeof row?.integrity_hash === "string" ? row.integrity_hash : undefined,
    submitted_by: row?.submitted_by ?? null,
    source: row?.source ?? undefined,
    visibility_radius_km:
      typeof row?.visibility_radius_km === "number"
        ? row.visibility_radius_km
        : undefined,
    status: (row?.status as any) ?? "unconfirmed",
    assigned_volunteers: Array.isArray(row?.assigned_volunteers)
      ? row.assigned_volunteers
      : undefined,
    required_roles_by_type:
      typeof row?.required_roles_by_type === "object" &&
      row?.required_roles_by_type
        ? row.required_roles_by_type
        : undefined,
    location_label:
      typeof row?.location_label === "string" ? row.location_label : undefined,
    point_of_contact: row?.point_of_contact ?? null,
    state: typeof row?.state === "string" ? row.state : undefined,
    intended_action_preset:
      typeof row?.intended_action_preset === "string"
        ? row.intended_action_preset
        : undefined,
    intended_action_notes:
      typeof row?.intended_action_notes === "string"
        ? row.intended_action_notes
        : undefined,
    intended_actions: Array.isArray(row?.intended_actions)
      ? row.intended_actions
      : undefined,
    intended_actions_custom:
      typeof row?.intended_actions_custom === "string"
        ? row.intended_actions_custom
        : undefined,
    signal_link:
      typeof row?.signal_link === "string" ? row.signal_link : undefined,
    public_signal_link:
      typeof row?.public_signal_link === "string"
        ? row.public_signal_link
        : undefined,
    training: Boolean(row?.training ?? false),
    updates,
    logistics,
  } as DispatchSubmission;
}

function mapRowToShift(row: any): DispatchShift {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    podId: typeof row?.pod_id === "string" ? row.pod_id : row?.podId,
    volunteerId:
      typeof row?.volunteer_id === "string"
        ? row.volunteer_id
        : row?.volunteerId,
    volunteerName:
      typeof row?.volunteer_name === "string"
        ? row.volunteer_name
        : row?.volunteerName,
    startsAt: String(
      row?.starts_at ?? row?.startsAt ?? new Date().toISOString(),
    ),
    endsAt: String(
      row?.ends_at ??
        row?.endsAt ??
        new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    ),
    notes: typeof row?.notes === "string" ? row.notes : undefined,
  } as DispatchShift;
}

export default function DispatchHomeHydrator() {
  const replaceSubmissions = useDispatchStore((s) => s.replaceSubmissions);
  const replaceShifts = useDispatchStore((s) => s.replaceShifts);

  React.useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const client = getSupabaseBrowserClient();
        const [submissionsRes, shiftsRes] = await Promise.all([
          client
            .from("dispatch_submissions")
            .select("*")
            .order("timestamp", { ascending: false }),
          client
            .from("dispatch_shifts")
            .select("*")
            .order("starts_at", { ascending: true }),
        ]);

        if (!cancelled) {
          if (!submissionsRes.error && Array.isArray(submissionsRes.data)) {
            const deduped = Array.from(
              new Map(
                submissionsRes.data.map((r: any) => [
                  String(r.id),
                  mapRowToSubmission(r),
                ]),
              ).values(),
            );
            replaceSubmissions(deduped);
          }

          if (!shiftsRes.error && Array.isArray(shiftsRes.data)) {
            const shifts = shiftsRes.data.map(mapRowToShift);
            replaceShifts(shifts);
          }
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[DispatchHomeHydrator] failed to hydrate home dashboard",
            e,
          );
        }
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [replaceSubmissions, replaceShifts]);

  return null;
}
