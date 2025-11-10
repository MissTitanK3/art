"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function ZoomGuard({ maxZoom }: { maxZoom: number }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (map.getZoom() > maxZoom) map.setZoom(maxZoom);
      // @ts-ignore - Leaflet typing doesn't expose setMaxZoom directly
      if (typeof (map as any).setMaxZoom === "function") {
        (map as any).setMaxZoom(maxZoom);
      }
    } catch {}
  }, [map, maxZoom]);
  return null;
}
