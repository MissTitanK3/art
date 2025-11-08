'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet.heat';
import { formatAge } from '@/utils/general';
import { Report } from '@/types/wizard';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { TranslationKey } from '@/lib/il8n/translations';
import { AGENCY_GRADIENTS, AGENCY_GRADIENTS_DARK, AGENCY_GRADIENTS_LIGHT, agencyColors } from '@/constants/agencies';
import { LocateFixed } from 'lucide-react';
import { useMapTile } from '@/lib/MapTileContext';
import { FrostedButton } from '../ui/FrostedButton';
import { MapControlsLegend } from './MapControlsLegend';
import { useFindMe } from '@/lib/useFindMe';
import TileLayerDropdown from './TileLayerDropdown';

function MapRefForwarder({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

function SetMapCenter({ center }: { center: LatLngExpression | null }) {
  const map = useMap();
  const previous = useRef<L.LatLng | null>(null);

  useEffect(() => {
    if (!center) return;

    const latLng = Array.isArray(center) ? L.latLng(center[0], center[1]) : L.latLng(center.lat, center.lng);

    const currentCenter = map.getCenter();
    const distanceMoved = map.distance(currentCenter, latLng);

    if (!previous.current || distanceMoved > 10) {
      map.flyTo(latLng, 9, { animate: true, duration: 1 });
      previous.current = latLng;
    }
  }, [center, map]);

  return null;
}

function VisibleReportsTracker({ reports, onChange }: { reports: Report[]; onChange: (visible: Report[]) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const visible = reports.filter((r) => bounds.contains(r.location));
      onChange(visible);
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    const visible = reports.filter((r) => bounds.contains(r.location));
    onChange(visible);
  }, [map, reports, onChange]);

  return null;
}

export function HeatLayer({ reports, gradients }: { reports: Report[]; gradients: Record<string, Record<number, string>> }) {
  const map = useMap();
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    const grouped: Record<string, [number, number, number?][]> = {};

    for (const report of reports) {
      const agency = report.agency_type?.[0] || 'other';
      const key = AGENCY_GRADIENTS[agency] ? agency : 'other';
      const point: [number, number, number?] = [report.location.lat, report.location.lng, 1];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(point);
    }

    for (const [agency, points] of Object.entries(grouped)) {
      const heat = (L as any)
        .heatLayer(points, {
          radius: 35,
          blur: 20,
          maxZoom: 17,
          maxOpacity: 0.9,   // keep centers opaque
          minOpacity: 0.4,   // ensure they’re visible even at low intensity
          gradient: gradients[agency],
        })
        .addTo(map);

      layersRef.current.push(heat);
    }

    return () => {
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];
    };
  }, [map, reports, gradients]);

  return null;
}

export default function HeatMap({ reports, center: initialCenter }: { reports: Report[]; center: LatLngExpression }) {
  const { t } = useTranslations();
  const [center, setCenter] = useState<LatLngExpression>(initialCenter);
  const [visibleReports, setVisibleReports] = useState<Report[]>(reports);
  const [zoomTarget, setZoomTarget] = useState<LatLngExpression | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { tile } = useMapTile();
  const gradients =
    tile.mode === "dark" ? AGENCY_GRADIENTS_DARK : AGENCY_GRADIENTS_LIGHT;

  const { handleFindMe, isLocating } = useFindMe((coords) => {
    setCenter(coords);
  });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!mapRef.current) return;

      switch (e.key) {
        case '+':
        case '=': // on some keyboards, = means +
          mapRef.current.zoomIn();
          break;
        case '-':
          mapRef.current.zoomOut();
          break;
        case '1':
          mapRef.current.setZoom(7);
          break;
        case '2':
          mapRef.current.setZoom(10);
          break;
        case '3':
          mapRef.current.setZoom(13);
          break;
        case '4':
          mapRef.current.setZoom(16);
          break;
        case '0':
          mapRef.current.setView(center, 9);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded overflow-hidden z-0">
      <div className="relative" ref={mapContainerRef}>
        <div className="h-[500px]">
          <MapContainer
            center={center}
            zoom={9}
            aria-label="Heatmap of ICE and law enforcement reports"
            scrollWheelZoom
            zoomControl
            style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <MapRefForwarder
              onMapReady={(map) => {
                mapRef.current = map;
              }}
            />
            <TileLayer attribution={tile.attribution} url={tile.url} />
            <HeatLayer reports={visibleReports} gradients={gradients} />
            <VisibleReportsTracker reports={reports} onChange={setVisibleReports} />
            <SetMapCenter center={zoomTarget ?? center} />
          </MapContainer>
        </div>
        <MapControlsLegend />
      </div>
      <div className="flex my-2 gap-3 flex-wrap justify-center text-center">
        <TileLayerDropdown />
        <FrostedButton onClick={() => handleFindMe()} disabled={isLocating}>
          {isLocating ? 'Locating...' : `📍 ${t('findMe') ?? 'Find Me'}`}
        </FrostedButton>
        <div className="flex my-2 gap-3 flex-wrap justify-center text-center">
          <FrostedButton className="w-56" onClick={() => mapRef.current?.setZoom(14)}>
            {t('mapControlsNeighborhood')} {/* Street (Zoom 13–14) */}
          </FrostedButton>
          <FrostedButton className="w-56" onClick={() => mapRef.current?.setZoom(11)}>
            {t('mapControlsCity')}
          </FrostedButton>
          <FrostedButton className="w-56" onClick={() => mapRef.current?.setZoom(8)}>
            {t('mapControlsRegion')}
          </FrostedButton>
          <FrostedButton className="w-56" onClick={() => mapRef.current?.setZoom(3)}>
            {t('mapControlsUS') ?? 'US'}
          </FrostedButton>
        </div>
      </div>

      <ul className="flex flex-wrap gap-4 text-sm pt-4 justify-center">
        {Object.entries(AGENCY_GRADIENTS).map(([agency, gradient]) => (
          <li key={agency} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: gradient[0.4] }} />
            <span>{agency}</span>
          </li>
        ))}
      </ul>

      <div className="text-sm space-y-2 mt-4">
        <h3 className="font-semibold">
          {t('visibleReports')} ({visibleReports.length})
        </h3>
        {visibleReports.length === 0 ? (
          <p className="text-gray-500">{t('noReports')}</p>
        ) : (
          <ul className="space-y-4">
            {visibleReports.map((r) => {
              const primaryAgency = r.agency_type?.[0] || r.agency_other || 'Other';
              const translatedAgencies = (r.agency_type || []).map((a) => t(`agency.${a}` as TranslationKey));
              const agencyColor = agencyColors[primaryAgency] || 'bg-gray-600';
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-md text-white overflow-hidden transition hover:shadow-lg">
                  <div
                    className={`px-4 py-2 text-base font-bold border-b-4 ${r.submitted_by ? 'border-green-500' : 'border-white/20'
                      } ${agencyColor}`}>
                    <div className="mb-1 text-2xl">
                      {[...translatedAgencies, r.agency_other].filter(Boolean).join(', ')}
                    </div>
                    {r.test && (
                      <span>
                        !!! {t('test')} !!! {t('test')} !!!
                      </span>
                    )}
                    <div className="mb-3 text-sm font-normal text-white/80">
                      <strong>{t('reported')}</strong> {formatAge(r.timestamp)} {t('timeAgo')}
                    </div>

                    <div className="grid grid-cols-2 items-center font-normal text-white/90 gap-2">
                      <span
                        className={`justify-self-center text-xs font-medium px-2 py-0.5 rounded ${r.submitted_by ? 'bg-green-700 text-white' : 'bg-white text-black'
                          }`}>
                        {r.submitted_by ? t('verifiedByDispatch') : t('anonymous')}
                      </span>

                      <button
                        onClick={() => {
                          setZoomTarget([r.location.lat, r.location.lng]);
                          mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="justify-self-end text-xl text-white opacity-80 hover:opacity-100"
                        title="Zoom to Report">
                        <LocateFixed size={24} />
                      </button>
                    </div>
                  </div>

                  <div className={`p-4 space-y-2 text-sm ${r.test ? 'bg-red-900' : ''} text-white/90`}>
                    <div>
                      <strong>{t('officerMovement')}:</strong>{' '}
                      {r.officer_moving === true
                        ? r.officer_direction
                          ? t(`direction.${r.officer_direction}` as TranslationKey)
                          : t('officerDirectionUnknown')
                        : r.officer_moving === false
                          ? t('stationary')
                          : t('movementUnknown')}
                    </div>
                    <div className="flex w-full justify-evenly flex-wrap gap-4">
                      <div>
                        <strong>{t('lightsOn')}:</strong> {r.lights_on ? t('yes') : t('no')}
                      </div>
                      <div>
                        <strong>{t('sirensOn')}:</strong> {r.sirens_on ? t('yes') : t('no')}
                      </div>
                    </div>
                    <div className="text-white/50 text-xs">{new Date(r.timestamp).toLocaleString()}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
