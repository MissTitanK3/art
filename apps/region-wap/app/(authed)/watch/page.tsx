"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchReports } from "@/lib/adapters/fetchReports";
import { MapFocus, WizardReport } from "@workspace/store/types/watch.ts";
import dynamic from "next/dynamic";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import WatchReportCard from "@workspace/ui/components/client/watch/WatchReportCard";
import { useRouter } from "next/navigation";
// filters UI moved into Map Options drawer inside WatchMap

// Dynamically import WatchMap so Leaflet never loads during SSR
const WatchMap = dynamic(
  () => import("@workspace/ui/components/client/watch/WatchMap"),
  { ssr: false },
);

const FOCUS_ZOOM = 11;

export default function WatchPage() {
  const [reports, setReports] = useState<WizardReport[]>([]);
  const [visibleReports, setVisibleReports] = useState<WizardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const router = useRouter();

  // Filters / layers
  const [query, setQuery] = useState("");
  const [hideTest, setHideTest] = useState(true);
  const [withMediaOnly, setWithMediaOnly] = useState(false);
  const [lightsOnly, setLightsOnly] = useState(false);
  const [sirensOnly, setSirensOnly] = useState(false);
  const [movingOnly, setMovingOnly] = useState(false);
  const [timeWindow, setTimeWindow] = useState<string>("any"); // hours: 'any' | '2' | '6' | '12' | '24' | '72'
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    setMounted(true);
    async function loadReports() {
      try {
        const data = await fetchReports();
        setReports(data);
        setVisibleReports(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const normalizeCoord = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const handleCreateDispatch = (report: WizardReport) => {
    const params = new URLSearchParams();
    params.set("source", "watch-map");
    params.set("reportId", String(report.id));

    const location = (report.location as any) ?? {};
    const lat = normalizeCoord(location?.lat);
    const lng = normalizeCoord(location?.lng);

    if (lat !== undefined && lng !== undefined) {
      params.set("lat", lat.toString());
      params.set("lng", lng.toString());
    }

    const agencyLabel = report.agency_type?.join(", ") || report.agency_other;
    if (agencyLabel) {
      params.set("label", agencyLabel);
      params.set("agency", agencyLabel);
    }

    router.push(`/team-req?${params.toString()}`);
  };

  const handleViewOnMap = (report: WizardReport) => {
    setActiveTab("map");

    const location = (report.location as any) ?? {};
    const lat = normalizeCoord(location?.lat);
    const lng = normalizeCoord(location?.lng);

    if (lat === undefined || lng === undefined) return;

    setMapFocus({
      lat,
      lng,
      zoom: FOCUS_ZOOM,
      token: Date.now(),
      reportId: report.id,
    });
  };

  // Build available agency types from data (normalized human labels)
  const availableAgencies = useMemo(() => {
    const set = new Set<string>();
    for (const r of reports) {
      if (Array.isArray(r.agency_type)) {
        for (const t of r.agency_type) if (t) set.add(String(t));
      } else if (r.agency_other) {
        set.add(String(r.agency_other));
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [reports]);

  const filteredReports = useMemo(() => {
    const now = Date.now();
    const maxAgeMs =
      timeWindow === "any" ? Infinity : Number(timeWindow) * 60 * 60 * 1000;
    const q = query.trim().toLowerCase();

    const matchesAgency = (r: WizardReport) => {
      if (selectedAgencies.size === 0) return true;
      const types = Array.isArray(r.agency_type) ? r.agency_type : [];
      const other = r.agency_other ? [r.agency_other] : [];
      const all = [...types, ...other].map((s) => String(s));
      return all.some((a) => selectedAgencies.has(a));
    };

    return reports.filter((r) => {
      if (hideTest && r.test) return false;
      if (withMediaOnly && !r.media_url) return false;
      if (lightsOnly && !r.lights_on) return false;
      if (sirensOnly && !r.sirens_on) return false;
      if (movingOnly && !r.officer_moving) return false;
      if (!matchesAgency(r)) return false;

      // time window
      const ts = Date.parse(r.timestamp);
      if (!Number.isNaN(ts)) {
        if (now - ts > maxAgeMs) return false;
      }

      if (q.length > 0) {
        const hay = [
          ...(Array.isArray(r.agency_type) ? r.agency_type : []),
          r.agency_other ?? "",
          r.officer_direction ?? "",
          r.submitted_by ?? "",
        ]
          .join(" \n ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [
    reports,
    query,
    hideTest,
    withMediaOnly,
    lightsOnly,
    sirensOnly,
    movingOnly,
    timeWindow,
    selectedAgencies,
  ]);

  useEffect(() => {
    setVisibleReports(filteredReports);
  }, [filteredReports]);

  const handleVisibleReportsChange = useCallback((next: WizardReport[]) => {
    setVisibleReports((prev) => {
      if (
        prev.length === next.length &&
        prev.every((item, index) => item.id === next[index]?.id)
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const listReports = visibleReports;

  const resetFilters = () => {
    setQuery("");
    setHideTest(true);
    setWithMediaOnly(false);
    setLightsOnly(false);
    setSirensOnly(false);
    setMovingOnly(false);
    setTimeWindow("any");
    setSelectedAgencies(new Set());
  };

  if (loading)
    return <div className="text-muted-foreground">Loading reports…</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="px-4">
      <section>
        {/* Filters moved to Map Options drawer */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "map" | "list")}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-4">
            {mounted ? (
              <div className="relative">
                <WatchMap
                  reports={filteredReports}
                  center={[38.79, -106.53]}
                  zoom={3}
                  onCreateDispatch={handleCreateDispatch}
                  focusPoint={mapFocus}
                  filterQuery={query}
                  onFilterQueryChange={setQuery}
                  filterTimeWindow={timeWindow}
                  onFilterTimeWindowChange={setTimeWindow}
                  availableAgencies={availableAgencies}
                  selectedAgencies={selectedAgencies}
                  onToggleAgency={(a, checked) => {
                    setSelectedAgencies((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(a);
                      else next.delete(a);
                      return next;
                    });
                  }}
                  hideTest={hideTest}
                  onHideTestChange={(v) => setHideTest(Boolean(v))}
                  withMediaOnly={withMediaOnly}
                  onWithMediaOnlyChange={(v) => setWithMediaOnly(Boolean(v))}
                  lightsOnly={lightsOnly}
                  onLightsOnlyChange={(v) => setLightsOnly(Boolean(v))}
                  sirensOnly={sirensOnly}
                  onSirensOnlyChange={(v) => setSirensOnly(Boolean(v))}
                  movingOnly={movingOnly}
                  onMovingOnlyChange={(v) => setMovingOnly(Boolean(v))}
                  onResetFilters={resetFilters}
                  onVisibleReportsChange={handleVisibleReportsChange}
                />
                {listReports.length === 0 ? (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-md bg-background/80 px-3 py-2 text-sm text-muted-foreground shadow">
                      {filteredReports.length === 0
                        ? reports.length === 0
                          ? "No reports yet."
                          : "No reports match current filters."
                        : "No reports match current map view."}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-muted-foreground">Loading map…</div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-4 space-y-3">
            {listReports.length > 0 ? (
              listReports.map((r) => (
                <WatchReportCard
                  key={r.id}
                  report={r}
                  onViewOnMap={handleViewOnMap}
                />
              ))
            ) : (
              <div className="text-muted-foreground">
                {filteredReports.length === 0
                  ? reports.length === 0
                    ? "No reports yet."
                    : "No reports match current filters."
                  : "No reports match current map view."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
