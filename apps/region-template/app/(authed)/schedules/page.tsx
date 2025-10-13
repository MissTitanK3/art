"use client";

import DispatchShiftDataLayer from "@/components/dataLayer/dispatches/DisptachShiftsDataLayer";
import { PodStoreProvider } from "@/providers/PodStoreProvider";

export default function SchedulesPage() {
  return (
    <PodStoreProvider>
      <div suppressHydrationWarning>
        <DispatchShiftDataLayer />
      </div>
    </PodStoreProvider>
  );
}
