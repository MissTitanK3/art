'use client';

import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSignalsStore } from '@/store/useSignalsStore';
import { useShipStore } from '@/store/useShipStore';
import { useSeasonStore } from '@/store/useSeasonStore';
import { useProfileStore } from '@/store/useProfileStore';
import { mapRegionToSector } from '@/lib/regions';

export function usePingSignals() {
  const { setSignals, setLocation, setLoading, setError } = useSignalsStore();
  const markPing = useShipStore((s) => s.markPing);
  const regionIdFromStore = useProfileStore((s) => s.region_id);
  const sectorFromStore = useProfileStore((s) => s.sector_code || s.profile?.sector_code || null);
  const seasonReward = useSeasonStore((s) => s.reward_schema);

  const onPing = useCallback(
    async (getPosition: () => Promise<{ lat: number; lng: number }>) => {
      setError(undefined);
      setLoading(true);
      try {
        const { lat, lng } = await getPosition();
        setLocation({ lat, lng });

        const regionId = regionIdFromStore || process.env.NEXT_PUBLIC_REGION_ID || 'region-pnw';
        const sectorCode = sectorFromStore || mapRegionToSector(regionId);

        let query = supabase.from('art_signals').select('*').gte('expires_at', new Date().toISOString());

        const ors: string[] = [];
        const rs: any = seasonReward || {};
        const sf: any = rs.signal_filters || rs.signals || {};
        const regionOverride = typeof sf.region_id === 'string' ? sf.region_id : null;
        const sectorOverride = typeof sf.sector_code === 'string' ? sf.sector_code : null;
        const tagsAny: string[] | undefined = Array.isArray(sf.tags_any) ? sf.tags_any : undefined;

        const regionToUse = regionOverride || regionId;
        const sectorToUse = sectorOverride || sectorCode;
        if (regionToUse) ors.push(`region_id.eq.${regionToUse}`);
        if (sectorToUse) ors.push(`sector_code.eq.${sectorToUse}`);
        if (ors.length > 0) query = query.or(ors.join(','));

        if (tagsAny && tagsAny.length > 0) {
          // @ts-ignore overlaps works for Postgres arrays
          query = (query as any).overlaps('tags', tagsAny);
        }

        const { data, error } = await query;
        if (error) throw error;
        setSignals((data ?? []) as any);
        markPing();
      } catch (err: any) {
        setError(err?.message || 'Failed to ping');
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setLocation, setSignals, regionIdFromStore, sectorFromStore, markPing, seasonReward],
  );

  return { onPing };
}
