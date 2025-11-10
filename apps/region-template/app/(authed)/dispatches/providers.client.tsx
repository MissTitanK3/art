"use client";

import type { PropsWithChildren } from "react";
import { DispatchStoreProvider } from "@/providers/DispatchStoreProvider";
import { PodStoreProvider } from "@/providers/PodStoreProvider";
import PodDataHydrator from "@/components/dataLayer/pods/PodDataHydrator";
import DispatchHomeHydrator from "@/components/dataLayer/dispatches/DispatchHomeHydrator";

export default function DispatchesClientLayout({
  children,
}: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <PodDataHydrator />
      <DispatchStoreProvider>
        <DispatchHomeHydrator />
        {children}
      </DispatchStoreProvider>
    </PodStoreProvider>
  );
}
