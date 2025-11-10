"use client";

import * as React from "react";
import {
  DispatchStoreContext,
  useDispatchStore,
} from "@/providers/DispatchStoreProvider";
import { DispatchShiftsLayout } from "@workspace/ui/layout/dispatch/DispatchShiftsLayout";
import type { DispatchShift } from "@workspace/store/useDispatchStore";
import { usePodStore } from "@/providers/PodStoreProvider";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import type { Pod, RosterEntry } from "@workspace/store/types/pod.ts";

function mapRowToDispatchShift(row: any): DispatchShift {
  return {
    id: String(row.id ?? crypto.randomUUID()),
    podId: typeof row?.pod_id === "string" ? row.pod_id : row?.podId,
    volunteerId:
      typeof row?.volunteer_id === "string"
        ? row.volunteer_id
        : row?.volunteerId,
    // Prefer joined profile display_name for rendering in UI
    volunteerName:
      typeof row?.profile?.display_name === "string"
        ? row.profile.display_name
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

async function fetchDispatchShiftsFromDatabase(): Promise<
  DispatchShift[] | null
> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("dispatch_shifts")
      .select(
        "id, pod_id, volunteer_id, starts_at, ends_at, notes, profile:profiles(display_name)",
      )
      .order("starts_at", { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows.map(mapRowToDispatchShift);
  } catch (e) {
    console.warn("[DispatchShiftsDataLayer] supabase fetch error", e);
    return null;
  }
}

async function upsertDispatchShiftToDatabase(
  shift: DispatchShift,
  pods: Pod[],
  roster: RosterEntry[],
): Promise<void> {
  const client = getSupabaseBrowserClient();
  // volunteerId from UI is a roster entry id; map to roster_entries.profile_id (or profile.id) if possible
  let volunteer_profile_id: string | null = null;
  if (shift.volunteerId) {
    const pod = pods.find((p: any) => p.id === shift.podId);
    const fromPod = pod?.team?.find((m: any) => m.id === shift.volunteerId);
    const fromRoster = roster?.find?.((m: any) => m.id === shift.volunteerId);
    // If shift.volunteerId is a roster entry id, map to profile.id; otherwise use it if it's a UUID (profile id), else null
    const uuidRe =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    const byProfileId = roster.find(
      (m: any) => m.profile?.id === shift.volunteerId,
    )?.profile?.id;
    const fromRosterProfileFk = fromRoster?.profile_id as string | undefined;
    const fromPodProfileFk = (fromPod as any)?.profile_id as string | undefined;
    volunteer_profile_id =
      // Prefer direct FK values when provided
      fromPodProfileFk ??
      fromRosterProfileFk ??
      // Then fall back to joined profile objects
      fromPod?.profile?.id ??
      fromRoster?.profile?.id ??
      byProfileId ??
      (uuidRe.test(String(shift.volunteerId))
        ? String(shift.volunteerId)
        : null);

    // As a final fallback, fetch the roster entry to resolve its profile_id directly
    if (!volunteer_profile_id) {
      try {
        const client2 = getSupabaseBrowserClient();
        const { data: r, error: rErr } = await client2
          .from("roster_entries")
          .select("profile_id")
          .eq("id", shift.volunteerId)
          .maybeSingle();
        if (!rErr && r?.profile_id && typeof r.profile_id === "string") {
          volunteer_profile_id = r.profile_id;
        }
      } catch {
        // ignore best-effort fallback
      }
    }
  }

  const payload = {
    id: shift.id,
    pod_id: shift.podId ?? null,
    volunteer_id: volunteer_profile_id,
    starts_at: shift.startsAt,
    ends_at: shift.endsAt,
    notes: shift.notes ?? null,
  };
  const { error } = await client.from("dispatch_shifts").upsert(payload);
  if (error) throw error;
}

async function deleteDispatchShiftFromDatabase(id: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { error } = await client.from("dispatch_shifts").delete().eq("id", id);
  if (error) throw error;
}

export default function DispatchShiftsDataLayer() {
  const dispatchStore = React.useContext(DispatchStoreContext);
  if (!dispatchStore) {
    throw new Error(
      "DispatchShiftsDataLayer must be used within DispatchStoreProvider",
    );
  }

  const shifts = useDispatchStore((s) => s.shifts);
  const getActiveShifts = useDispatchStore((s) => s.getActiveShifts);
  const getUpcomingShifts = useDispatchStore((s) => s.getUpcomingShifts);
  const pods = usePodStore((state) => state.pods);
  const roster = usePodStore((state) => state.activeRoster);
  const addShift = useDispatchStore((s) => s.addShift);
  const updateShift = useDispatchStore((s) => s.updateShift);
  const removeShift = useDispatchStore((s) => s.removeShift);
  const isShiftActive = useDispatchStore((s) => s.isShiftActive);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [remoteShifts, setRemoteShifts] = React.useState<
    DispatchShift[] | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatches by rendering a stable placeholder until mounted
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoading(true);
      try {
        const result = await fetchDispatchShiftsFromDatabase();
        if (!cancelled && result) {
          setRemoteShifts(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "DispatchShiftsDataLayer: failed to fetch shifts",
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
  }, []);

  const mergedShifts = remoteShifts ?? shifts;
  const activeShifts = remoteShifts
    ? remoteShifts.filter((shift) => isShiftActive(shift))
    : getActiveShifts();
  const upcomingShifts = remoteShifts
    ? remoteShifts
        .filter((shift) => new Date(shift.startsAt) > new Date())
        .sort(
          (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        )
    : getUpcomingShifts(24);
  // Use stable placeholder data until mounted to avoid hydration mismatches
  const effShifts = mounted ? mergedShifts : [];
  const effActiveShifts = mounted ? activeShifts : [];
  const effUpcomingShifts = mounted ? upcomingShifts : [];
  const effPods = mounted ? pods : [];
  const effRoster = mounted ? roster : [];
  const effDrawerOpen = mounted ? drawerOpen : false;

  const handleAddShift = React.useCallback(
    (input: Omit<DispatchShift, "id">) => {
      // Add to local store to obtain the generated id
      addShift(input);
      const latest = dispatchStore.getState().shifts;
      const added = latest[latest.length - 1];
      if (added) {
        // Persist to DB (best-effort)
        upsertDispatchShiftToDatabase(added, pods, roster).catch((e) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Persist add shift failed", e);
          }
        });
        // Reflect in remote state if we already hydrated from DB
        setRemoteShifts((prev) => (prev ? [...prev, added] : prev));
      }
    },
    [addShift, dispatchStore, pods, roster],
  );

  const handleUpdateShift = React.useCallback(
    (id: string, updates: Partial<DispatchShift>) => {
      updateShift(id, updates);
      const updated = dispatchStore
        .getState()
        .shifts.find((shift) => shift.id === id);
      if (updated) {
        upsertDispatchShiftToDatabase(updated, pods, roster).catch((e) => {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Persist update shift failed", e);
          }
        });
      }
      setRemoteShifts((prev) =>
        prev && updated ? prev.map((s) => (s.id === id ? updated : s)) : prev,
      );
    },
    [dispatchStore, updateShift, pods, roster],
  );

  const handleRemoveShift = React.useCallback(
    (shiftId: string) => {
      // Remove from DB then local (best-effort)
      deleteDispatchShiftFromDatabase(shiftId).catch((e) => {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Persist delete shift failed", e);
        }
      });
      removeShift(shiftId);
      setRemoteShifts((prev) =>
        prev ? prev.filter((shift) => shift.id !== shiftId) : prev,
      );
    },
    [removeShift],
  );

  return (
    <DispatchShiftsLayout
      shifts={effShifts}
      activeShifts={effActiveShifts}
      upcomingShifts={effUpcomingShifts}
      pods={effPods}
      roster={effRoster}
      onRemoveShift={handleRemoveShift}
      onAddShift={handleAddShift}
      onUpdateShift={handleUpdateShift}
      isShiftActive={isShiftActive}
      addDrawerOpen={effDrawerOpen}
      onAddDrawerChange={setDrawerOpen}
      loadingMessage={
        !mounted || loading ? "Loading shifts from database..." : undefined
      }
      getVolunteersForPod={async (podId) => {
        try {
          const client = getSupabaseBrowserClient();
          const { data, error } = await client
            .from("roster_entries")
            .select(
              "id, profile_id, role, status, handle, joined_at, last_shift_at, signal_handle, profile:profiles(*)",
            )
            .eq("pod_id", podId)
            .order("joined_at", { ascending: true });
          if (error) throw error;
          const rows = Array.isArray(data) ? data : [];
          // Map to RosterEntry shape used by UI
          return rows.map((row: any) => ({
            id: String(row.id),
            profile_id:
              typeof row.profile_id === "string"
                ? row.profile_id
                : row.profile?.id,
            profile: row.profile,
            role: row.role,
            status: row.status,
            langs: Array.isArray(row.langs) ? row.langs : [],
            skills: Array.isArray(row.skills) ? row.skills : [],
            certs: Array.isArray(row.certs) ? row.certs : [],
            notes: row.notes ?? undefined,
            handle: row.handle ?? row.profile?.display_name ?? "",
            joinedAt: String(row.joined_at ?? new Date().toISOString()),
            lastShiftAt: row.last_shift_at ?? undefined,
            signal_handle: row.signal_handle ?? undefined,
          }));
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("getVolunteersForPod failed", e);
          }
          return [];
        }
      }}
    />
  );
}
