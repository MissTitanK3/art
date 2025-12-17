"use client";

import type { PropsWithChildren } from "react";
import { PodStoreProvider } from "@/providers/PodStoreProvider";
import { DispatchStoreProvider } from "@/providers/DispatchStoreProvider";
import { usePodData } from "@/hooks/usePodData";

function DataHydrator() {
  usePodData();
  return null;
}

export default function SchedulesClientLayout({ children }: PropsWithChildren) {
  return (
    <DispatchStoreProvider>
      <PodStoreProvider>
        <DataHydrator />
        {children}
      </PodStoreProvider>
    </DispatchStoreProvider>
  );
}
