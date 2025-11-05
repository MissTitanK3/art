'use client';

import * as React from 'react';
import { toast } from 'sonner';
import type { ShipCatalog } from '@/schemas/ships';
import { fetchCurrentShipCached, invalidateCurrentShipCache } from '@/lib/shipsApi';

export function useShipCatalog(profileId: string | null) {
  const [catalog, setCatalog] = React.useState<(ShipCatalog & { eligible?: boolean })[]>([]);
  const [catalogLoading, setCatalogLoading] = React.useState(false);
  const [currentShip, setCurrentShip] = React.useState<any | null>(null);

  // catalog
  React.useEffect(() => {
    const load = async () => {
      setCatalogLoading(true);
      try {
        const base = new URL(window.location.href);
        base.pathname = '/api/ships/catalog';
        if (profileId) base.searchParams.set('profile_id', profileId);
        const res = await fetch(base.toString(), { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load ships');
        setCatalog(Array.isArray(json.ships) ? json.ships : []);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load ships');
      } finally {
        setCatalogLoading(false);
      }
    };
    load();
  }, [profileId]);

  // current ship
  React.useEffect(() => {
    const load = async () => {
      if (!profileId) {
        setCurrentShip(null);
        return;
      }
      try {
        const json = await fetchCurrentShipCached(profileId, 60_000);
        setCurrentShip(json?.current || null);
      } catch {}
    };
    load();
  }, [profileId]);

  const selectShip = React.useCallback(
    async (shipId: string) => {
      if (!profileId) return;
      try {
        const res = await fetch('/api/ships/current', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, ship_id: shipId, seed_components: true }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to set ship');
        setCurrentShip(json.current || null);
        invalidateCurrentShipCache(profileId);
        return json;
      } catch (e: any) {
        toast.error(e?.message || 'Failed to set ship');
      }
    },
    [profileId],
  );

  const abandonShip = React.useCallback(async () => {
    if (!profileId) return;
    try {
      const res = await fetch('/api/ships/abandon', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to abandon ship');
      setCurrentShip(null);
      invalidateCurrentShipCache(profileId);
      toast.success('Ship abandoned. Crew trust +1 and morale buff applied.');
      return json;
    } catch (e: any) {
      toast.error(e?.message || 'Failed to abandon ship');
    }
  }, [profileId]);

  return { catalog, catalogLoading, currentShip, setCurrentShip, selectShip, abandonShip };
}
