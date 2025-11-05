"use client";

import type { PropsWithChildren } from 'react';
import { DispatchStoreProvider } from '@/providers/DispatchStoreProvider';
import { PodStoreProvider } from '@/providers/PodStoreProvider';
import PodDataHydrator from '@/components/dataLayer/pods/PodDataHydrator';

export default function DispatchesClientLayout({ children }: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <PodDataHydrator />
      <DispatchStoreProvider>{children}</DispatchStoreProvider>
    </PodStoreProvider>
  );
}
