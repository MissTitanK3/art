"use client";

import * as React from "react";
import { DispatchStoreContext, useDispatchStore } from "@/providers/DispatchStoreProvider";
import { DispatchShiftsLayout } from "@workspace/ui/layout/dispatch/DispatchShiftsLayout";
import type { DispatchShift } from "@workspace/store/useDispatchStore";
import { usePodStore } from "@/providers/PodStoreProvider";

async function fetchDispatchShiftsFromDatabase(): Promise<DispatchShift[] | null> {
  // TODO: replace with actual persistence layer call when available.
  // Example:
  // const { data } = await client.from("dispatch_shifts").select("*");
  // return data?.map(transformRowToDispatchShift) ?? [];
  await Promise.resolve();
  return null;
}

export default function DispatchShiftsDataLayer() {
  const dispatchStore = React.useContext(DispatchStoreContext);
  if (!dispatchStore) {
    throw new Error("DispatchShiftsDataLayer must be used within DispatchStoreProvider");
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
  const [remoteShifts, setRemoteShifts] = React.useState<DispatchShift[] | null>(null);
  const [loading, setLoading] = React.useState(false);

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
          console.warn("DispatchShiftsDataLayer: failed to fetch shifts", error);
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
  const activeShifts = remoteShifts ? remoteShifts.filter((shift) => isShiftActive(shift)) : getActiveShifts();
  const upcomingShifts = remoteShifts
    ? remoteShifts
        .filter((shift) => new Date(shift.startsAt) > new Date())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    : getUpcomingShifts(24);

  const handleAddShift = React.useCallback(
    (input: Omit<DispatchShift, "id">) => {
      addShift(input);
      setRemoteShifts((prev) => {
        if (!prev) return prev;
        const latest = dispatchStore.getState().shifts;
        const added = latest.find((shift) => !prev.some((existing) => existing.id === shift.id));
        return added ? [...prev, added] : prev;
      });
    },
    [addShift, dispatchStore],
  );

  const handleUpdateShift = React.useCallback(
    (id: string, updates: Partial<DispatchShift>) => {
      updateShift(id, updates);
      setRemoteShifts((prev) => {
        if (!prev) return prev;
        const updated = dispatchStore.getState().shifts.find((shift) => shift.id === id);
        if (!updated) return prev;
        return prev.map((shift) => (shift.id === id ? updated : shift));
      });
    },
    [dispatchStore, updateShift],
  );

  const handleRemoveShift = React.useCallback(
    (shiftId: string) => {
      removeShift(shiftId);
      setRemoteShifts((prev) => (prev ? prev.filter((shift) => shift.id !== shiftId) : prev));
    },
    [removeShift],
  );

  return (
    <DispatchShiftsLayout
      shifts={mergedShifts}
      activeShifts={activeShifts}
      upcomingShifts={upcomingShifts}
      pods={pods}
      roster={roster}
      onRemoveShift={handleRemoveShift}
      onAddShift={handleAddShift}
      onUpdateShift={handleUpdateShift}
      isShiftActive={isShiftActive}
      addDrawerOpen={drawerOpen}
      onAddDrawerChange={setDrawerOpen}
      loadingMessage={loading ? "Loading shifts from database..." : undefined}
    />
  );
}
