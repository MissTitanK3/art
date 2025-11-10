"use client";
import { useEffect, useState, useRef } from "react";
import { getCachedLocation, setCachedLocation } from "@/lib/locationCache";

type LatLng = { lat: number; lng: number };

type Props = {
  targetLocation: LatLng | null;
  maxDistanceKm?: number;
  onDistanceChange?: (distance: number | null) => void;
  refreshIntervalMs?: number; // default 10 minutes
  movementThresholdM?: number; // default 500 meters
};

export default function ReportDistanceGuard({
  targetLocation,
  maxDistanceKm = 15,
  onDistanceChange,
  refreshIntervalMs = 600000,
  movementThresholdM = 500,
}: Props) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [active, setActive] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track visibility to pause GPS polling when backgrounded
  useEffect(() => {
    const handleVisibility = () => setActive(!document.hidden);

    // Only run on client
    if (typeof document !== "undefined") {
      setActive(!document.hidden);
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, []);

  useEffect(() => {
    if (!targetLocation || !active) {
      onDistanceChange?.(null);
      return;
    }

    function fetchLocation() {
      const { coords: cachedCoords, timestamp } = getCachedLocation();
      const now = Date.now();
      const shouldFetch = !cachedCoords || now - timestamp > refreshIntervalMs;

      const updateDistance = (coords: LatLng) => {
        setCachedLocation([coords.lat, coords.lng]);
        const dist = safeDistanceKm(coords, targetLocation);
        setUserLocation(coords);
        setDistance(dist);
        onDistanceChange?.(dist);
      };

      if (!shouldFetch && cachedCoords) {
        const [lat, lng] = cachedCoords as [number, number];
        updateDistance({ lat, lng });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          updateDistance(coords);
        },
        () => {
          onDistanceChange?.(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    }

    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, refreshIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    targetLocation,
    refreshIntervalMs,
    movementThresholdM,
    onDistanceChange,
    active,
  ]);

  if (!userLocation || distance === null) {
    return (
      <p className="text-sm text-gray-500">
        Validating your location to be within {maxDistanceKm}km...
      </p>
    );
  }

  if (distance > maxDistanceKm) {
    return (
      <p className="text-sm text-yellow-600">
        ⚠️ This location is <strong>{distance.toFixed(2)}km</strong> away from
        your current location. Reports should generally be made only from your
        vicinity.
      </p>
    );
  }

  return null;
}

// Null-safe Haversine (km)
function safeDistanceKm(a: LatLng | null, b: LatLng | null): number | null {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
