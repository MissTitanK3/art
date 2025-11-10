"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function ZoomWatcher({
  onZoomChange,
}: {
  onZoomChange: (z: number) => void;
}) {
  const map = useMap();
  useEffect(() => {
    const emit = () => onZoomChange(map.getZoom());
    emit();
    map.on("zoomend", emit);
    return () => {
      map.off("zoomend", emit);
    };
  }, [map, onZoomChange]);
  return null;
}
