"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import DonutChart from "@workspace/ui/components/charts/DonutChart";
import StatCard from "@workspace/ui/components/stat-card";
import NavTile from "@workspace/ui/components/nav-tile";
import { percent } from "@workspace/ui/lib/utils";
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
} from "lucide-react";

import { TraingingSessionsDemoData } from "@/data/demoAcademy";
import type { WizardReport } from "@workspace/store/types/watch.ts";
import { useRouter } from "next/navigation";
import { useDispatchStore } from "@/providers/DispatchStoreProvider";
import { usePodStore } from "@/providers/PodStoreProvider";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useMemo } from "react";

// Map component (client-only)
const WatchMap = dynamic(
  () => import("@workspace/ui/components/client/watch/WatchMap"),
  { ssr: false },
);

export default function AdminPage() {
  const router = useRouter();
  const { providerId } = useAuth();
  const submissions = useDispatchStore((s) => s.submissions);
  const pods = usePodStore((s) => s.pods);
  const activeRoster = usePodStore((s) => s.activeRoster);

  const uniqueProfiles = React.useMemo(() => {
    const ids = new Set<string>();
    (activeRoster ?? []).forEach((r) => ids.add(r.profile.id));
    return ids.size;
  }, [activeRoster]);

  const activeDispatches = React.useMemo(() => {
    const list = submissions ?? [];
    return list.filter(
      (d) =>
        !["archived", "completed", "cancelled", "expired"].includes(
          d.status as string,
        ),
    ).length;
  }, [submissions]);

  const podsCount = pods?.length ?? 0;

  const trainingCounts = React.useMemo(() => {
    const all = TraingingSessionsDemoData.filter(
      (s) => s.status !== "archived",
    );
    const completed = all.filter((s) => s.status === "completed").length;
    const scheduled = all.filter((s) => s.status === "scheduled").length;
    const inProgress = all.filter((s) => s.status === "in_progress").length;
    return { all: all.length, completed, scheduled, inProgress };
  }, []);

  const trainingPct = percent(trainingCounts.completed, trainingCounts.all);

  // Adapt dispatch submissions to WatchMap's WizardReport for the map view
  const { reports, idMap } = React.useMemo(
    () => toWatchReports(submissions ?? []),
    [submissions],
  );

  const handleView = (r: WizardReport) => {
    const id = idMap[r.id];
    if (id) router.push(`/dispatches/submission/${id}`);
  };

  const chartData = [
    { name: "Completed", value: trainingCounts.completed },
    { name: "In Progress", value: trainingCounts.inProgress },
    { name: "Scheduled", value: trainingCounts.scheduled },
  ];

  // Simple admin actions (Supabase only) to validate new API routes
  const canMutate = providerId === "supabase";
  const firstSubmission = (submissions ?? [])[0];
  const firstPod = (pods ?? [])[0];
  const trustPair = useMemo(() => {
    const r = activeRoster ?? [];
    if (r.length < 2) return null;
    const subjectId = r[0]?.profile?.id;
    const signerId = r[1]?.profile?.id;
    if (!subjectId || !signerId) return null;
    return { subjectId, signerId };
  }, [activeRoster]);


  const toggleFlagged = async () => {
    if (!firstSubmission) return;
    const next = !firstSubmission.flagged;
    const res = await fetch(`/api/admin/dispatches/${firstSubmission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagged: next }),
    });
    if (!res.ok) {
      toast.error("Failed to toggle flagged");
      return;
    }
    toast.success(`Flagged set to ${next}`);
  };

  const renameFirstPod = async () => {
    if (!firstPod) return;
    const res = await fetch(`/api/admin/pods/${firstPod.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        area: firstPod.area || "Unassigned",
        name: firstPod.name + " •",
      }),
    });
    if (!res.ok) {
      toast.error("Failed to update pod");
      return;
    }
    toast.success("Pod updated");
  };

  // Trust signature demo actions (require at least 2 profiles in roster)
  const addTrust = async () => {
    if (!trustPair) return;
    const res = await fetch(`/api/admin/trust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: trustPair.subjectId,
        signerId: trustPair.signerId,
        status: "active",
      }),
    });
    if (!res.ok) return toast.error("Failed to add trust signature");
    toast.success("Trust signature added");
  };
  const deactivateTrust = async () => {
    if (!trustPair) return;
    const res = await fetch(
      `/api/admin/trust/${trustPair.subjectId}/${trustPair.signerId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "inactive" }),
      },
    );
    if (!res.ok) return toast.error("Failed to update trust signature");
    toast.success("Trust signature set inactive");
  };
  const deleteTrust = async () => {
    if (!trustPair) return;
    const res = await fetch(
      `/api/admin/trust/${trustPair.subjectId}/${trustPair.signerId}`,
      { method: "DELETE" },
    );
    if (!res.ok) return toast.error("Failed to delete trust signature");
    toast.success("Trust signature deleted");
  };

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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Profiles"
          value={uniqueProfiles}
          icon={<Users2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Active Dispatches"
          value={activeDispatches}
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Pods"
          value={podsCount}
          icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Training Completed"
          value={`${trainingPct}%`}
          icon={<FileChartLine className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

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
          </div>
        </CardContent>
      </Card>

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
              />
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>
              {trainingCounts.completed} completed of {trainingCounts.all}{" "}
              active sessions
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

            <div className="mt-4 text-sm text-muted-foreground">
              Percentage completed is across non-archived sessions.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions (demo UI) */}
      {canMutate && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>
              Minimal end-to-end checks for Supabase routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={toggleFlagged}
                disabled={!firstSubmission}
                variant="outline"
                size="sm"
              >
                Toggle flagged on most recent submission
              </Button>
              <Button
                onClick={renameFirstPod}
                disabled={!firstPod}
                variant="outline"
                size="sm"
              >
                Update first pod name/area
              </Button>
              <Button
                onClick={addTrust}
                disabled={!trustPair}
                variant="outline"
                size="sm"
              >
                Add trust (first 2 roster profiles)
              </Button>
              <Button
                onClick={deactivateTrust}
                disabled={!trustPair}
                variant="outline"
                size="sm"
              >
                Set trust inactive
              </Button>
              <Button
                onClick={deleteTrust}
                disabled={!trustPair}
                variant="destructive"
                size="sm"
              >
                Delete trust
              </Button>
            </div>
            {!firstSubmission && (
              <p className="mt-2 text-sm text-muted-foreground">
                No submissions found to toggle flagged.
              </p>
            )}
            {!firstPod && (
              <p className="text-sm text-muted-foreground">
                No pods found to update.
              </p>
            )}
            {!trustPair && (
              <p className="text-sm text-muted-foreground">
                Need at least 2 roster profiles to demo trust actions.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
