"use client";

import type { PropsWithChildren } from 'react';
import { PodStoreProvider } from '@/providers/PodStoreProvider';
import { DispatchStoreProvider } from '@/providers/DispatchStoreProvider';
import PodDataHydrator from '@/components/dataLayer/pods/PodDataHydrator';

export default function SchedulesClientLayout({ children }: PropsWithChildren) {
  return (
    <DispatchStoreProvider>
      <PodStoreProvider>
        <PodDataHydrator />
        {children}
      </PodStoreProvider>
    </DispatchStoreProvider>
  );
}
