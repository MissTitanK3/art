"use client";

import * as React from "react";
import { useDispatchRosterStore } from "@workspace/store/dispatchRosterStore";
import { DispatchShiftsLayout } from "@workspace/ui/layout/dispatch/DispatchShiftsLayout";
import type { DispatchShift } from "@workspace/store/dispatchRosterStore";

async function fetchDispatchShiftsFromDatabase(): Promise<DispatchShift[] | null> {
  // TODO: replace with actual persistence layer call when available.
  // Example:
  // const { data } = await client.from("dispatch_shifts").select("*");
  // return data?.map(transformRowToDispatchShift) ?? [];
  await Promise.resolve();
  return null;
}

export default function DispatchShiftsDataLayer() {
  const shifts = useDispatchRosterStore((s) => s.shifts);
  const getActiveShifts = useDispatchRosterStore((s) => s.getActiveShifts);
  const getUpcomingShifts = useDispatchRosterStore((s) => s.getUpcomingShifts);
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

  const { isShiftActive } = useDispatchRosterStore.getState();
  const mergedShifts = remoteShifts ?? shifts;
  const activeShifts = remoteShifts ? remoteShifts.filter((shift) => isShiftActive(shift)) : getActiveShifts();
  const upcomingShifts = remoteShifts
    ? remoteShifts
        .filter((shift) => new Date(shift.startsAt) > new Date())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    : getUpcomingShifts(24);

  return (
    <DispatchShiftsLayout
      shifts={mergedShifts}
      activeShifts={activeShifts}
      upcomingShifts={upcomingShifts}
      addDrawerOpen={drawerOpen}
      onAddDrawerChange={setDrawerOpen}
      loadingMessage={loading ? "Loading shifts from database..." : undefined}
    />
  );
}
