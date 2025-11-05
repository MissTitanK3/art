"use client";

import * as React from "react";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { usePodStore } from "@/providers/PodStoreProvider";
import { DispatchSubmissionLayout } from "@workspace/ui/layout/dispatch/DispatchSubmissionLayout";

import { DispatchSubmission } from "@workspace/store/types/global.ts";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import type { DispatchUpdate, LogisticsItem } from "@workspace/store/types/dispatch";
import CommsDashboardDataLayer from "@/components/dataLayer/dispatches/CommsDashboardDataLayer";

type Props = {
  id: string;
};

function mapRowToSubmission(row: any): DispatchSubmission {
  const updates = Array.isArray(row?.updates) ? row.updates : [];
  const logistics = Array.isArray(row?.logistics) ? row.logistics : [];
  const location = row?.location && typeof row.location === "object" ? row.location : undefined;
  return {
    id: String(row.id ?? crypto.randomUUID()),
    type: row?.type ?? undefined,
    location,
    timestamp: String(row?.timestamp ?? new Date().toISOString()),
    date_of_event: typeof row?.date_of_event === "string" ? row.date_of_event : row?.date_of_event ?? undefined,
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

async function fetchDispatchSubmissionFromDatabase(id: string): Promise<DispatchSubmission | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("dispatch_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapRowToSubmission(data);
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] supabase fetch error", e);
    return null;
  }
}

function mapRowToUpdate(row: any): DispatchUpdate {
  return {
    id: String(row.id),
    author: String(row.author ?? ""),
    text: String(row.text ?? ""),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  };
}

function mapRowToLogistics(row: any): LogisticsItem {
  return {
    id: String(row.id),
    category: row.category ?? "other",
    description: String(row.description ?? ""),
    quantity: row.quantity ?? undefined,
    priority: row.priority ?? "medium",
    status: row.status ?? "pending",
    responsibleParty: row.responsible_party ?? undefined,
    warehouse: row.warehouse ?? undefined,
    accountabilityNotes: row.accountability_notes ?? undefined,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  } as LogisticsItem;
}

async function fetchSubmissionUpdates(id: string): Promise<DispatchUpdate[]> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("dispatch_updates")
      .select("*")
      .eq("dispatch_id", id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapRowToUpdate);
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] supabase fetch updates error", e);
    return [];
  }
}

async function fetchSubmissionLogistics(id: string): Promise<LogisticsItem[]> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("dispatch_logistics")
      .select("*")
      .eq("dispatch_id", id)
      .order("updated_at", { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapRowToLogistics);
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] supabase fetch logistics error", e);
    return [];
  }
}

async function persistSubmissionPatchToDatabase(id: string, patch: Partial<DispatchSubmission>): Promise<void> {
  // Filter only top-level submission fields that live on dispatch_submissions
  const allowed: Record<string, any> = {};
  const keys: (keyof DispatchSubmission)[] = [
    "type",
    "location",
    "date_of_event",
    "required_roles",
    "encrypted_payload",
    "auto_delete_after",
    "integrity_hash",
    "submitted_by",
    "source",
    "visibility_radius_km",
    "status",
    "assigned_volunteers",
    "required_roles_by_type",
    "location_label",
    "point_of_contact",
    "state",
    "intended_action_preset",
    "intended_action_notes",
    "intended_actions",
    "intended_actions_custom",
    "signal_link",
    "public_signal_link",
    "training",
    "flagged",
  ];
  for (const k of keys) {
    if (k in patch) {
      (allowed as any)[k] = (patch as any)[k];
    }
  }
  if (Object.keys(allowed).length === 0) return;

  try {
    const client = getSupabaseBrowserClient();
    // Use update to avoid insert path requiring NOT NULL columns like timestamp
    const { error } = await client
      .from("dispatch_submissions")
      .update(allowed)
      .eq("id", id);
    if (error) throw error;
  } catch (e: any) {
    console.warn("[DispatchSubmissionDataLayer] supabase persist submission error", e);
  }
}

async function insertUpdateRow(dispatchId: string, update: DispatchUpdate): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const payload = {
      id: update.id,
      dispatch_id: dispatchId,
      author: update.author,
      text: update.text,
      attachments: update.attachments ?? [],
      created_at: update.createdAt,
    };
    const { error } = await client.from("dispatch_updates").insert(payload);
    if (error) throw error;
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] supabase insert update error", e);
  }
}

async function updateUpdateRow(updateId: string, text: string): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client
      .from("dispatch_updates")
      .update({ text })
      .eq("id", updateId);
    if (error) throw error;
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] supabase update update error", e);
  }
}

async function deleteUpdateRow(updateId: string): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const { error } = await client.from("dispatch_updates").delete().eq("id", updateId);
    if (error) throw error;
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] supabase delete update error", e);
  }
}

async function persistLogisticsDiff(
  dispatchId: string,
  prevItems: LogisticsItem[],
  nextItems: LogisticsItem[],
): Promise<void> {
  try {
    const client = getSupabaseBrowserClient();
    const prevMap = new Map(prevItems.map((i) => [i.id, i]));
    const nextMap = new Map(nextItems.map((i) => [i.id, i]));

    const toInsert: LogisticsItem[] = [];
    const toUpdate: LogisticsItem[] = [];
    const toDelete: string[] = [];

    // Added / updated
    for (const [id, item] of nextMap) {
      if (!prevMap.has(id)) {
        toInsert.push(item);
      } else {
        const prev = prevMap.get(id)!;
        // naive compare: if JSON differs, update
        if (JSON.stringify(prev) !== JSON.stringify(item)) {
          toUpdate.push(item);
        }
      }
    }

    // Removed
    for (const [id] of prevMap) {
      if (!nextMap.has(id)) toDelete.push(id);
    }

    if (toInsert.length) {
      const payload = toInsert.map((l) => ({
        id: l.id,
        dispatch_id: dispatchId,
        category: l.category,
        description: l.description,
        quantity: l.quantity,
        priority: l.priority,
        status: l.status,
        responsible_party: l.responsibleParty ?? null,
        warehouse: l.warehouse ?? null,
        accountability_notes: l.accountabilityNotes ?? null,
      }));
      const { error } = await client.from("dispatch_logistics").insert(payload);
      if (error) throw error;
    }

    for (const l of toUpdate) {
      const payload = {
        category: l.category,
        description: l.description,
        quantity: l.quantity,
        priority: l.priority,
        status: l.status,
        responsible_party: l.responsibleParty ?? null,
        warehouse: l.warehouse ?? null,
        accountability_notes: l.accountabilityNotes ?? null,
      };
      const { error } = await client
        .from("dispatch_logistics")
        .update(payload)
        .eq("id", l.id)
        .eq("dispatch_id", dispatchId);
      if (error) throw error;
    }

    if (toDelete.length) {
      const { error } = await client
        .from("dispatch_logistics")
        .delete()
        .in("id", toDelete)
        .eq("dispatch_id", dispatchId);
      if (error) throw error;
    }
  } catch (e) {
    console.warn("[DispatchSubmissionDataLayer] supabase persist logistics error", e);
  }
}

export default function DispatchSubmissionDataLayer({ id }: Props) {
  const storeSubmission = useDispatchStore((s) => s.submissions.find((sub) => sub.id === id));
  const updateSubmission = useDispatchStore((s) => s.updateSubmission);
  const addSubmission = useDispatchStore((s) => s.addSubmission);
  const fetchedRef = React.useRef<string | null>(null);
  const roster = usePodStore((s) => s.activeRoster);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // Prevent refetch loops when the local store updates
      if (fetchedRef.current === id) return;
      fetchedRef.current = id;
      if (!id) {
        return;
      }

      setLoading(true);
      try {
        const result = await fetchDispatchSubmissionFromDatabase(id);
        if (!cancelled && result) {
          // hydrate related updates + logistics
          const [updates, logistics] = await Promise.all([
            fetchSubmissionUpdates(id),
            fetchSubmissionLogistics(id),
          ]);
          const hydrated: DispatchSubmission = {
            ...result,
            updates,
            logistics,
          } as DispatchSubmission;
          // If the submission is not yet in the local store, add it; otherwise update it.
          if (!storeSubmission) {
            addSubmission(hydrated);
          } else {
            updateSubmission(hydrated.id, hydrated);
          }
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("DispatchSubmissionDataLayer: failed to fetch submission", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
      setLoading(false);
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [id, updateSubmission, addSubmission, storeSubmission]);

  const submission = storeSubmission;

  if (!submission) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Dispatch not found.</p>
      </div>
    );
  }

  // Handlers: persist to DB then update local store
  const handleUpdateSubmission = async (patch: Partial<DispatchSubmission>) => {
    // Persist core submission fields
    try {
      await persistSubmissionPatchToDatabase(submission.id, patch);
    } catch (e) {
      // already logged
    }

    // Persist logistics if present by diffing
    if (patch.logistics) {
      const prev = submission.logistics ?? [];
      const next = patch.logistics ?? [];
      try {
        await persistLogisticsDiff(submission.id, prev, next);
      } catch (e) {
        // already logged
      }
    }

    updateSubmission(submission.id, patch);
  };

  const handleAddUpdate = async (u: Omit<DispatchUpdate, "id" | "createdAt">) => {
    const newUpdate: DispatchUpdate = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      attachments: u.attachments ?? [],
      author: u.author,
      text: u.text,
    };
    try {
      await insertUpdateRow(submission.id, newUpdate);
    } catch (e) {
      // already logged
    }
    // Update local store by patching updates array
    const nextUpdates = [...(submission.updates ?? []), newUpdate];
    updateSubmission(submission.id, { updates: nextUpdates });
  };

  const handleEditUpdate = async (updateId: string, text: string) => {
    try {
      await updateUpdateRow(updateId, text);
    } catch (e) {
      // already logged
    }
    const nextUpdates = (submission.updates ?? []).map((u) =>
      u.id === updateId ? { ...u, text } : u,
    );
    updateSubmission(submission.id, { updates: nextUpdates });
  };

  const handleRemoveUpdate = async (updateId: string) => {
    try {
      await deleteUpdateRow(updateId);
    } catch (e) {
      // already logged
    }
    const nextUpdates = (submission.updates ?? []).filter((u) => u.id !== updateId);
    updateSubmission(submission.id, { updates: nextUpdates });
  };

  return (
    <DispatchSubmissionLayout
      submission={submission}
      loadingMessage={loading ? "Loading latest dispatch details..." : undefined}
      onUpdateSubmission={handleUpdateSubmission}
      onAddUpdate={handleAddUpdate}
      onEditUpdate={handleEditUpdate}
      onRemoveUpdate={handleRemoveUpdate}
      roster={roster}
      commsTabContent={<CommsDashboardDataLayer eventId={submission.id} />}
      commsTabLabel="Radio Comms"
    />
  );
}
