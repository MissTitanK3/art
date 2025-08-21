// apps/.../CountySelectDataLayer.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@workspace/ui/components/button';
import { useProfileStore } from '@workspace/store/profileStore';
import type { CountySelectMapProps } from '@workspace/ui/components/maps/CountySelectMap';

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

  // hydrate from store (unchanged from your version)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/us-counties.json', { cache: 'force-cache' });
        const data = await res.json() as {
          type: 'FeatureCollection';
          features: Array<{ properties: { GEO_ID: string; STATE: string; COUNTY: string; NAME: string } }>;
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
        setSelectedCounties(hydrated);
      } catch {
        setSelectedCounties([]);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.operating_counties?.join('|')]);

  // map -> parent (controlled)
  const handleMapChange = React.useCallback((list: SelectedCounty[]) => {
    setSelectedCounties(list);                      // list can hold many
    setActiveCounty(prev =>
      prev && !list.some(c => c.GEO_ID === prev.GEO_ID) ? null : prev
    );
  }, []);

  // list actions
  const toggleEditCounty = React.useCallback((county: SelectedCounty) => {
    setActiveCounty(prev => (prev?.GEO_ID === county.GEO_ID ? null : county));
  }, []);

  const handleUpdateZones = React.useCallback((geoId: string, zones: number[]) => {
    // update zones immutably
    setSelectedCounties(prev =>
      prev.map(c => (c.GEO_ID === geoId ? { ...c, ZONE: zones } : c))
    );
  }, []);

  const handleRemoveCounty = React.useCallback((geoId: string) => {
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
                Partial coverage: {county.ZONE.length} zone
                {county.ZONE.length > 1 ? "s" : ""}
              </div>
            )}
            <div className="flex items-center gap-3 mt-3">
              <Button
                onClick={() => toggleEditCounty(county)}
              >
                {activeCounty?.GEO_ID === county.GEO_ID
                  ? "Done Editing"
                  : "Edit Zones"}
              </Button>
              <Button
                onClick={() =>
                  setSelectedCounties((prev) =>
                    prev.filter((c) => c.GEO_ID !== county.GEO_ID)
                  )
                }
                variant='destructive'
              >
                Remove
              </Button>
            </div>
          </div>

        </div>

      )),
    [selectedCounties, activeCounty, toggleEditCounty, handleRemoveCounty],
  );

  // save button (unchanged)
  const handleDone = React.useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    startSaving(() => {
      const toFips = (geoId: string) => {
        const m = /^0500000US(\d{2})(\d{3})$/.exec(geoId);
        return m ? `${m[1]}${m[2]}` : null;
      };
      const fipsList = selectedCounties
        .map(c => toFips(c.GEO_ID))
        .filter((v): v is string => !!v);
      setOperating(fipsList);
      router.push('/my-profile');
    });
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
    <div className="flex flex-col gap-4">
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

      {/* Map: controlled list + optional editor */}
      <CountySelectMap
        selected={selectedCounties}
        onChange={handleMapChange}
        editor={activeCounty ? {
          county: activeCounty,
          gridSize: 20,         // tweak as you like
          clipEdges: true,
          onUpdateZones: handleUpdateZones,
        } : undefined}
      />

      {/* List under the map */}
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
