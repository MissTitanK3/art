"use client";

import { WizardReport } from "@workspace/store/types/watch.ts";
import { Button } from "@workspace/ui/primitives/button";
import { useEffect, useMemo, useState } from "react";
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
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const recency = useMemo(() => {
    const parsed = Date.parse(report.timestamp);
    if (Number.isNaN(parsed)) return null;

    const ageMinutes = Math.max(0, (Date.now() - parsed) / (1000 * 60));

    if (ageMinutes <= 15) {
      return {
        label: "Last 15 min",
        badgeClass:
          "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-500",
        dotClass: "bg-red-500",
      } as const;
    }

    if (ageMinutes <= 30) {
      return {
        label: "Last 30 min",
        badgeClass:
          "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-500",
        dotClass: "bg-orange-500",
      } as const;
    }

    if (ageMinutes <= 60) {
      return {
        label: "Last hour",
        badgeClass:
          "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
        dotClass: "bg-yellow-500",
      } as const;
    }

    return null;
  }, [report.timestamp]);

  const locationDisplay = useMemo(() => {
    if (locationLabel) return locationLabel;
    if (typeof lat === "number" && typeof lng === "number") {
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    }
    return "No location";
  }, [lat, lng, locationLabel]);

  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    let active = true;
    resolveLocationInfo(lat, lng).then((info) => {
      if (!active) return;
      setLocationLabel(info.county ?? info.city ?? info.state ?? null);
    });

    return () => {
      active = false;
    };
  }, [lat, lng]);

  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <div className="font-semibold">
        {report.agency_type?.join(", ") ||
          report.agency_other ||
          "Unknown presence"}
      </div>

      <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>{new Date(report.timestamp).toLocaleString()}</span>
        {recency ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${recency.badgeClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${recency.dotClass}`} />
            {recency.label}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <span aria-hidden>•</span>
          <span>{locationDisplay}</span>
        </span>
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
            <Button
              size="sm"
              className="w-full"
              onClick={() => onCreateDispatch(report)}
            >
              Create Dispatch
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
