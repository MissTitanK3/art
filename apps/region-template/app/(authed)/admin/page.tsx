"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import DonutChart from "@workspace/ui/components/charts/DonutChart";
import StatCard from "@workspace/ui/components/stat-card";
import NavTile from "@workspace/ui/components/nav-tile";
import KeyValueItem from "@workspace/ui/components/key-value-item";
import { percent } from "@workspace/ui/lib/utils";
import { toWatchReports } from "@workspace/ui/lib/adapters/dispatch-to-watch";
import { FileChartLine, MapPin, Settings, ShieldCheck, Users2, Users, Package, GraduationCap, Handshake, Database } from "lucide-react";

import { demoDispatches } from "@/data/demoDispatches";
import { demoPods, demoRoster } from "@/data/demoPods";
import { TraingingSessionsDemoData } from "@/data/demoAcademy";
import type { WizardReport } from "@workspace/store/types/watch.ts";
import { useRouter } from "next/navigation";

// Map component (client-only)
const WatchMap = dynamic(() => import("@workspace/ui/components/client/watch/WatchMap"), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
  // Aggregated metrics from demo data
  const uniqueProfiles = React.useMemo(() => {
    const ids = new Set<string>();
    demoRoster.forEach((r) => ids.add(r.profile.id));
    return ids.size;
  }, []);

  const activeDispatches = React.useMemo(
    () =>
      demoDispatches.filter((d) => !["archived", "completed", "cancelled", "expired"].includes(d.status)).length,
    [],
  );

  const podsCount = demoPods.length;

  const trainingCounts = React.useMemo(() => {
    const all = TraingingSessionsDemoData.filter((s) => s.status !== "archived");
    const completed = all.filter((s) => s.status === "completed").length;
    const scheduled = all.filter((s) => s.status === "scheduled").length;
    const inProgress = all.filter((s) => s.status === "in_progress").length;
    return { all: all.length, completed, scheduled, inProgress };
  }, []);

  const trainingPct = percent(trainingCounts.completed, trainingCounts.all);

  // Adapt dispatch submissions to WatchMap's WizardReport for the map view
  const { reports, idMap } = React.useMemo(() => toWatchReports(demoDispatches), []);

  const handleView = (r: WizardReport) => {
    const id = idMap[r.id];
    if (id) router.push(`/dispatches/submission/${id}`);
  };

  const chartData = [
    { name: "Completed", value: trainingCounts.completed },
    { name: "In Progress", value: trainingCounts.inProgress },
    { name: "Scheduled", value: trainingCounts.scheduled },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Regional Admin</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/admin/settings" className="inline-flex items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </a>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Profiles" value={uniqueProfiles} icon={<Users2 className="h-4 w-4 text-muted-foreground" />} />
        <StatCard
          label="Active Dispatches"
          value={activeDispatches}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard label="Pods" value={podsCount} icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} />
        <StatCard label="Training Completed" value={`${trainingPct}%`} icon={<FileChartLine className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* Quick navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Sections</CardTitle>
          <CardDescription>Jump into a specific management area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <NavTile href="/admin/profiles" icon={<Users className="h-5 w-5" />} label="Profiles" description="Manage users, roles, verification" />
            <NavTile href="/admin/pods" icon={<Package className="h-5 w-5" />} label="Pods" description="Organize pods and rosters" />
            <NavTile href="/admin/dispatch" icon={<MapPin className="h-5 w-5" />} label="Dispatch" description="Review and audit dispatches" />
            <NavTile href="/admin/training" icon={<GraduationCap className="h-5 w-5" />} label="Training" description="Classes, sessions, participants" />
            <NavTile href="/admin/trust" icon={<Handshake className="h-5 w-5" />} label="Trust" description="Manage trust signatures" />
            <NavTile href="/admin/db" icon={<Database className="h-5 w-5" />} label="Database" description="Schema health and exports" />
          </div>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Active Dispatches (Map)</CardTitle>
            <CardDescription>Spatial view of recent dispatch activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[420px] overflow-hidden">
              <WatchMap
                reports={reports}
                className="h-full lg:h-full"
                actionMode="view"
                onViewDispatch={handleView}
              />
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>
              {trainingCounts.completed} completed of {trainingCounts.all} active sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              id="training-progress"
              className="w-full h-[220px]"
              data={chartData}
              config={{
                // Use standard colors (hex/HSL/RGB)
                Completed: { label: "Completed", color: "#10b981" }, // emerald-500
                "In Progress": { label: "In Progress", color: "#f59e0b" }, // amber-500
                Scheduled: { label: "Scheduled", color: "#3b82f6" }, // blue-500
              }}
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              showLabels
              showLegend
            />

            <div className="mt-4 text-sm text-muted-foreground">Percentage completed is across non-archived sessions.</div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Schema, spatial, and trigger checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <KeyValueItem label="Schema Version" value={<span className="font-mono">2025.10.24</span>} />
            <KeyValueItem label="PostGIS" value={<span className="text-emerald-600 dark:text-emerald-400 font-medium">OK</span>} />
            <KeyValueItem label="location_geog sync" value={<span className="text-emerald-600 dark:text-emerald-400 font-medium">OK</span>} />
            <KeyValueItem label="Audit triggers" value={<span className="text-emerald-600 dark:text-emerald-400 font-medium">OK</span>} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
