import type { ReactNode } from 'react';
import { requireOnboardedAccess } from '@/lib/guards';
import MeetANeedClientLayout from './providers.client';

export default async function MeetANeedLayout({ children }: { children: ReactNode }) {
  await requireOnboardedAccess();
  return <MeetANeedClientLayout>{children}</MeetANeedClientLayout>;
}

