"use client";

import type { PropsWithChildren } from 'react';
import { PodStoreProvider } from '@/providers/PodStoreProvider';
import PodDataHydrator from '@/components/dataLayer/pods/PodDataHydrator';
import ActiveRosterHydrator from '@/components/dataLayer/pods/ActiveRosterHydrator';

export default function PodsClientLayout({ children }: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <PodDataHydrator />
      <ActiveRosterHydrator />
      {children}
    </PodStoreProvider>
  );
}
