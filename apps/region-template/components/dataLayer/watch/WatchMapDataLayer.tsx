"use client";

import { useEffect, useState } from "react";
import { fetchReports } from "@/lib/adapters/fetchReports";
import { WizardReport } from "@workspace/store/types/watch.ts";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import WatchReportCard from "@workspace/ui/components/client/watch/WatchReportCard";
import { useRouter } from "next/navigation";

// Dynamically import WatchMap so Leaflet never loads during SSR
const WatchMap = dynamic(
  () => import("@workspace/ui/components/client/watch/WatchMap"),
  { ssr: false }
);

type MapFocus = {
  lat: number;
  lng: number;
  zoom?: number;
  token: number;
  reportId?: WizardReport["id"];
};

const FOCUS_ZOOM = 11;

export default function WatchMapDataLayer() {
  const [reports, setReports] = useState<WizardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function loadReports() {
      try {
        const data = await fetchReports();
        setReports(data);
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

  if (loading) return <div className="text-muted-foreground">Loading reports…</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <section>
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
          {mounted && reports.length > 0 ? (
            <WatchMap
              reports={reports}
              center={[38.79, -106.53]}
              zoom={3}
              onCreateDispatch={handleCreateDispatch}
              focusPoint={mapFocus}
            />
          ) : (
            <div className="text-muted-foreground">No reports yet.</div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-3">
          {reports.map((r) => (
            <WatchReportCard key={r.id} report={r} onViewOnMap={handleViewOnMap} />
          ))}
        </TabsContent>
      </Tabs>
    </section>
  );
}
