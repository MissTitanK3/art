import type { ReactNode } from 'react';
import { requireVerifiedProfileActive } from '@/lib/guards';

export default async function WarehousingLayout({ children }: { children: ReactNode }) {
  await requireVerifiedProfileActive();
  return <>{children}</>;
}

