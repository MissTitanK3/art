"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import DonutChart from "@workspace/ui/components/charts/DonutChart";
import StatCard from "@workspace/ui/components/stat-card";
import NavTile from "@workspace/ui/components/nav-tile";
import { toWatchReports } from "@workspace/ui/lib/adapters/dispatch-to-watch";
import { FileChartLine, MapPin, Settings, ShieldCheck, Users2, Users, Package, GraduationCap, Handshake, Database, Bug, CalendarDays } from "lucide-react";

import AdminNotificationsDataLayer from "@/components/dataLayer/admin/notifications/AdminNotificationsDataLayer";

import type { WizardReport } from "@workspace/store/types/watch.ts";
import { useRouter } from "next/navigation";
import { DispatchSubmission } from "@workspace/store/types/global";
import { Pod } from "@workspace/store/types/pod";
import type { Profile } from "@workspace/store/types/global.ts";

// Map component (client-only)
const WatchMap = dynamic(() => import("@workspace/ui/components/client/watch/WatchMap"), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
  // Aggregated metrics from demo data
  const [uniqueProfiles, setUniqueProfiles] = React.useState<number>(0);
  const [uniquePods, setUniquePods] = React.useState<number>(0);
  const [dispatches, setDispatches] = React.useState<DispatchSubmission[]>([]);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch("/api/admin/profiles", {
          credentials: "include",
          signal: controller.signal,
        });

        const podsRes = await fetch("/api/admin/pods", {
          credentials: "include",
          signal: controller.signal,
        });

        const dispatchesRes = await fetch("/api/admin/dispatches", {
          credentials: "include",
          signal: controller.signal,
        });

        if (!podsRes.ok) throw new Error(`HTTP ${podsRes.status}`);
        const { pods } = (await podsRes.json()) as { pods?: Pod[] };
        const podSize = Array.isArray(pods) ? new Set(pods.map((p) => p.id)).size : 0;
        setUniquePods((prev) => (prev === podSize ? prev : podSize));

        if (!dispatchesRes.ok) throw new Error(`HTTP ${dispatchesRes.status}`);
        const { submissions } = (await dispatchesRes.json()) as { submissions?: DispatchSubmission[] };
        setDispatches(Array.isArray(submissions) ? submissions : []);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { profiles } = (await res.json()) as { profiles?: Profile[] };
        const size = Array.isArray(profiles) ? new Set(profiles.map((p) => p.id)).size : 0;
        setUniqueProfiles((prev) => (prev === size ? prev : size));
      } catch (err) {
        // ignore abort errors; keep zero on other errors
        if ((err as any)?.name === "AbortError") return;
        setUniqueProfiles((prev) => (prev === 0 ? prev : 0));
      }
    };
    load();
    return () => {
      controller.abort();
    };
  }, []);

  const activeDispatches = React.useMemo(
    () => dispatches.filter((d) => !["archived", "completed", "cancelled", "expired"].includes(d.status)).length,
    [dispatches],
  );

  const [trainingStats, setTrainingStats] = React.useState<{ totalActive: number; completed: number; inProgress: number; scheduled: number; completionPct: number }>({ totalActive: 0, completed: 0, inProgress: 0, scheduled: 0, completionPct: 0 });

  React.useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/admin/academy/stats', { credentials: 'include', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { stats } = await res.json();
        if (stats) setTrainingStats(stats);
      } catch (e) {
        // ignore
      }
    })();
    return () => controller.abort();
  }, []);

  const trainingPct = trainingStats.completionPct;

  // Adapt dispatch submissions to WatchMap's WizardReport for the map view
  const { reports, idMap } = React.useMemo(() => toWatchReports(dispatches), [dispatches]);

  const handleView = (r: WizardReport) => {
    const id = idMap[r.id];
    if (id) router.push(`/dispatches/submission/${id}`);
  };

  const remaining = Math.max(0, trainingStats.totalActive - trainingStats.completed);
  const chartData = [
    { name: "Completed", value: trainingStats.completed },
    { name: "Remaining", value: remaining },
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
        <StatCard label="Pods" value={uniquePods} icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} />
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
            <NavTile href="/admin/advocacy-groups" icon={<Database className="h-5 w-5" />} label="Advocacy Network" description="Trusted orgs for report delivery" />
            <NavTile href="/admin/campaigns" icon={<CalendarDays className="h-5 w-5" />} label="Campaigns" description="Create Seasons for Frontiers" />
            <NavTile href="/admin/bug-reports" icon={<Bug className="h-5 w-5" />} label="Bug Reports" description="User-submitted platform issues" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <AdminNotificationsDataLayer />

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
                zoom={4}
                center={[39.8283, -99.5795]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>
              {trainingStats.completed} completed of {trainingStats.totalActive} active sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              id="training-progress"
              className="w-full h-[280px] aspect-auto"
              data={chartData}
              config={{
                // Use standard colors (hex/HSL/RGB)
                Completed: { label: "Completed", color: "#10b981" }, // emerald-500
                Remaining: { label: "Remaining", color: "#3b82f6" }, // blue-500
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
    </section>
  );
}

