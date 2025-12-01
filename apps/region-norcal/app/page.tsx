"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Eye } from "lucide-react";

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
import { RegionHero } from "@workspace/ui/components/info/region-hero";
import {
  RegionViewMode,
  RegionViewToggle,
} from "@workspace/ui/components/info/region-view-toggle";
import { RegionDashboardGate } from "@workspace/ui/components/info/region-dashboard-gate";
import { RegionTemplateInfo } from "@workspace/ui/components/how-to/RegionTemplateInfo";
import { useActiveRoster } from "@/hooks/useActiveRoster";
import { MyStatusCard } from "@workspace/ui/components/dashboard/MyStatusCard";
import { RegionReadinessCard } from "@workspace/ui/components/dashboard/RegionReadinessCard";
import { AcademyProgressCard } from "@workspace/ui/components/dashboard/AcademyProgressCard";
import { ImpactSummaryCard } from "@workspace/ui/components/dashboard/ImpactSummaryCard";
import { AssignedDispatchesCard } from "@workspace/ui/components/dashboard/AssignedDispatchesCard";
import { RecommendedDispatchesCard } from "@workspace/ui/components/dashboard/RecommendedDispatchesCard";
import { WatchCard } from "@workspace/ui/components/dashboard/WatchCard";
import { WarehouseCard } from "@workspace/ui/components/dashboard/WarehouseCard";
import { NeedsCard } from "@workspace/ui/components/dashboard/NeedsCard";
import { AppGrid } from "@workspace/ui/components/dashboard/AppGrid";
import QuickActionsCard from "@workspace/ui/components/QuickActionsCard";
import NavTile from "@workspace/ui/components/nav-tile";
import QuickStartDrawerContent from "@workspace/ui/components/info/quickstart-drawer-content";
import { mapRowToSubmission } from "@workspace/ui/hooks/map-row-to-submission";
import { mapRowToShift } from "@workspace/ui/hooks/map-row-to-shift";

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
  const pods = usePodStore((state) => state.pods);
  const roster = usePodStore((state) => state.activeRoster);
  const shifts = useDispatchStore((state) => state.shifts);
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  // Hydrate data
  usePodData();
  useActiveRoster();

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
          <AssignedDispatchesCard submissions={submissions} userId={userId} />
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
