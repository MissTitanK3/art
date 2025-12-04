"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import DonutChart from "@workspace/ui/patterns/features/charts/donut-chart";
import StatCard from "@workspace/ui/patterns/common/stat-card";
import NavTile from "@workspace/ui/patterns/common/nav-tile";
import { toWatchReports } from "@workspace/ui/lib/adapters/dispatch-to-watch";
import {
  FileChartLine,
  MapPin,
  Settings,
  ShieldCheck,
  Users2,
  Users,
  Package,
  GraduationCap,
  Handshake,
  Database,
  Bug,
  CalendarDays,
} from "lucide-react";
import { toast } from "@workspace/ui/primitives/sonner";
import AdminNotificationForm, {
  type SendArgs,
} from "@workspace/ui/patterns/features/notifications/admin-notification-form";
import { AdminNotificationTemplatePanel } from "@workspace/ui/patterns/features/notifications/admin-notification-template-panel";
import { ADMIN_NOTIFICATION_TEMPLATES } from "@workspace/store/admin/notifications/templates";
import type { WizardReport } from "@workspace/store/types/watch.ts";
import { useRouter } from "next/navigation";
import { DispatchSubmission } from "@workspace/store/types/global";
import { Pod } from "@workspace/store/types/pod";
import type { Profile } from "@workspace/store/types/global.ts";
import { useProfileStore } from "@workspace/store/useProfileStore";
// Map component (client-only)
const WatchMap = dynamic(
  () => import("@workspace/ui/patterns/features/watch/watch-map"),
  { ssr: false },
);
export default function AdminPage() {
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const isNationalAdmin = profile?.access_role === "national_admin";
  // Aggregated metrics from demo data
  const [uniqueProfiles, setUniqueProfiles] = useState<number>(0);
  const [uniquePods, setUniquePods] = useState<number>(0);
  const [dispatches, setDispatches] = useState<DispatchSubmission[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingPods, setLoadingPods] = useState(true);
  const [loadingDispatches, setLoadingDispatches] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch("/api/admin/profiles", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { profiles } = (await res.json()) as {
          profiles?: Profile[];
        };
        const size = Array.isArray(profiles)
          ? new Set(profiles.map((p) => p.id)).size
          : 0;
        setUniqueProfiles(size);
      } catch {
        setUniqueProfiles(0);
      } finally {
        setLoadingProfiles(false);
      }
      try {
        const podsRes = await fetch("/api/admin/pods", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!podsRes.ok) throw new Error(`HTTP ${podsRes.status}`);
        const { pods } = (await podsRes.json()) as {
          pods?: Pod[];
        };
        const podSize = Array.isArray(pods)
          ? new Set(pods.map((p) => p.id)).size
          : 0;
        setUniquePods(podSize);
      } catch {
        setUniquePods(0);
      } finally {
        setLoadingPods(false);
      }
      try {
        const dispatchesRes = await fetch("/api/admin/dispatches", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!dispatchesRes.ok) throw new Error(`HTTP ${dispatchesRes.status}`);
        const { submissions } = (await dispatchesRes.json()) as {
          submissions?: DispatchSubmission[];
        };
        setDispatches(Array.isArray(submissions) ? submissions : []);
      } catch {
        setDispatches([]);
      } finally {
        setLoadingDispatches(false);
      }
    };
    load();
    return () => {
      controller.abort();
    };
  }, []);
  const activeDispatches = useMemo(
    () =>
      dispatches.filter(
        (d) =>
          !["archived", "completed", "cancelled", "expired"].includes(d.status),
      ).length,
    [dispatches],
  );
  const [trainingStats, setTrainingStats] = useState<{
    totalActive: number;
    completed: number;
    inProgress: number;
    scheduled: number;
    completionPct: number;
  }>({
    totalActive: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    completionPct: 0,
  });
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/admin/academy/stats", {
          credentials: "include",
          signal: controller.signal,
        });
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
  const [iceoutSyncing, setIceoutSyncing] = useState(false);
  const [iceoutLastSyncedAt, setIceoutLastSyncedAt] = useState<string | null>(
    null,
  );
  const [iceoutStatusMessage, setIceoutStatusMessage] = useState<string | null>(
    null,
  );
  const fetchIceoutStatus = useCallback(async () => {
    if (!isNationalAdmin) return;
    try {
      const res = await fetch("/api/admin/iceout", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setIceoutLastSyncedAt(data?.lastSyncedAt ?? null);
      setIceoutStatusMessage(data?.message ?? null);
    } catch (error) {
      console.warn("[AdminPage] failed to load Iceout status", error);
    }
  }, [isNationalAdmin]);
  useEffect(() => {
    if (!isNationalAdmin) return;
    fetchIceoutStatus();
  }, [fetchIceoutStatus, isNationalAdmin]);
  const syncIceoutReports = useCallback(async () => {
    if (!isNationalAdmin) return;
    setIceoutSyncing(true);
    try {
      const res = await fetch("/api/admin/iceout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to sync Iceout reports");
      } else {
        setIceoutLastSyncedAt(data?.lastSyncedAt ?? new Date().toISOString());
        setIceoutStatusMessage(
          data?.message ??
            `Imported ${data?.inserted ?? 0} new reports (checked ${data?.checked ?? 0})`,
        );
        toast.success(
          data?.message ?? `Imported ${data?.inserted ?? 0} Iceout reports`,
        );
      }
    } catch (error) {
      console.error("[AdminPage] Iceout sync failed", error);
      toast.error("Failed to sync Iceout reports");
    } finally {
      setIceoutSyncing(false);
    }
  }, [isNationalAdmin]);
  // Adapt dispatch submissions to WatchMap's WizardReport for the map view
  const { reports, idMap } = useMemo(
    () => toWatchReports(dispatches),
    [dispatches],
  );
  const handleView = (r: WizardReport) => {
    const id = idMap[r.id];
    if (id) router.push(`/dispatches/submission/${id}`);
  };
  const remaining = Math.max(
    0,
    trainingStats.totalActive - trainingStats.completed,
  );
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
            <a
              href="/admin/settings"
              className="inline-flex items-center gap-2"
            >
              <Settings className="h-4 w-4" /> Settings
            </a>
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Profiles"
          value={uniqueProfiles}
          loading={loadingProfiles}
          icon={<Users2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Active Dispatches"
          value={activeDispatches}
          loading={loadingDispatches}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Pods"
          value={uniquePods}
          loading={loadingPods}
          icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {isNationalAdmin && (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Iceout Reports
              </CardTitle>
              <CardDescription>
                Import approved third-party reports into the regional database.
              </CardDescription>
              <p className="mt-2 text-sm text-muted-foreground">
                Last synced:{" "}
                {iceoutLastSyncedAt
                  ? new Date(iceoutLastSyncedAt).toLocaleString()
                  : "Never"}
              </p>
              {iceoutStatusMessage && (
                <p className="text-xs text-muted-foreground">
                  {iceoutStatusMessage}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchIceoutStatus}
                disabled={iceoutSyncing}
              >
                Refresh status
              </Button>
              <Button
                size="sm"
                onClick={syncIceoutReports}
                disabled={iceoutSyncing}
              >
                {iceoutSyncing ? "Syncing..." : "Sync now"}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Quick navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Sections</CardTitle>
          <CardDescription>
            Jump into a specific management area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <NavTile
              href="/admin/profiles"
              icon={<Users className="h-5 w-5" />}
              label="Profiles"
              description="Manage users, roles, verification"
            />
            <NavTile
              href="/admin/pods"
              icon={<Package className="h-5 w-5" />}
              label="Pods"
              description="Organize pods and rosters"
            />
            <NavTile
              href="/admin/dispatch"
              icon={<MapPin className="h-5 w-5" />}
              label="Dispatch"
              description="Review and audit dispatches"
            />
            <NavTile
              href="/admin/training"
              icon={<GraduationCap className="h-5 w-5" />}
              label="Training"
              description="Classes, sessions, participants"
            />
            <NavTile
              href="/admin/trust"
              icon={<Handshake className="h-5 w-5" />}
              label="Trust"
              description="Manage trust signatures"
            />
            <NavTile
              href="/admin/advocacy-groups"
              icon={<Database className="h-5 w-5" />}
              label="Advocacy Network"
              description="Trusted orgs for report delivery"
            />
            <NavTile
              href="/admin/campaigns"
              icon={<CalendarDays className="h-5 w-5" />}
              label="Campaigns"
              description="Create Seasons for Frontiers"
            />
            <NavTile
              href="/admin/bug-reports"
              icon={<Bug className="h-5 w-5" />}
              label="Bug Reports"
              description="User-submitted platform issues"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <AdminNotifications />

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Active Dispatches (Map)</CardTitle>
            <CardDescription>
              Spatial view of recent dispatch activity
            </CardDescription>
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
              {trainingStats.completed} completed of {trainingStats.totalActive}{" "}
              active sessions
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

            <div className="mt-4 text-sm text-muted-foreground">
              Percentage completed is across non-archived sessions.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
async function sendNotification(args: SendArgs) {
  const res = await fetch("/api/admin/notifications/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{
    id?: string;
    recipientsCount?: number;
  }>;
}
function AdminNotifications() {
  const handleCustom = useCallback(async (args: SendArgs) => {
    try {
      const { id, recipientsCount } = await sendNotification(args);
      const suffix =
        typeof recipientsCount === "number"
          ? ` • ${recipientsCount} recipient${recipientsCount === 1 ? "" : "s"}`
          : "";
      toast.success("Notification sent", {
        description: `${id ? `id: ${id}` : ""}${suffix}`.trim(),
      });
      return true;
    } catch (e: any) {
      toast.error("Failed to send notification", {
        description: e?.message ?? String(e),
      });
      return false;
    }
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Send standard or custom notifications to your region
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AdminNotificationTemplatePanel
          templateOptions={ADMIN_NOTIFICATION_TEMPLATES}
          onSend={handleCustom}
        />
        <hr className="my-2" />
        <AdminNotificationForm onSend={handleCustom} />
      </CardContent>
    </Card>
  );
}
