"use client";

import * as React from "react";
import Link from "next/link";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { DispatchListLayout } from "@workspace/ui/layout/dispatch/DispatchListLayout";
import { DispatchSubmission } from "@workspace/store/types/global.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

function mapRowToSubmission(row: any): DispatchSubmission {
  const updates = Array.isArray(row?.updates) ? row.updates : [];
  const logistics = Array.isArray(row?.logistics) ? row.logistics : [];
  const location = row?.location && typeof row.location === "object" ? row.location : undefined;
  return {
    id: String(row.id ?? crypto.randomUUID()),
    type: row?.type ?? undefined,
    location,
    timestamp: String(row?.timestamp ?? new Date().toISOString()),
    flagged: Boolean(row?.flagged ?? false),
    required_roles: Array.isArray(row?.required_roles) ? row.required_roles : undefined,
    encrypted_payload: typeof row?.encrypted_payload === "string" ? row.encrypted_payload : undefined,
    auto_delete_after: row?.auto_delete_after ?? null,
    integrity_hash: typeof row?.integrity_hash === "string" ? row.integrity_hash : undefined,
    submitted_by: row?.submitted_by ?? null,
    source: row?.source ?? undefined,
    visibility_radius_km: typeof row?.visibility_radius_km === "number" ? row.visibility_radius_km : undefined,
    status: (row?.status as any) ?? "unconfirmed",
    assigned_volunteers: Array.isArray(row?.assigned_volunteers) ? row.assigned_volunteers : undefined,
    required_roles_by_type: typeof row?.required_roles_by_type === "object" && row?.required_roles_by_type
      ? row.required_roles_by_type
      : undefined,
    location_label: typeof row?.location_label === "string" ? row.location_label : undefined,
    point_of_contact: row?.point_of_contact ?? null,
    state: typeof row?.state === "string" ? row.state : undefined,
    intended_action_preset: typeof row?.intended_action_preset === "string" ? row.intended_action_preset : undefined,
    intended_action_notes: typeof row?.intended_action_notes === "string" ? row.intended_action_notes : undefined,
    intended_actions: Array.isArray(row?.intended_actions) ? row.intended_actions : undefined,
    intended_actions_custom: typeof row?.intended_actions_custom === "string" ? row.intended_actions_custom : undefined,
    signal_link: typeof row?.signal_link === "string" ? row.signal_link : undefined,
    public_signal_link: typeof row?.public_signal_link === "string" ? row.public_signal_link : undefined,
    training: Boolean(row?.training ?? false),
    updates,
    logistics,
  } as DispatchSubmission;
}

async function fetchDispatchesFromDatabase(): Promise<DispatchSubmission[] | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("dispatch_submissions")
      .select("*")
      .order("timestamp", { ascending: false });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    const mapped = rows.map(mapRowToSubmission);
    // de-dupe by id in case of race conditions
    return Array.from(new Map(mapped.map((r) => [r.id, r])).values());
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[DispatchListDataLayer] supabase fetch error", e);
    }
    return null;
  }
}

export default function DispatchListDataLayer() {
  const submissions = useDispatchStore((s) => s.submissions);
  const [remoteSubmissions, setRemoteSubmissions] = React.useState<typeof submissions | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoading(true);
      try {
        const result = await fetchDispatchesFromDatabase();
        if (!cancelled && Array.isArray(result) && result.length > 0) {
          setRemoteSubmissions(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("DispatchListDataLayer: failed to fetch dispatches", error);
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
  }, []);

  const data = React.useMemo(() => {
    const source = remoteSubmissions ?? submissions;
    // De-dupe by id to avoid React key collisions when persisted/demo data overlaps
    const unique = Array.from(new Map(source.map((s) => [s.id, s])).values());
    return unique.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [remoteSubmissions, submissions]);

  return (
    <DispatchListLayout
      submissions={data}
      LinkComponent={({ href, children }) => (
        <Link href={href} className="block hover:no-underline">
          {children}
        </Link>
      )}
      loadingState={loading ? (
        <p className="text-sm text-muted-foreground">Loading dispatch submissions...</p>
      ) : undefined}
    />
  );
}
