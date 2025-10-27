import type { ReactNode } from 'react';
import { requireDispatchAccess } from '@/lib/guards';
import TeamReqClientLayout from './providers.client';

export default async function TeamRequestLayout({ children }: { children: ReactNode }) {
  await requireDispatchAccess();
  return <TeamReqClientLayout>{children}</TeamReqClientLayout>;
}
