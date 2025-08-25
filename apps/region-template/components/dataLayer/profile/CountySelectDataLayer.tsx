// apps/.../CountySelectDataLayer.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@workspace/ui/components/button';
import { useProfileStore } from '@workspace/store/profileStore';
import type { CountySelectMapProps } from '@workspace/ui/components/maps/CountySelectMap';
import { CountyProps } from '@workspace/store/types/maps.ts';
import { GEO_TO_FIPS } from '@workspace/store/utils/map';

export interface SelectedCounty {
  GEO_ID: string;
  NAME: string;
  STATE: string;   // 2-digit FIPS
  ZONE: number[];  // selected grid cells
}

const CountySelectMap = dynamic<CountySelectMapProps>(
  () => import('@workspace/ui/components/maps/CountySelectMap'),
  { ssr: false, loading: () => <div className="h-96 w-full" /> }
);

export function CountySelectDataLayer() {
  const router = useRouter();
  const profile = useProfileStore(s => s.profile);
  const setOperating = useProfileStore(s => s.setOperatingCounties);

  const [selectedCounties, setSelectedCounties] = React.useState<SelectedCounty[]>([]);
  const [activeCounty, setActiveCounty] = React.useState<SelectedCounty | null>(null);
  const [isSaving, startSaving] = React.useTransition();


  // --- NEW: protect against hydration clobbering user clicks
  const didHydrateRef = React.useRef(false);
  const didUserInteractRef = React.useRef(false);

  // hydrate from store (unchanged logic, but guarded + merged)
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

        const hydrated: SelectedCounty[] = [];
        for (const fips of (profile?.operating_counties ?? [])) {
          const c = byFips.get(fips);
          if (c) hydrated.push(c);
        }

        // Only apply once, and never overwrite if user already interacted
        if (!didHydrateRef.current) {
          setSelectedCounties(prev => {
            const seen = new Set(prev.map(c => c.GEO_ID));
            const merged = [...prev];
            for (const fips of profile?.operating_counties ?? []) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.operating_counties?.join('|')]);

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
    didUserInteractRef.current = true;
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
    didUserInteractRef.current = true;
    setActiveCounty(prev => (prev?.GEO_ID === county.GEO_ID ? null : county));
  }, []);

  const handleUpdateZones = React.useCallback((geoId: string, zones: number[]) => {
    didUserInteractRef.current = true;
    setSelectedCounties(prev =>
      prev.map(c => (c.GEO_ID === geoId ? { ...c, ZONE: zones } : c))
    );
  }, []);

  const handleRemoveCounty = React.useCallback((geoId: string) => {
    didUserInteractRef.current = true;
    setSelectedCounties(prev => prev.filter(c => c.GEO_ID !== geoId));
    setActiveCounty(prev => (prev?.GEO_ID === geoId ? null : prev));
  }, []);

  const countyList = React.useMemo(
    () =>
      selectedCounties.map((county, i) => (
        <div
          key={county.GEO_ID}
          className="border rounded p-3 text-sm space-y-2 mb-10"
        >
          {/* Header row */}
          <div className="flex flex-col md:flex-row items-center justify-evenly md:justify-between h-full w-full">
            <div className="font-medium">
              <span className="font-mono text-xs text-muted-foreground">#{i + 1}</span>{" "}
              {county.NAME} County
            </div>
            {/* Coverage details */}
            {Array.isArray(county.ZONE) && county.ZONE.length > 0 && (
              <div className="text-xs text-blue-600">
                Partial coverage: {county.ZONE.length} zone{county.ZONE.length > 1 ? "s" : ""}
              </div>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Button onClick={() => toggleEditCounty(county)}>
                {activeCounty?.GEO_ID === county.GEO_ID ? "Done Editing" : "Edit Zones"}
              </Button>
              <Button
                onClick={() => handleRemoveCounty(county.GEO_ID)}
                variant="destructive"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )),
    [selectedCounties, activeCounty, toggleEditCounty, handleRemoveCounty]
  );

  const handleDone = React.useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    didUserInteractRef.current = true;

    const fipsList = selectedCounties
      .map(c => GEO_TO_FIPS(c.GEO_ID))
      .filter((v): v is string => !!v)
      .sort();

    // Flush to store
    setOperating(fipsList);

    // 🔑 wait for persist
    await new Promise(r => setTimeout(r, 50));

    router.push('/my-profile');
  }, [router, selectedCounties, setOperating]);




  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-1">No profile found</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Restore your demo profile first, then pick counties.
        </p>
        <Link href="/my-profile" className="underline">Back to profile</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 z-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pick your operating counties</h1>
          <p className="text-sm text-muted-foreground">
            Click counties to toggle. Use “Edit Zones” to mark partial coverage.
          </p>
        </div>
        <div className="w-full md:w-32">
          <Button onClick={handleDone} disabled={isSaving} aria-busy={isSaving} className="w-full">
            {isSaving ? 'Saving…' : 'Done'}
          </Button>
        </div>
      </div>
      {typeof window !== 'undefined' && (
        <CountySelectMap
          selected={selectedCounties}
          onChange={handleMapChange}
          editor={activeCounty ? {
            county: activeCounty,
            gridSize: 20,
            clipEdges: true,
            onUpdateZones: handleUpdateZones,
          } : undefined}
        />
      )}

      <div className="space-y-3">
        {selectedCounties.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No counties selected yet. Zoom in and click on a county to select it.
          </p>
        ) : (
          countyList
        )}
      </div>
    </div>
  );
}
