'use client';

import dynamic from 'next/dynamic';
import { useRef, useEffect, useState } from 'react';
import { Map as LeafletMap } from 'leaflet';
import ReportDistanceGuard from './ReportDistanceGuard';
import { useTranslations } from '@/lib/il8n/useTranslations';
import { useWizard } from './WizardContext';
import { useFindMe } from '@/lib/useFindMe';
import TileLayerDropdown from '../map/TileLayerDropdown';
import { FrostedButton } from '../ui/FrostedButton';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), { ssr: false });

type LatLng = { lat: number; lng: number };

export default function LocationStep() {
  const { t } = useTranslations();
  const { setCanContinue, formData, setFormData } = useWizard();
  const [position, setPosition] = useState<LatLng | null>(formData.location || null);
  const [zoom, setZoom] = useState(16);
  const [distanceFromUser, setDistanceFromUser] = useState<number | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const { handleFindMe, isLocating, error } = useFindMe((coords) => {
    const [lat, lng] = coords as [number, number];
    const normalized = { lat, lng };
    setPosition(normalized);
    setFormData((prev) => ({ ...prev, location: normalized }));
  });

  useEffect(() => {
    if (!position) {
      handleFindMe();
    }

    const map = mapRef.current;
    if (!map) return;

    const handleZoom = () => setZoom(map.getZoom());
    map.on('zoomend', handleZoom);

    return () => {
      map.off('zoomend', handleZoom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isValid = !!position && distanceFromUser !== null && distanceFromUser <= 15;
    setCanContinue(isValid);
  }, [position, distanceFromUser, setCanContinue]);

  const handleMapSelect = (coords: LatLng) => {
    setPosition(coords);
    setDistanceFromUser(null);
    setFormData((prev) => ({ ...prev, location: coords }));
  };

  return (
    <div className="space-y-4 z-0">
      <div className="w-full flex flex-col justify-center items-center">
        <div className="pt-2">
          <h3 className="text-lg font-semibold">{t('locationPrompt')}</h3>
          <p className="text-sm text-gray-600">{t('tapMapOrGPS')}</p>
        </div>
        <div className="p-2 flex flex-wrap justify-evenly">
          <FrostedButton onClick={() => handleFindMe()} disabled={isLocating}>
            {isLocating ? 'Locating...' : `📍 ${t('findMe') ?? 'Find Me'}`}
          </FrostedButton>
          <TileLayerDropdown />
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="h-[500px] rounded overflow-hidden z-0">
        {position && <MapWrapper position={position} zoom={zoom} onZoomChange={setZoom} onSelect={handleMapSelect} />}
      </div>

      {formData.location && (
        <ReportDistanceGuard
          targetLocation={formData.location}
          onDistanceChange={(dist) => setDistanceFromUser(dist)}
        />
      )}

      {/* {zoom > 16 && <div className="text-sm text-yellow-600">{t('zoomOutForSafety')}</div>} */}
    </div>
  );
}
