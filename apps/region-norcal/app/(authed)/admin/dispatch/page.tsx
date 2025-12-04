"use client";
import { useEffect, useState } from "react";
import DispatchClient from "@workspace/ui/layout/admin/dispatch/dispatch";
import {
  DispatchStoreProvider,
  useDispatchStore,
} from "@/providers/DispatchStoreProvider";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
function mapRow(row: any): DispatchSubmission {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    type: row?.type ?? undefined,
    location:
      row?.location && typeof row.location === "object"
        ? row.location
        : undefined,
    timestamp: String(row?.timestamp ?? new Date().toISOString()),
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
    updates: Array.isArray(row?.updates) ? row.updates : [],
    logistics: Array.isArray(row?.logistics) ? row.logistics : [],
  } as DispatchSubmission;
}
function AdminDispatchBridge() {
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);
  const replaceSubmissions = useDispatchStore((s) => s.replaceSubmissions);
  const submissions = useDispatchStore((s) => s.submissions);
  const [initial, setInitial] = useState<DispatchSubmission[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dispatches", {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const rows = Array.isArray(json?.submissions) ? json.submissions : [];
          const mapped = rows.map(mapRow);
          if (!cancelled) {
            setInitial(mapped);
            // Replace store for consistency across app
            replaceSubmissions(mapped);
          }
        }
      } catch (e) {
        console.warn("[AdminDispatchDataLayer] failed to load dispatches", e);
        if (!cancelled) setInitial(submissions);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [replaceSubmissions, submissions]);
  return (
    <DispatchClient
      initialItems={initial ?? submissions}
      onToggleFlag={(id, flagged) => updateSubmission(id, { flagged })}
    />
  );
}
export default function AdminDispatchPage() {
  return (
    <DispatchStoreProvider>
      <AdminDispatchBridge />
    </DispatchStoreProvider>
  );
}
