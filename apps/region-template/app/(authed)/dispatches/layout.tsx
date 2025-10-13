'use client';

import type { PropsWithChildren } from 'react';
import { DispatchStoreProvider } from '@/providers/DispatchStoreProvider';
import { PodStoreProvider } from '@/providers/PodStoreProvider';

export default function DispatchesLayout({ children }: PropsWithChildren) {
  return (
    <PodStoreProvider>
      <DispatchStoreProvider>{children}</DispatchStoreProvider>
    </PodStoreProvider>
  );
}
