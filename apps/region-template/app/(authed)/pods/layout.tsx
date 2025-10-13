'use client';

import type { PropsWithChildren } from 'react';
import { PodStoreProvider } from '@/providers/PodStoreProvider';

export default function PodsLayout({ children }: PropsWithChildren) {
  return <PodStoreProvider>{children}</PodStoreProvider>;
}
