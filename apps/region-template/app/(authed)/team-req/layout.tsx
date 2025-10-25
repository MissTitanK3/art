import type { ReactNode } from 'react';
import { requireElevatedAccess } from '@/lib/guards';
import TeamReqClientLayout from './providers.client';

export default async function TeamRequestLayout({ children }: { children: ReactNode }) {
  await requireElevatedAccess();
  return <TeamReqClientLayout>{children}</TeamReqClientLayout>;
}
