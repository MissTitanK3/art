import type { ReactNode } from 'react';
import { requireOnboardedAccess } from '@/lib/guards';

export default async function WatchLayout({ children }: { children: ReactNode }) {
  await requireOnboardedAccess();
  return <>{children}</>;
}

