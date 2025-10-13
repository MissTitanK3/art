"use client";

import { WizardReport } from "@workspace/store/types/watch.ts";
import { Button } from "../../button.tsx";
import { useEffect, useState } from "react";
import { resolveLocationInfo } from "@workspace/ui/lib/location-resolver";

interface WatchReportCardProps {
  report: WizardReport;
  onCreateDispatch?: (report: WizardReport) => void;
  onViewOnMap?: (report: WizardReport) => void;
}

export default function WatchReportCard({
  report,
  onCreateDispatch,
  onViewOnMap,
}: WatchReportCardProps) {
  const rawLat = (report.location as any)?.lat;
  const rawLng = (report.location as any)?.lng;
  const lat = typeof rawLat === "string" ? Number(rawLat) : rawLat;
  const lng = typeof rawLng === "string" ? Number(rawLng) : rawLng;
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    let active = true;
    resolveLocationInfo(lat, lng).then((info) => {
      if (!active) return;
      setCity(info.city);
    });

    return () => {
      active = false;
    };
  }, [lat, lng]);

  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <div className="font-semibold">
        {report.agency_type?.join(", ") || report.agency_other || "Unknown presence"}
      </div>

      <div className="text-sm text-muted-foreground">
        {new Date(report.timestamp).toLocaleString()} •{" "}
        {city
          ? city
          : typeof lat === "number" && typeof lng === "number"
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

      {(onViewOnMap || onCreateDispatch) && (
        <div className="mt-2 flex flex-col gap-2">
          {onViewOnMap && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => onViewOnMap(report)}
            >
              View on Map
            </Button>
          )}

          {onCreateDispatch && (
            <Button size="sm" className="w-full" onClick={() => onCreateDispatch(report)}>
              Create Dispatch
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
