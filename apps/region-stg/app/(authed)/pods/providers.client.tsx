"use client";

import type { PropsWithChildren } from "react";
import { PodStoreProvider } from "@/providers/PodStoreProvider";
import { usePodData } from "@/hooks/usePodData";

function DataHydrator() {
  usePodData();
  return null;
}

export default function PodsClientLayout({ children }: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <DataHydrator />
      {children}
    </PodStoreProvider>
  );
}
