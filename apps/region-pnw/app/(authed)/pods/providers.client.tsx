"use client";

import type { PropsWithChildren } from 'react';
import { PodStoreProvider } from '@/providers/PodStoreProvider';
import PodDataHydrator from '@/components/dataLayer/pods/PodDataHydrator';

export default function PodsClientLayout({ children }: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <PodDataHydrator />
      {children}
    </PodStoreProvider>
  );
}
