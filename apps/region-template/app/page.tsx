"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/primitives/alert";
import { Button } from "@workspace/ui/primitives/button";
import {
  LogIn,
  GraduationCap,
  Shield,
  BookOpen,
  Eye,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@workspace/ui/primitives/drawer";

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
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";

// UI Components
import { DashboardOverviewCards } from "@workspace/ui/patterns/features/dispatch/dashboard-overview-cards";
import { ResourceCoverageCard } from "@workspace/ui/patterns/features/dispatch/resource-coverage-card";
import { ActiveDispatchesPreview } from "@workspace/ui/patterns/features/dispatch/active-dispatches-preview";
import { PodsPreview } from "@workspace/ui/patterns/features/dispatch/pods-preview";
import { RegionTemplateInfo } from "@workspace/ui/patterns/features/how-to/region-template-info";
import { useActiveRoster } from "@/hooks/useActiveRoster";
import QuickStartDrawerContent from "@workspace/ui/patterns/features/info/quickstart-drawer-content";
import { mapRowToSubmission } from "@workspace/ui/hooks/map-row-to-submission";
import { mapRowToShift } from "@workspace/ui/hooks/map-row-to-shift";

type ViewMode = "info" | "dashboard";

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
    const client = getSupabaseBrowserClient();
    async function load() {
      const [s, sh] = await Promise.all([
        client
          .from("dispatch_submissions")
          .select("*")
          .order("timestamp", { ascending: false }),
        client
          .from("dispatch_shifts")
          .select("*")
          .order("starts_at", { ascending: true }),
      ]);
      if (s.data) setInitialSubmissions(s.data.map(mapRowToSubmission));
      if (sh.data) setInitialShifts(sh.data.map(mapRowToShift));
    }
    load();
  }, []);

  return (
    <div className="flex min-h-svh w-full flex-col items-center gap-6 px-4 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">{brandHeadline}</h1>
        <p className="mt-2 max-w-2xl text-balance text-muted-foreground">
          Welcome to your region’s centralized platform for collaboration and
          response coordination.
        </p>
        <p className="mt-2 max-w-2xl text-balance text-muted-foreground">
          Use the tools below to manage your region’s operations and support
          your community effectively.
        </p>
        <div className="mt-4 flex justify-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Quick Start Understanding</Button>
            </DrawerTrigger>
            <DrawerContent className="bg-card text-card-foreground max-w-xl m-auto">
              <QuickStartDrawerContent />
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      {showToggle ? (
        <div className="flex justify-center">
          <ViewToggle current={view} onChange={setView} />
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

function ViewToggle({
  current,
  onChange,
}: {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border bg-muted p-1">
      <ToggleButton
        label="Template overview"
        active={current === "info"}
        onClick={() => onChange("info")}
      />
      <ToggleButton
        label="Demo dashboard"
        active={current === "dashboard"}
        onClick={() => onChange("dashboard")}
      />
    </div>
  );
}

function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "ghost"}
      className={cn("rounded-full px-4", active ? "shadow-sm" : "")}
      onClick={onClick}
    >
      {label}
    </Button>
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

  if (!isAuthenticated) {
    return (
      <div className="mx-auto mt-8 max-w-md">
        <Alert variant="default">
          <LogIn className="h-5 w-5" />
          <AlertTitle>Sign-in required</AlertTitle>
          <AlertDescription>
            You need to sign in to access your region dashboard.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild>
              <Link href="/sign-in">Go to Sign-In</Link>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // normal dashboard when authenticated
  return (
    <DispatchStoreProvider
      persist={false}
      initialSubmissions={initialSubmissions}
      initialShifts={initialShifts}
    >
      <PodStoreProvider persist={false}>
        <DashboardContent />
      </PodStoreProvider>
    </DispatchStoreProvider>
  );
}

function DashboardContent() {
  const submissions = useDispatchStore((state) => state.submissions);
  const pods = usePodStore((state) => state.pods);
  const roster = usePodStore((state) => state.activeRoster);
  const shifts = useDispatchStore((state) => state.shifts);

  // Hydrate data
  usePodData();
  useActiveRoster();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <DashboardOverviewCards
        submissions={submissions}
        pods={pods}
        roster={roster}
      />
      <ResourceCoverageCard pods={pods} shifts={shifts} />
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <ActiveDispatchesPreview submissions={submissions} />
        <PodsPreview pods={pods} />
      </div>
    </div>
  );
}
