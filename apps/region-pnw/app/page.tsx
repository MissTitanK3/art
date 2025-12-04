"use client";

import { useState, useEffect } from "react";
import { navConfig } from "@/nav.config";
import {
  DispatchStoreProvider,
  useDispatchStore,
} from "@/providers/DispatchStoreProvider";
import { PodStoreProvider, usePodStore } from "@/providers/PodStoreProvider";
import { usePodData } from "@/hooks/usePodData";
import { useAuth } from "@/hooks/useAuth";
import { REGION_IDENTIFIER } from "@/app/brand_settings";
import type { DispatchSubmission } from "@workspace/store/types/global";
import type { DispatchShift } from "@workspace/store/useDispatchStore";
import { RegionHero } from "@workspace/ui/patterns/features/info/region-hero";
import {
  RegionViewMode,
  RegionViewToggle,
} from "@workspace/ui/patterns/features/info/region-view-toggle";
import { RegionDashboardGate } from "@workspace/ui/patterns/features/info/region-dashboard-gate";
import { RegionTemplateInfo } from "@workspace/ui/patterns/features/how-to/region-template-info";
import { useActiveRoster } from "@/hooks/useActiveRoster";
import { MyStatusCard } from "@workspace/ui/patterns/features/dashboard/my-status-card";
import { RegionReadinessCard } from "@workspace/ui/patterns/features/dashboard/region-readiness-card";
import { AcademyProgressCard } from "@workspace/ui/patterns/features/dashboard/academy-progress-card";
import { AssignedDispatchesCard } from "@workspace/ui/patterns/features/dashboard/assigned-dispatches-card";
import { WatchCard } from "@workspace/ui/patterns/features/dashboard/watch-card";
import { WarehouseCard } from "@workspace/ui/patterns/features/dashboard/warehouse-card";
import { NeedsCard } from "@workspace/ui/patterns/features/dashboard/needs-card";
import { AppGrid } from "@workspace/ui/patterns/features/dashboard/app-grid";
import { mapRowToSubmission } from "@workspace/ui/hooks/map-row-to-submission";
import { mapRowToShift } from "@workspace/ui/hooks/map-row-to-shift";
import { PublicImpactSummary } from "@workspace/ui/patterns/features/impact/public-impact-summary";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { QuickStartDrawerContent } from "@workspace/ui/patterns/features/info/quickstart-drawer-content";

type ViewMode = RegionViewMode;

export default function Page() {
  const [view, setView] = useState<ViewMode>(
    REGION_IDENTIFIER === `region-${"template"}` ? "info" : "dashboard"
  );
  const showToggle = REGION_IDENTIFIER === `region-${"template"}`;
  const brandName = navConfig.brand?.name ?? "ART Region Template";
  const brandHeadline = brandName.replace(/^ART\s+/i, "");

  const [initialSubmissions, setInitialSubmissions] = useState<
    DispatchSubmission[]
  >([]);
  const [initialShifts, setInitialShifts] = useState<DispatchShift[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [submissionsRes, shiftsRes] = await Promise.all([
          fetch("/api/dispatches"),
          fetch("/api/dispatch/shifts"),
        ]);

        const [submissionsJson, shiftsJson] = await Promise.all([
          submissionsRes.ok ? submissionsRes.json() : Promise.resolve([]),
          shiftsRes.ok ? shiftsRes.json() : Promise.resolve([]),
        ]);

        if (!cancelled && Array.isArray(submissionsJson)) {
          setInitialSubmissions(submissionsJson.map(mapRowToSubmission));
        }
        if (!cancelled && Array.isArray(shiftsJson)) {
          setInitialShifts(shiftsJson.map(mapRowToShift));
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("[pnw] failed to load dashboard data", e);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-svh w-full flex-col items-center gap-6 py-12">
      <RegionHero
        brandHeadline={brandHeadline}
        quickStartContent={<QuickStartDrawerContent />}
      />

      <section className="w-full px-4">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl border bg-background/80 p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Regional Impact
            </p>
            <h2 className="text-2xl font-semibold">
              What dispatchers have delivered together
            </h2>
            <p className="text-sm text-muted-foreground">
              This snapshot rounds and thresholds sensitive data before it
              leaves our workspace so we can celebrate wins without leaking
              details.
            </p>
          </div>
          <PublicImpactSummary regionId={REGION_IDENTIFIER} />
          <p className="text-xs text-muted-foreground">
            Metrics refresh every few minutes. Verified dispatches only; records
            under review or below privacy thresholds are masked.
          </p>
        </div>
      </section>

      {showToggle ? (
        <div className="flex justify-center">
          <RegionViewToggle current={view} onChange={setView} />
        </div>
      ) : null}

      <main className="w-full">
        {view === "info" ? (
          <RegionTemplateInfo />
        ) : (
          <DemoDashboard
            initialSubmissions={initialSubmissions}
            initialShifts={initialShifts}
          />
        )}
      </main>
    </div>
  );
}

function DemoDashboard({
  initialSubmissions,
  initialShifts,
}: {
  initialSubmissions: DispatchSubmission[];
  initialShifts: DispatchShift[];
}) {
  const { session, status } = useAuth();
  const isAuthenticated = status === "authenticated" && !!session?.user?.id;

  return (
    <RegionDashboardGate isAuthenticated={isAuthenticated}>
      <DispatchStoreProvider
        persist={false}
        initialSubmissions={initialSubmissions}
        initialShifts={initialShifts}
      >
        <PodStoreProvider persist={false}>
          <DashboardContent />
        </PodStoreProvider>
      </DispatchStoreProvider>
    </RegionDashboardGate>
  );
}

function DashboardContent() {
  const submissions = useDispatchStore((state) => state.submissions);
  const replaceSubmissions = useDispatchStore(
    (state) => state.replaceSubmissions
  );
  const pods = usePodStore((state) => state.pods);
  const roster = usePodStore((state) => state.activeRoster);
  const shifts = useDispatchStore((state) => state.shifts);
  const replaceShifts = useDispatchStore((state) => state.replaceShifts);
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const profileId = useProfileStore((state) => state.profile?.id ?? null);
  const isAuthenticated = !!userId;

  // Hydrate data
  usePodData();
  useActiveRoster();

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function refresh() {
      try {
        const [dispatchRes, shiftRes] = await Promise.all([
          fetch("/api/dispatches", { credentials: "include" }),
          fetch("/api/dispatch/shifts", { credentials: "include" }),
        ]);

        if (!cancelled) {
          if (dispatchRes.ok) {
            const json = await dispatchRes.json();
            if (Array.isArray(json)) {
              replaceSubmissions(json.map(mapRowToSubmission));
            }
          }
          if (shiftRes.ok) {
            const json = await shiftRes.json();
            if (Array.isArray(json)) {
              replaceShifts(json.map(mapRowToShift));
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("[Dashboard] failed to refresh dispatch data", e);
        }
      }
    }

    refresh();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, replaceSubmissions, replaceShifts]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      {/* Top Section: Status & Readiness */}
      <div className="grid gap-6">
        <MyStatusCard />
      </div>
      {/* Middle Section: Operational Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Operational Insights
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <WatchCard />
          <WarehouseCard />
          <NeedsCard />
          <RegionReadinessCard />
          <AcademyProgressCard />
          <AssignedDispatchesCard
            submissions={submissions}
            userId={userId}
            profileId={profileId}
          />
        </div>
      </div>
      {/* <div className="grid gap-6">
        <ImpactSummaryCard />
      </div> */}
      {/* Bottom Section: Navigation */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Explore</h2>
        <AppGrid />
      </div>
    </div>
  );
}
