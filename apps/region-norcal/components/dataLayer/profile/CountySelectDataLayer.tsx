// apps/.../CountySelectDataLayer.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useProfileStore } from '@workspace/store/useProfileStore';
import { useRegionAdapters } from '@/providers/RegionProvider';
import { useAuth } from '@/hooks/useAuth';
import type { Profile } from '@workspace/store/types/global.ts';
import type { CountySelectMapProps } from '@workspace/ui/components/maps/CountySelectMap';
import { CountyProps, SelectedCounty } from '@workspace/store/types/maps.ts';
import { GEO_TO_FIPS } from '@workspace/store/utils/map';
import { CountySelectLayout } from '@workspace/ui/layout/profile/CountySelectLayout';

const CountySelectMap = dynamic<CountySelectMapProps>(
  () => import('@workspace/ui/components/maps/CountySelectMap'),
  { ssr: false, loading: () => <div className="h-96 w-full" /> }
);

async function fetchOperatingCountiesByUser(
  userId: string,
  profileAdapter: { loadProfile: (userId: string) => Promise<Profile | null> }
): Promise<string[] | null> {
  const p = await profileAdapter.loadProfile(userId);
  return p?.operating_counties ?? null;
}

async function saveOperatingCounties(
  current: Profile,
  fipsList: string[],
  profileAdapter: { saveProfile: (profile: Profile) => Promise<void> }
): Promise<void> {
  const next: Profile = { ...current, operating_counties: fipsList };
  await profileAdapter.saveProfile(next);
}

export function CountySelectDataLayer() {
  const router = useRouter();
  const profile = useProfileStore(s => s.profile);
  const setOperating = useProfileStore(s => s.setOperatingCounties);
  const { session } = useAuth();
  const { profileAdapter } = useRegionAdapters();

  const [selectedCounties, setSelectedCounties] = React.useState<SelectedCounty[]>([]);
  const [activeCounty, setActiveCounty] = React.useState<SelectedCounty | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);


  // --- NEW: protect against hydration clobbering user clicks
  const didHydrateRef = React.useRef(false);

  // hydrate from store (unchanged logic, but guarded + merged)
  const operatingSignature = (profile?.operating_counties ?? []).join('|');
  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch('/us-counties.json', { cache: 'force-cache' });
        const data = await res.json() as {
          type: 'FeatureCollection';
          features: Array<{ properties: CountyProps }>;
        };

        const byFips = new Map<string, SelectedCounty>();
        for (const f of data.features) {
          const p = f.properties;
          const fips = `${p.STATE}${p.COUNTY}`.padStart(5, '0');
          byFips.set(fips, { GEO_ID: p.GEO_ID, NAME: p.NAME, STATE: p.STATE, ZONE: [] });
        }
        if (!alive) return;

        const userId = session?.user?.id ?? profile?.user_id;
        const remoteFips = userId ? await fetchOperatingCountiesByUser(userId, profileAdapter) : null;
        const sourceFips = remoteFips ?? profile?.operating_counties ?? [];

        if (remoteFips) {
          setOperating(sourceFips);
        }

        // Only apply once, and never overwrite if user already interacted
        if (!didHydrateRef.current) {
          setSelectedCounties(prev => {
            const seen = new Set(prev.map(c => c.GEO_ID));
            const merged = [...prev];
            for (const fips of sourceFips) {
              const c = byFips.get(fips);
              if (c && !seen.has(c.GEO_ID)) merged.push(c);
            }
            return merged;
          });
          didHydrateRef.current = true;
        }

      } catch {
        if (!alive) return;
        // don't clobber existing selection on error either
        if (!didHydrateRef.current) {
          didHydrateRef.current = true;
        }
      }
    })();

    return () => { alive = false; };
  }, [session?.user?.id, profile?.user_id, profile?.operating_counties, operatingSignature, profileAdapter, setOperating]);

  // --- helper: reconcile prev selection with possibly-delta "next"
  const reconcileSelection = React.useCallback(
    (prev: SelectedCounty[], next: SelectedCounty[]) => {
      if (next.length === 0) {
        // explicit clear from the map
        return [];
      }

      if (next.length === 1) {
        // always treat single as a toggle delta
        const item = next[0];
        if (!item) return prev;
        const idx = prev.findIndex((c) => c.GEO_ID === item.GEO_ID);
        return idx >= 0 ? prev.filter((c) => c.GEO_ID !== item.GEO_ID) : [...prev, item];
      }

      // length >= 2 => authoritative list from the map
      // (de-dupe defensively)
      const seen = new Set<string>();
      const authoritative = next.filter((c) => {
        if (seen.has(c.GEO_ID)) return false;
        seen.add(c.GEO_ID);
        return true;
      });
      return authoritative;
    },
    []
  );


  // map -> parent (controlled, but resilient to delta emissions)
  const handleMapChange = React.useCallback((next: SelectedCounty[]) => {
    setSelectedCounties((prev) => {
      const merged = reconcileSelection(prev, next);
      setActiveCounty((prevActive) =>
        prevActive && !merged.some((c) => c.GEO_ID === prevActive.GEO_ID) ? null : prevActive
      );
      return merged;
    });
  }, [reconcileSelection]);

  // list actions
  const toggleEditCounty = React.useCallback((county: SelectedCounty) => {
    setActiveCounty(prev => (prev?.GEO_ID === county.GEO_ID ? null : county));
  }, []);

  const handleUpdateZones = React.useCallback((geoId: string, zones: number[]) => {
    setSelectedCounties(prev =>
      prev.map(c => (c.GEO_ID === geoId ? { ...c, ZONE: zones } : c))
    );
  }, []);

  const handleRemoveCounty = React.useCallback((geoId: string) => {
    setSelectedCounties(prev => prev.filter(c => c.GEO_ID !== geoId));
    setActiveCounty(prev => (prev?.GEO_ID === geoId ? null : prev));
  }, []);

  const handleDone = React.useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();

    const fipsList = selectedCounties
      .map(c => GEO_TO_FIPS(c.GEO_ID))
      .filter((v): v is string => !!v)
      .sort();

    setIsSaving(true);
    (async () => {
      try {
        setOperating(fipsList);
        if (profile) {
          await saveOperatingCounties(profile, fipsList, profileAdapter);
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
        router.push('/my-profile');
      } finally {
        setIsSaving(false);
      }
    })();
  }, [profile, profileAdapter, router, selectedCounties, setOperating]);




  if (!profile) {
    return (
      <CountySelectLayout
        profileMissing
        selectedCounties={[]}
        activeCounty={null}
        onMapChange={() => { }}
        onToggleEditCounty={() => { }}
        onRemoveCounty={() => { }}
        onUpdateZones={() => { }}
        onDone={() => { }}
        isSaving={false}
        MapComponent={CountySelectMap}
        noProfileContent={
          <>
            <h2 className="mb-1 text-lg font-semibold">No profile found</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your profile first, then pick counties.
            </p>
            <Link href="/my-profile" className="underline">
              Back to profile
            </Link>
          </>
        }
      />
    );
  }

  return (
    <CountySelectLayout
      profileMissing={false}
      selectedCounties={selectedCounties}
      activeCounty={activeCounty}
      onMapChange={handleMapChange}
      onToggleEditCounty={toggleEditCounty}
      onRemoveCounty={handleRemoveCounty}
      onUpdateZones={handleUpdateZones}
      onDone={handleDone}
      isSaving={isSaving}
      MapComponent={CountySelectMap}
      loadingMessage={!didHydrateRef.current ? "Loading counties..." : undefined}
    />
  );
}
