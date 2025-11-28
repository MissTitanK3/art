"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { DispatchListLayout } from "@workspace/ui/layout/dispatch/DispatchListLayout";
import { DispatchSubmission } from "@workspace/store/types/global.ts";

import { REGION_IDENTIFIER } from "@/app/brand_settings";

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
      typeof row?.date_of_event === "string"
        ? row.date_of_event
        : (row?.date_of_event ?? undefined),
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

type ListFilters = {
  q?: string;
  status?: string;
  type?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

async function fetchDispatchesFromDatabase(
  filters?: ListFilters,
): Promise<DispatchSubmission[] | null> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      const { status, type, from, to, q } = filters;
      if (status) params.set("status", status);
      if (type) params.set("type", type);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (q) params.set("q", q);
    }

    const response = await fetch(`/api/dispatches?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch dispatches");
    const data = await response.json();
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapRowToSubmission);
  } catch (e) {
    console.warn("[DispatchListDataLayer] fetch error", e);
    return null;
  }
}

export default function DispatchesPage() {
  const submissions = useDispatchStore((s) => s.submissions);
  const replaceSubmissions = useDispatchStore((s) => s.replaceSubmissions);
  const [remoteSubmissions, setRemoteSubmissions] = React.useState<
    typeof submissions | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoading(true);
      try {
        const paramsRecord = Object.fromEntries(
          (searchParams ?? new URLSearchParams()).entries(),
        );
        const filters: ListFilters = {
          q: paramsRecord.q,
          status: paramsRecord.status,
          type: paramsRecord.type,
          from: paramsRecord.from,
          to: paramsRecord.to,
        };
        const result = await fetchDispatchesFromDatabase(filters);
        if (!cancelled && Array.isArray(result) && result.length > 0) {
          // Dedupe by id to avoid duplicate keys in UI
          const map = new Map<string, DispatchSubmission>();
          for (const r of result) map.set(r.id, r);
          const unique = Array.from(map.values());
          setRemoteSubmissions(unique);

          // Replace local persisted store with latest from DB
          replaceSubmissions(unique);
        } else if (!cancelled && Array.isArray(result) && result.length === 0) {
          setRemoteSubmissions([]);
          replaceSubmissions([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "DispatchListDataLayer: failed to fetch dispatches",
            error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [replaceSubmissions, searchParams]);

  const data = React.useMemo(() => {
    const base = remoteSubmissions ?? submissions;
    // Dedupe by id on the client to prevent duplicate key warnings during initial render
    const map = new Map<string, DispatchSubmission>();
    for (const r of base) map.set(r.id, r);
    const unique = Array.from(map.values());
    return unique.sort(
      (a, b) =>
        new Date(a.date_of_event ?? a.timestamp).getTime() -
        new Date(b.date_of_event ?? b.timestamp).getTime(),
    );
  }, [remoteSubmissions, submissions]);

  return (
    <DispatchListLayout
      submissions={data}
      initialUrlParams={Object.fromEntries(
        (searchParams ?? new URLSearchParams()).entries(),
      )}
      onUrlChange={(url) => router.replace(url)}
      persistKey={`dispatchList.filters:${REGION_IDENTIFIER}`}
      LinkComponent={({ href, children }) => (
        <Link href={href} className="block hover:no-underline">
          {children}
        </Link>
      )}
      loadingState={
        loading ? (
          <p className="text-sm text-muted-foreground">
            Loading dispatch submissions...
          </p>
        ) : undefined
      }
    />
  );
}
