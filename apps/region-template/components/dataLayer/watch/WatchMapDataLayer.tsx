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

export default function WatchMapDataLayer() {
  const [reports, setReports] = useState<WizardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
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

  if (loading) return <div className="text-muted-foreground">Loading reports…</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <section>
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          {mounted && reports.length > 0 ? (
            <WatchMap reports={reports} center={[38.79, -106.53]} zoom={3} onCreateDispatch={
              (report) => {
                router.push(`/team-req?prefill=${report.id}&source=report&lat=${(report.location as any)?.lat}&lng=${(report.location as any)?.lng}&agency_type=${report.agency_type?.join(",")}&agency_other=${report.agency_other}`);
              }
            } />
          ) : (
            <div className="text-muted-foreground">No reports yet.</div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-3">
          {reports.map((r) => (
            <WatchReportCard key={r.id} report={r} />
          ))}
        </TabsContent>
      </Tabs>
    </section>
  );
}
