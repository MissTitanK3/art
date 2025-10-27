"use client";

import type { PropsWithChildren } from 'react';
import { PodStoreProvider } from '@/providers/PodStoreProvider';
import { DispatchStoreProvider } from '@/providers/DispatchStoreProvider';
import PodDataHydrator from '@/components/dataLayer/pods/PodDataHydrator';
import ActiveRosterHydrator from '@/components/dataLayer/pods/ActiveRosterHydrator';
import { getAuthProviderId } from '@/lib/auth/adapter';
import DispatchHomeHydrator from '@/components/dataLayer/dispatches/DispatchHomeHydrator';

export default function AdminClientLayout({ children }: PropsWithChildren) {
  const provider = getAuthProviderId();
  const isSupabase = provider === 'supabase';
  return (
    <PodStoreProvider>
      {isSupabase ? (
        <>
          <PodDataHydrator />
          <ActiveRosterHydrator />
          <DispatchHomeHydrator />
        </>
      ) : null}
      <DispatchStoreProvider>{children}</DispatchStoreProvider>
    </PodStoreProvider>
  );
}
