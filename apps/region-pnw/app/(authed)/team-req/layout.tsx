import type { ReactNode } from 'react';
import { requireDispatchBasicAccess } from '@/lib/guards';
import TeamReqClientLayout from './providers.client';

export default async function TeamRequestLayout({ children }: { children: ReactNode }) {
  // Allow dispatcher_basic and above to access team requests
  await requireDispatchBasicAccess();
  return <TeamReqClientLayout>{children}</TeamReqClientLayout>;
}
