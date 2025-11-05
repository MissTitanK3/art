'use client';

import * as React from 'react';
import { toast } from 'sonner';
import type { CrewCatalog } from '@/schemas/crew';

export function useCrewMarket(filters: { position?: string | null }) {
  const { position } = filters;
  const [marketCrew, setMarketCrew] = React.useState<CrewCatalog[]>([]);
  const [marketLoading, setMarketLoading] = React.useState(false);

  const loadMarket = React.useCallback(async () => {
    setMarketLoading(true);
    try {
      const u = new URL(window.location.href);
      u.pathname = '/api/crew/market';
      if (position) u.searchParams.set('position', position);
      const res = await fetch(u.toString(), { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load crew market');
      setMarketCrew(Array.isArray(json.crew) ? json.crew : []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load crew market');
      setMarketCrew([]);
    } finally {
      setMarketLoading(false);
    }
  }, [position]);

  React.useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  return { marketCrew, marketLoading, reloadMarket: loadMarket };
}
