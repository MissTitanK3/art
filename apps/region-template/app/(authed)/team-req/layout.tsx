'use client';

import type { PropsWithChildren } from 'react';
import { DispatchStoreProvider } from '@/providers/DispatchStoreProvider';

export default function TeamRequestLayout({ children }: PropsWithChildren) {
  return <DispatchStoreProvider>{children}</DispatchStoreProvider>;
}
