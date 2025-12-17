"use client";

import type { PropsWithChildren } from "react";
import { PodStoreProvider } from "@/providers/PodStoreProvider";
import { usePodData } from "@/hooks/usePodData";
import { useActiveRoster } from "@/hooks/useActiveRoster";

function DataHydrator() {
  usePodData();
  useActiveRoster();
  return null;
}

export default function AcademyLayout({ children }: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <DataHydrator />
      {children}
    </PodStoreProvider>
  );
}
