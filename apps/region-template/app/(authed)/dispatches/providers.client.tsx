"use client";

import type { PropsWithChildren } from "react";
import { DispatchStoreProvider } from "@/providers/DispatchStoreProvider";
import { PodStoreProvider } from "@/providers/PodStoreProvider";
import { usePodData } from "@/hooks/usePodData";

function DataHydrator() {
  usePodData();
  return null;
}

export default function DispatchesClientLayout({
  children,
}: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <DataHydrator />
      <DispatchStoreProvider>{children}</DispatchStoreProvider>
    </PodStoreProvider>
  );
}
