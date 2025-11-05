'use client';

import type { Map as LeafletMap } from 'leaflet';

export function useMapCentering() {
  async function centerOnMe(
    map: LeafletMap | null,
    getPosition: () => Promise<{ lat: number; lng: number }>,
    setLocation: (loc: { lat: number; lng: number }) => void,
    setError: (msg?: string) => void,
    maxNativeZoom?: number,
  ) {
    try {
      const { lat, lng } = await getPosition();
      setLocation({ lat, lng });
      if (map) {
        const targetZoom = Math.min((maxNativeZoom ?? 19) - 1, 15);
        map.flyTo([lat, lng], targetZoom, { animate: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to access your location');
    }
  }

  return { centerOnMe };
}
