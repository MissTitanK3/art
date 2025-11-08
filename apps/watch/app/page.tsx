'use client';

import dynamic from 'next/dynamic';
import AddReportButton from '../components/AddReportButton';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LatLngLiteral } from 'leaflet';
import { RefreshCw } from 'lucide-react';
import RightSidebar from '@/components/ui/RightSidebar';
import InfoTabs from '@/components/info/InfoTabs';
import JoinDispatchPanel from '@/components/features/JoinDispatch/JoinDispatchPanel';
import MapSettingsPanel from '@/components/features/MapSettings/MapSettingsPanel';
import FilterSidebar from '@/components/features/Filters/FilterSidebar';
import FABStack from '@/components/ui/FABStack';
import { useFindMe } from '@/lib/useFindMe';
import { clearCachedLocation } from '@/lib/locationCache';
import FeedDrawer from '@/components/features/ReportFeed/FeedDrawer';
import FeedButton from '@/components/features/ReportFeed/FeedButton';
import LocationButton from '@/components/features/Location/LocationButton';
import LocationDrawer, { type LocationMode } from '@/components/features/Location/LocationDrawer';
import WizardDrawer from '@/components/features/ReportWizard/WizardDrawer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ChoiceModal from '@/components/ui/ChoiceModal';
import type { Report, ReportFormData } from '@/types/wizard';
import { useMapTile } from '@/lib/MapTileContext';
import { formatDistance, distanceM } from '@/utils/distance';
import { AGENCY_GRADIENTS_DARK, AGENCY_GRADIENTS_LIGHT } from '@/constants/agencies';
const HeatOverlay = dynamic(() => import('@/components/map/HeatLayer').then(m => m.HeatLayer), { ssr: false });
const SelectionOverlay = dynamic(() => import('@/components/map/SelectionOverlay'), { ssr: false });

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), { ssr: false });

function filterReportsBySettings(
  reports: Report[],
  agencyFilter: string[],
  timeRange: [number, number],
) {
  const isAllAgencies = agencyFilter.length === 0;
  const [minHours, maxHours] = timeRange;
  const now = Date.now();

  return reports.filter((report) => {
    if (!report.location || typeof report.location.lat !== 'number' || typeof report.location.lng !== 'number') {
      return false;
    }
    if (!report.timestamp) return false;
    const timestampMs = new Date(report.timestamp).getTime();
    if (Number.isNaN(timestampMs)) return false;

    const reportAgeHours = (now - timestampMs) / (1000 * 60 * 60);
    const matchesTime = reportAgeHours >= minHours && reportAgeHours <= maxHours;
    const matchesAgency = isAllAgencies || (Array.isArray(report.agency_type) && report.agency_type.some((a) => agencyFilter.includes(a)));

    return matchesTime && matchesAgency;
  });
}

export default function Home() {
  // Map state
  const [position, setPosition] = useState<LatLngLiteral>({ lat: 38.7749, lng: -98.4194 });
  const [userPos, setUserPos] = useState<LatLngLiteral | null>(null);
  const [zoom, setZoom] = useState(3);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false); // open by default
  const [panel, setPanel] = useState<'filters' | 'info' | 'map'>('info');
  const [live, setLive] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [locExplainOpen, setLocExplainOpen] = useState(false);
  const [tempLocEnabled, setTempLocEnabled] = useState(false);
  const [chooseLocOpen, setChooseLocOpen] = useState(false);
  const [pendingAuto, setPendingAuto] = useState(false);
  const [locBlockedOpen, setLocBlockedOpen] = useState(false);
  const initialDraft: ReportFormData = {
    agency_type: [],
    agency_other: '',
    location: null,
    media_url: null,
    officer_moving: null,
    officer_direction: null,
    lights_on: null,
    sirens_on: null,
    test: null,
  };
  const [draft, setDraft] = useState<ReportFormData>(initialDraft);
  const [reports, setReports] = useState<Report[]>([]);
  const [agencyFilter, setAgencyFilter] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 168]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  // Auto-refresh interval ref
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  // Auto-refresh when live is true
  useEffect(() => {
    if (live) {
      autoRefreshRef.current = setInterval(() => {
        if (!isRefreshing) {
          setIsRefreshing(true);
        }
        setRefreshKey((k) => k + 1);
      }, 60000); // 60 seconds
    } else {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    }
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [live, isRefreshing]);
  const { tile } = useMapTile();
  const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  // Location state
  const [locDrawerOpen, setLocDrawerOpen] = useState(false);
  const [locMode, setLocMode] = useState<LocationMode>('off');
  const [showRadius, setShowRadius] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(15000);
  const prevShowRadiusRef = useRef<boolean | null>(null);
  const [unit, setUnit] = useState<'km' | 'mi'>('km');
  const [geoPermissionState, setGeoPermissionState] = useState<'granted' | 'prompt' | 'denied' | null>(null);

  const { handleFindMe, error: geoError } = useFindMe((coords) => {
    if (Array.isArray(coords)) {
      const [lat, lng] = coords as [number, number];
      const loc = { lat, lng } as LatLngLiteral;
      setUserPos(loc);
      setPosition(loc);
    } else if (coords && typeof coords === 'object' && 'lat' in (coords as any) && 'lng' in (coords as any)) {
      const loc = { lat: (coords as any).lat, lng: (coords as any).lng } as LatLngLiteral;
      setUserPos(loc);
      setPosition(loc);
    }
  });

  // When auto-detect is chosen, open the wizard using user position once available
  useEffect(() => {
    if (pendingAuto && userPos) {
      setDraft((d) => ({ ...d, location: userPos }));
      // center and zoom in for clarity
      setPosition(userPos);
      setZoom(14);
      // ensure feed drawer is closed to avoid overlapping drawers
      setFeedOpen(false);
      // One-time location enabled only after a successful fix
      if (tempLocEnabled) setLocMode('report');
      setReportDrawerOpen(true);
      setPendingAuto(false);
    }
  }, [pendingAuto, userPos]);

  // If auto-detect was requested but geolocation failed/denied, fall back to manual selection
  useEffect(() => {
    if (pendingAuto && geoError) {
      setPendingAuto(false);
      // revert temp one-time location enablement
      setLocMode('off');
      setTempLocEnabled(false);
      setLocBlockedOpen(true);
      // guide user into manual selection without showing radius if user position is unknown
      prevShowRadiusRef.current = showRadius;
      setShowRadius(false);
      // clear any stale coords
      setUserPos(null as any);
      try { clearCachedLocation(); } catch { }
      setSelecting(true);
    }
  }, [pendingAuto, geoError]);

  // Load reports for heatmap
  useEffect(() => {
    let active = true;
    setIsRefreshing(true);
    (async () => {
      try {
        const res = await fetch('/api/wizard');
        const json = await res.json();
        if (active && json.wizard) {
          setReports(json.wizard as Report[]);
          setLastFetchedAt(new Date());
        }
      } catch (e) {
        console.error('Failed to load reports', e);
      } finally {
        if (active) setIsRefreshing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  // Hydrate location preferences on client
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const m = localStorage.getItem('loc_mode') as LocationMode | null;
      if (m === 'off' || m === 'report' || m === 'trusted') setLocMode(m);
      const s = localStorage.getItem('loc_radius_show') === '1';
      setShowRadius(s);
      const r = Number(localStorage.getItem('loc_radius'));
      if (!Number.isNaN(r) && r > 0) setRadius(r);
      const u = localStorage.getItem('unit_pref') as 'km' | 'mi' | null;
      if (u === 'km' || u === 'mi') setUnit(u);
    } catch { }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedAgencies = localStorage.getItem('agencyFilter');
      if (storedAgencies) {
        const parsed = JSON.parse(storedAgencies);
        if (Array.isArray(parsed)) setAgencyFilter(parsed);
      }
    } catch { }
    try {
      const storedRange = localStorage.getItem('timeRange');
      if (storedRange) {
        const parsed = JSON.parse(storedRange);
        if (Array.isArray(parsed) && parsed.length === 2) {
          const start = Math.min(Math.max(0, Number(parsed[0]) || 0), 168);
          const endCandidate = Math.min(Math.max(0, Number(parsed[1]) || 168), 168);
          const end = Math.max(start, endCandidate);
          setTimeRange([start, end]);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !(navigator as any).permissions?.query) return;
    let status: PermissionStatus | null = null;
    const update = () => {
      setGeoPermissionState(status?.state as 'granted' | 'prompt' | 'denied' | null ?? null);
    };
    (async () => {
      try {
        status = await (navigator as any).permissions.query({ name: 'geolocation' as PermissionName });
        update();
        if (status) status.addEventListener('change', update);
      } catch {
        setGeoPermissionState(null);
      }
    })();
    return () => {
      status?.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('loc_mode', locMode);
  }, [locMode]);
  useEffect(() => {
    localStorage.setItem('loc_radius_show', showRadius ? '1' : '0');
  }, [showRadius]);
  useEffect(() => {
    localStorage.setItem('loc_radius', String(radius));
  }, [radius]);
  useEffect(() => {
    localStorage.setItem('unit_pref', unit);
  }, [unit]);
  useEffect(() => {
    try {
      localStorage.setItem('agencyFilter', JSON.stringify(agencyFilter));
    } catch { }
  }, [agencyFilter]);
  useEffect(() => {
    try {
      localStorage.setItem('timeRange', JSON.stringify(timeRange));
    } catch { }
  }, [timeRange]);

  const filteredReports = useMemo(
    () => filterReportsBySettings(reports, agencyFilter, timeRange),
    [reports, agencyFilter, timeRange],
  );

  const mapContainerClass = useMemo(() => 'fixed inset-0 z-[30]', []);
  const lastFetchedLabel = isRefreshing
    ? 'Refreshing reports...'
    : lastFetchedAt
      ? `Last updated at ${lastFetchedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
      : 'Waiting for reports...';

  function withinRadius(a: { lat: number; lng: number }, b: { lat: number; lng: number }, r: number) {
    return distanceM(a, b) <= r;
  }

  // Only show radius during selection or while the report drawer is open AND when we have a user position
  useEffect(() => {
    const shouldShow = !!userPos && (selecting || reportDrawerOpen);
    if (shouldShow !== showRadius) setShowRadius(shouldShow);
  }, [selecting, reportDrawerOpen, userPos]);

  return (
    <>
      {/* Fullscreen map */}
      <div className={mapContainerClass}>
        <div className="pointer-events-none absolute inset-x-0 top-20 z-[60] flex justify-center">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
            <span className="whitespace-nowrap">{lastFetchedLabel}</span>
            <button
              type="button"
              onClick={() => {
                if (!isRefreshing) setIsRefreshing(true);
                setRefreshKey((k) => k + 1);
              }}
              disabled={isRefreshing}
              className={`rounded-full bg-white/10 p-1 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white ${isRefreshing ? 'opacity-60' : ''}`}
              aria-label="Refresh reports"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        <div className={`absolute inset-0 ${selecting ? 'ring-2 ring-amber-300/40' : ''}`}>
          <MapWrapper
            position={position}
            zoom={zoom}
            onZoomChange={setZoom}
            onSelect={(pos) => {
              if (selecting) {
                setDraft((d) => ({ ...d, location: pos }));
                setSelecting(false);
                setReportDrawerOpen(true);
                // optional: center map to selection
                setPosition(pos);
              } else {
                setPosition(pos);
              }
            }}
            showRadius={showRadius && !!userPos}
            radiusMeters={radius}
            radiusCenter={userPos as any}
            showPositionMarker={selecting || reportDrawerOpen}
            onBoundsIdle={setBounds}
          >
            {/* Selection banner */}
            {selecting && (
              <div className="leaflet-top leaflet-center">
                <div className="m-2 px-3 py-2 rounded bg-amber-500 text-black font-semibold shadow">
                  Tap within your radius (max {formatDistance(radius, unit)})
                </div>
              </div>
            )}
            {/* Heat overlay */}
            <HeatOverlay
              reports={filteredReports}
              gradients={tile.mode === 'dark' ? AGENCY_GRADIENTS_DARK : AGENCY_GRADIENTS_LIGHT}
            />
            {/* Selected location + distance line */}
            {draft.location && userPos && (
              <SelectionOverlay user={userPos} target={draft.location} radius={radius} />)
            }
          </MapWrapper>
        </div>
      </div>

      {/* Bottom report feed drawer */}
      <FeedDrawer
        zoom={zoom}
        openAtZoom={12}
        openExternal={feedOpen}
        onCloseExternal={() => setFeedOpen(false)}
        reports={useMemo(() => {
          if (!bounds) return filteredReports;
          const east = bounds.east;
          const west = bounds.west;
          const wraps = east < west; // anti-meridian wrap
          return filteredReports.filter((r) => {
            const { lat, lng } = r.location;
            const inLat = lat <= bounds.north && lat >= bounds.south;
            const inLng = wraps ? lng >= west || lng <= east : lng >= west && lng <= east;
            return inLat && inLng;
          });
        }, [filteredReports, bounds])}
        onZoomTo={(pos) => {
          setPosition(pos as any);
          setZoom(15);
          setFeedOpen(false);
        }}
      />

      {/* Main Add Report Button - fixed bottom center */}
      <div className="fixed bottom-6 left-1/2 z-[40] -translate-x-1/2 flex justify-center pointer-events-auto">
        <AddReportButton
          onClick={() => {
            if (locMode === 'off') {
              if (geoPermissionState === 'granted') {
                setTempLocEnabled(true);
                setChooseLocOpen(true);
              } else {
                setLocExplainOpen(true);
              }
            } else {
              setChooseLocOpen(true);
            }
          }}
        />
      </div>

      {/* Bottom-left feed button */}
      <FeedButton onClick={() => setFeedOpen(true)} />

      {/* Unit switch moved into FABStack */}
      {/* Floating action buttons */}
      <FABStack
        onAddReport={() => {
          if (locMode === 'off') {
            if (geoPermissionState === 'granted') {
              setTempLocEnabled(true);
              setChooseLocOpen(true);
            } else {
              setLocExplainOpen(true);
            }
          } else {
            setChooseLocOpen(true);
          }
        }}
        isReporting={selecting || reportDrawerOpen || locExplainOpen || chooseLocOpen || pendingAuto}
        onCancelReport={() => {
          // close any open report-related UI
          setLocExplainOpen(false);
          setChooseLocOpen(false);
          setReportDrawerOpen(false);
          setSelecting(false);
          setPendingAuto(false);
          // restore radius visibility
          if (prevShowRadiusRef.current !== null) {
            setShowRadius(prevShowRadiusRef.current);
            prevShowRadiusRef.current = null;
          } else {
            setShowRadius(false);
          }
          // always revert location mode to Off when canceling report flow
          setLocMode('off');
          setTempLocEnabled(false);
          // clear any remembered coordinates
          setUserPos(null as any);
          try { clearCachedLocation(); } catch { }
          // reset draft
          setDraft(initialDraft);
        }}
        onMapSettings={() => {
          setPanel('map');
          setSidebarOpen(true);
        }}
        onFilters={() => {
          setPanel('filters');
          setSidebarOpen(true);
        }}
        onToggleLive={() => setLive((v) => !v)}
        onInfo={() => {
          setPanel('info');
          setSidebarOpen(true);
        }}
        liveActive={live}
        unit={unit}
        onToggleUnit={() => setUnit((u) => (u === 'km' ? 'mi' : 'km'))}
      />

      {/* Location controls */}
      <LocationButton mode={locMode} onClick={() => setLocDrawerOpen(true)} />
      <LocationDrawer
        isOpen={locDrawerOpen}
        onClose={() => setLocDrawerOpen(false)}
        mode={locMode}
        onChangeMode={async (m) => {
          if (m === 'trusted') {
            // Optimistically reflect selection, then request permission directly.
            setLocMode('trusted');
            try {
              // If Permissions API says denied, show help and watch for changes
              let permState: 'granted' | 'prompt' | 'denied' | null = null;
              let status: any = null;
              try {
                if ((navigator as any).permissions?.query) {
                  status = await (navigator as any).permissions.query({ name: 'geolocation' as any });
                  permState = status.state as any;
                }
              } catch { /* ignore */ }
              if (permState === 'denied') {
                setLocMode('off');
                setLocBlockedOpen(true);
                // Watch for user changing permission in the browser UI
                const handler = () => {
                  const s = (status?.state as any) || 'denied';
                  if (s === 'granted') {
                    setLocBlockedOpen(false);
                    setLocMode('trusted');
                    handleFindMe({ force: true });
                    status?.removeEventListener?.('change', handler);
                  }
                };
                if (status) {
                  if (typeof status.addEventListener === 'function') status.addEventListener('change', handler);
                  else (status as any).onchange = handler;
                }
                return;
              }

              navigator.geolocation.getCurrentPosition(
                () => {
                  handleFindMe({ force: true });
                },
                () => {
                  // Permission denied or failed: revert to Off and show help
                  setLocMode('off');
                  setLocBlockedOpen(true);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
              );
            } catch {
              setLocMode('off');
              setLocBlockedOpen(true);
            }
            return;
          }
          // report or off
          setLocMode(m);
          if (m === 'off') {
            setUserPos(null as any);
            try { clearCachedLocation(); } catch { }
          }
        }}
        showRadius={showRadius}
        radius={radius}
        onToggleRadius={() => {
          if (selecting || reportDrawerOpen) setShowRadius((v) => !v);
        }}
        onErase={async () => {
          try {
            localStorage.removeItem('loc_mode');
            localStorage.removeItem('loc_radius');
            localStorage.removeItem('loc_radius_show');
          } catch { }
          setLocMode('off');
          setShowRadius(false);
          setRadius(200);
          try {
            if ((navigator as any).permissions?.revoke) {
              await (navigator as any).permissions.revoke({ name: 'geolocation' as PermissionName });
            }
          } catch {
            // silently ignore revoke failures; some browsers require manual action
          }
          alert('Location data erased. Update browser site permissions to fully revoke access if needed.');
        }}
      />

      {/* Right-side contextual panel */}
      <RightSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={panel === 'filters' ? 'Filters' : panel === 'map' ? 'Map Settings' : 'Info & Resources'}
        widthClassName={panel === 'info' ? 'w-[min(90vw,28rem)]' : undefined}>
        {panel === 'filters' ? (
          <FilterSidebar
            onClose={() => setSidebarOpen(false)}
            onApply={({ agencies, timeRange: range }) => {
              setAgencyFilter(agencies);
              setTimeRange(range);
              setSidebarOpen(false);
            }}
            initialAgencies={agencyFilter}
            initialTimeRange={timeRange}
          />
        ) : panel === 'map' ? (
          <MapSettingsPanel onSelected={() => setSidebarOpen(false)} />
        ) : (
          <InfoTabs />
        )}
      </RightSidebar>

      {/* Report wizard drawer */}
      <WizardDrawer
        isOpen={reportDrawerOpen}
        onClose={() => {
          // Clicking outside the drawer should clear current selections
          setReportDrawerOpen(false);
          setLocMode('off');
          setDraft(initialDraft);
          setSelecting(false);
        }}
        onCancel={() => {
          // Cancel button: same as close, clear everything
          setReportDrawerOpen(false);
          setLocMode('off');
          setDraft(initialDraft);
          setSelecting(false);
        }}
        draft={draft}
        onChange={(partial) => setDraft((d) => ({ ...d, ...partial }))}
        userPosition={userPos}
        radiusMeters={radius}
        unit={unit}
        onSubmit={async () => {
          if (!draft.location) return;
          const fd = new FormData();
          fd.append('agency_type', JSON.stringify(draft.agency_type));
          fd.append('agency_other', draft.agency_other || '');
          fd.append('location', JSON.stringify(draft.location));
          if (draft.lights_on != null) fd.append('lights_on', String(!!draft.lights_on));
          if (draft.sirens_on != null) fd.append('sirens_on', String(!!draft.sirens_on));
          if (draft.officer_moving != null) fd.append('officer_moving', String(!!draft.officer_moving));
          if (draft.officer_direction) fd.append('officer_direction', draft.officer_direction);
          if (draft.media_url) fd.append('media', draft.media_url as any);
          if (draft.test != null) fd.append('test', String(!!draft.test));
          const res = await fetch('/api/wizard', { method: 'POST', body: fd });
          const json = await res.json();
          if (!res.ok) throw new Error(json?.error || 'Failed to submit');
          setRefreshKey((k) => k + 1); // refresh heatmap
          // reset draft minimal
          setDraft(initialDraft);
          // close drawer after submit
          setReportDrawerOpen(false);
          // if we temporarily enabled location for this report, turn it back off
          if (tempLocEnabled) {
            setLocMode('off');
            setTempLocEnabled(false);
          }
        }}
      />

      {/* Location permission explanation modal */}
      <ConfirmModal
        open={locExplainOpen}
        onCancel={() => setLocExplainOpen(false)}
        onConfirm={() => {
          // Do not flip locMode yet; only set after successful auto-detect.
          setTempLocEnabled(true);
          setLocExplainOpen(false);
          setChooseLocOpen(true);
        }}
        title="Turn on location for this report?"
        description={
          <div className="space-y-2">
            <p>We use your location once to:</p>
            <ul className="list-disc list-inside text-white/80">
              <li>Center the map near you</li>
              <li>Validate your report is within your safe radius</li>
            </ul>
            <p className="text-white/70">This is temporary and will turn off after you submit.</p>
          </div>
        }
        confirmLabel="Use location once"
        cancelLabel="Not now"
      />

      {/* Choose location method modal */}
      <ChoiceModal
        open={chooseLocOpen}
        onClose={() => setChooseLocOpen(false)}
        title="Choose report location"
        description={<>
          <p>You can either use your current location (auto-detect) or tap anywhere on the map to select a spot manually for your report.</p>
          <p>To submit a test report (for practice or demo), enable test mode in the report options after choosing your location. Test reports are not included in public data.</p>
        </>}
        primaryLabel="Auto-detect my location"
        secondaryLabel="Select on map"
        onPrimary={() => {
          setChooseLocOpen(false);
          setPendingAuto(true);
          handleFindMe({ force: true });
        }}
        onSecondary={() => {
          setChooseLocOpen(false);
          prevShowRadiusRef.current = showRadius;
          // Only show radius if we have a user position; otherwise keep it hidden
          if (userPos) setShowRadius(true); else setShowRadius(false);
          setSelecting(true);
          handleFindMe({ force: true });
          setLocMode('report');
          setZoom(15);
        }}
      />

      {/* Permission blocked help modal */}
      <ConfirmModal
        open={locBlockedOpen}
        onCancel={() => setLocBlockedOpen(false)}
        onConfirm={() => {
          // Let user try again after they change site settings
          setLocBlockedOpen(false);
          setLocMode('trusted');
          try {
            navigator.geolocation.getCurrentPosition(
              () => handleFindMe({ force: true }),
              () => setLocMode('off'),
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
            );
          } catch {
            setLocMode('off');
          }
        }}
        title="Location is blocked for this site"
        description={
          <div className="space-y-2">
            <p>
              Your browser is blocking location access. To enable, click the site permissions icon (lock) near the address
              bar and allow Location, then try again.
            </p>
            <p className="text-white/70 text-sm">On mobile, check your browser or OS settings for this site.</p>
          </div>
        }
        confirmLabel="I updated settings — Try again"
        cancelLabel="Close"
      />

      {/* helpers inside page */}
    </>
  );
}
