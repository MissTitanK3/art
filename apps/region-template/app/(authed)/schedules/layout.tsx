'use client';

import type { PropsWithChildren } from 'react';
import { PodStoreProvider } from '@/providers/PodStoreProvider';
import { DispatchStoreProvider } from '@/providers/DispatchStoreProvider';

export default function SchedulesLayout({ children }: PropsWithChildren) {
  return (
    <DispatchStoreProvider>
      <PodStoreProvider>{children}</PodStoreProvider>
    </DispatchStoreProvider>
  );
}
