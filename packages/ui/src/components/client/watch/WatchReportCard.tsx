"use client";

import { WizardReport } from "@workspace/store/types/watch.ts";
import { Button } from "../../button.tsx";
import { useEffect, useState } from "react";

// Simple in-memory cache shared across all cards
// Cache both resolved cities and in-flight promises
// In-memory cache (promise dedupe)
const cityCache = new Map<string, Promise<string | null>>();

function normalizeCoord(lat: number, lng: number, precision = 1) {
  return `${lat.toFixed(precision)},${lng.toFixed(precision)}`;
}

async function fetchCity(lat: number, lng: number): Promise<string | null> {
  const key = normalizeCoord(lat, lng, 1);

  // 1. Check in-memory
  if (cityCache.has(key)) {
    return cityCache.get(key)!;
  }

  // 2. Check localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`city:${key}`);
    if (stored !== null) {
      const parsed = stored === "null" ? null : stored;
      cityCache.set(key, Promise.resolve(parsed));
      return parsed;
    }
  }

  // 3. Fetch from API
  const promise = (async () => {
    const [normLat, normLng] = key.split(",").map(parseFloat);

    try {
      const res = await fetch(`/api/reverse-geocode?lat=${normLat}&lng=${normLng}`);
      if (!res.ok) return null;

      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        null;

      // Save to localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem(`city:${key}`, city ?? "null");
      }

      return city;
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      return null;
    }
  })();

  cityCache.set(key, promise);

  const city = await promise;
  cityCache.set(key, Promise.resolve(city));
  return city;
}

interface WatchReportCardProps {
  report: WizardReport;
  onCreateDispatch?: (report: WizardReport) => void;
}

export default function WatchReportCard({
  report,
  onCreateDispatch,
}: WatchReportCardProps) {
  const lat = (report.location as any)?.lat;
  const lng = (report.location as any)?.lng;
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;

    fetchCity(lat, lng).then(setCity);
  }, [lat, lng]);

  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <div className="font-semibold">
        {report.agency_type?.join(", ") || report.agency_other || "Unknown activity"}
      </div>

      <div className="text-sm text-muted-foreground">
        {new Date(report.timestamp).toLocaleString()} •{" "}
        {city
          ? city
          : lat && lng
            ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            : "No location"}
      </div>

      {report.media_url && (
        <a
          href={report.media_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline text-sm block"
        >
          View Media
        </a>
      )}

      {onCreateDispatch && (
        <Button
          size="sm"
          className="mt-2 w-full"
          onClick={() => onCreateDispatch(report)}
        >
          Create Dispatch
        </Button>
      )}
    </div>
  );
}
