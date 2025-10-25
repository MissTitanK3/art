"use client";

import type { PropsWithChildren } from 'react';
import { PodStoreProvider } from '@/providers/PodStoreProvider';

export default function PodsClientLayout({ children }: PropsWithChildren) {
  return <PodStoreProvider>{children}</PodStoreProvider>;
}

