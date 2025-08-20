'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useProfileStore } from '@workspace/store/profileStore';
import { Button } from '@workspace/ui/components/button';

// UI-only shape expected by your CoverageZoneEditor
export interface SelectedCounty {
  GEO_ID: string;   // e.g. "0500000US01029"
  NAME: string;     // human name
  STATE: string;    // 2-digit FIPS state string (e.g. "01")
  ZONE: number[];   // optional grid cells marked as partial coverage
}

/** Convert GEO_ID => "ssccc" (state+county FIPS) */
function fipsFromGeoId(geoId: string | undefined): string | null {
  if (!geoId) return null;
  const m = /^0500000US(\d{2})(\d{3})$/.exec(geoId);
  return m ? `${m[1]}${m[2]}` : null;
}

/** Convert state, county => "ssccc" */
function fipsFromStateCounty(state: string | undefined, county: string | undefined) {
  if (!state || !county) return null;
  return `${state}${county}`.padStart(5, '0');
}

/** Build a SelectedCounty from a GeoJSON feature.properties record */
function selectedFromProps(props: any): SelectedCounty | null {
  const geoId = props?.GEO_ID as string | undefined;
  const state = props?.STATE as string | undefined;
  const county = props?.COUNTY as string | undefined;
  const name = props?.NAME as string | undefined;
  if (!geoId || !state || !county || !name) return null;
  return { GEO_ID: geoId, STATE: state, NAME: name, ZONE: [] };
}

// --- County index (lazy) ---------------------------------------------

type CountyProps = { GEO_ID: string; STATE: string; COUNTY: string; NAME: string };
type CountyIndex = Map<string, SelectedCounty>; // key: "ssccc"

async function loadCountyIndex(): Promise<CountyIndex> {
  // fetch from public/ (served at the app root)
  const res = await fetch('/us-counties.json', { cache: 'force-cache' });
  const data = await res.json() as {
    type: 'FeatureCollection';
    features: Array<{ properties: CountyProps }>;
  };

  const idx: CountyIndex = new Map();
  for (const f of data.features) {
    const key = fipsFromStateCounty(f.properties.STATE, f.properties.COUNTY);
    const sel = selectedFromProps(f.properties);
    if (key && sel) idx.set(key, sel);
  }
  return idx;
}

// --- Component --------------------------------------------------------

type MapProps = {
  selected: SelectedCounty[];
  onChange: (list: SelectedCounty[]) => void;
};

const CountySelectMap = dynamic<MapProps>(
  () =>
    import('../client/profile/CountySelectMap').then(
      (m) => m.CountySelectMap
    ),
  { ssr: false }
);

export function CountySelectDataLayer() {
  const router = useRouter();

  const profile = useProfileStore(s => s.profile);
  const setOperating = useProfileStore(s => s.setOperatingCounties);


  const [idx, setIdx] = React.useState<CountyIndex | null>(null);
  const [selected, setSelected] = React.useState<SelectedCounty[]>([]);
  const [isSaving, startSaving] = React.useTransition();

  // If profile missing (e.g. after purge), nudge back to profile page
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

  // Lazy‑load county index, then hydrate initial selection from store FIPS[]
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/us-counties.json', { cache: 'force-cache' });
        const data = (await res.json()) as {
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
        for (const fips of profile.operating_counties ?? []) {
          const c = byFips.get(fips);
          if (c) hydrated.push(c);
        }
        setSelected(hydrated);
      } catch {
        setSelected([]); // fail-open: user can still select
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.operating_counties?.join('|')]);

  const handleMapChange = React.useCallback((list: SelectedCounty[]) => {
    setSelected(list);
  }, []);

  // Persist to Zustand and navigate when pressing Done
  const handleDone = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      startSaving(() => {
        const fipsList = selected
          .map((c) => fipsFromGeoId(c.GEO_ID))
          .filter((v): v is string => !!v);
        setOperating(fipsList);
        router.push('/my-profile');
      });
    },
    [router, selected, setOperating]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pick your operating counties</h1>
          <p className="text-sm text-muted-foreground">
            Click counties to toggle. Zoom in to mark partial coverage zones.
          </p>
        </div>
        <div className='w-full md:w-32'>

          <Button
            onClick={handleDone}
            disabled={isSaving}
            aria-busy={isSaving}
            className='w-full'
          >
            {isSaving ? 'Saving…' : 'Done'}
          </Button>
        </div>
      </div>

      <CountySelectMap
        selected={selected}
        onChange={handleMapChange}
      />
    </div>
  );
}
