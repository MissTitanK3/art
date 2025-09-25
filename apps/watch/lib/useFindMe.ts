import { useCallback, useState, useEffect } from 'react';
import { LatLngExpression } from 'leaflet';
import { getCachedLocation, setCachedLocation } from '@/lib/locationCache';

export function useFindMe(
  onLocate: (coords: LatLngExpression) => void,
  getTranslation?: (key: string) => string | undefined,
  refreshIntervalMs = 600000, // 10 minutes
  movementThresholdM = 500, // 500 meters
) {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(true); // assume active until client mounts

  // Track tab visibility
  useEffect(() => {
    const handleVisibility = () => setActive(!document.hidden);

    // Only run on client
    if (typeof document !== 'undefined') {
      setActive(!document.hidden);
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, []);

  const handleFindMe = useCallback(() => {
    if (!active) return; // don't fetch in background

    setIsLocating(true);
    setError(null);

    const { coords: cachedCoords, timestamp } = getCachedLocation();
    const now = Date.now();
    const shouldFetch = !cachedCoords || now - timestamp > refreshIntervalMs;

    const emitLocation = (coords: LatLngExpression) => {
      setCachedLocation(coords);
      onLocate(coords);
      setIsLocating(false);
    };

    const success = (pos: GeolocationPosition) => {
      const coords: LatLngExpression = [pos.coords.latitude, pos.coords.longitude];
      const movedEnough = !cachedCoords || getDistanceM(cachedCoords, coords) > movementThresholdM;

      if (movedEnough || shouldFetch) {
        emitLocation(coords);
      } else {
        emitLocation(cachedCoords);
      }
    };

    const failure = () => {
      const fallbackMessage = getTranslation?.('locationDenied') ?? 'Unable to retrieve location.';
      setError(fallbackMessage);
      setIsLocating(false);
    };

    if (!shouldFetch && cachedCoords) {
      emitLocation(cachedCoords);
      return;
    }

    navigator.geolocation.getCurrentPosition(success, failure, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, [onLocate, getTranslation, refreshIntervalMs, movementThresholdM, active]);

  return { handleFindMe, isLocating, error };
}

// Distance helper (meters)
function getDistanceM(a: LatLngExpression, b: LatLngExpression) {
  const [lat1, lon1] = a as [number, number];
  const [lat2, lon2] = b as [number, number];
  const R = 6371e3;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLng = ((lon2 - lon1) * Math.PI) / 180;
  const x = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
