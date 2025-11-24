"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
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
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerTrigger,
} from "@workspace/ui/components/drawer";

import { navConfig } from "@/nav.config";
import {
    DispatchStoreProvider,
    useDispatchStore,
} from "@/providers/DispatchStoreProvider";
import { PodStoreProvider, usePodStore } from "@/providers/PodStoreProvider";
import PodDataHydrator from "@/components/dataLayer/pods/PodDataHydrator";
import ActiveRosterHydrator from "@/components/dataLayer/pods/ActiveRosterHydrator";
import { useAuth } from "@/hooks/useAuth";
import { REGION_IDENTIFIER } from "@/app/brand_settings";
import type { DispatchSubmission } from "@workspace/store/types/global";
import type { DispatchShift } from "@workspace/store/useDispatchStore";

// UI Components
import { DashboardOverviewCards } from "@workspace/ui/components/dispatch/DashboardOverviewCards";
import { ResourceCoverageCard } from "@workspace/ui/components/dispatch/ResourceCoverageCard";
import { ActiveDispatchesPreview } from "@workspace/ui/components/dispatch/ActiveDispatchesPreview";
import { PodsPreview } from "@workspace/ui/components/dispatch/PodsPreview";
import { RegionTemplateInfo } from "@workspace/ui/components/how-to/RegionTemplateInfo";

type ViewMode = "info" | "dashboard";

type DispatchDashboardDataLayerProps = {
    initialSubmissions: DispatchSubmission[];
    initialShifts: DispatchShift[];
};

export default function DispatchDashboardDataLayer({
    initialSubmissions,
    initialShifts,
}: DispatchDashboardDataLayerProps) {
    const [view, setView] = useState<ViewMode>(
        REGION_IDENTIFIER === `region-${"template"}` ? "info" : "dashboard",
    );
    const showToggle = REGION_IDENTIFIER === `region-${"template"}`;
    const brandName = navConfig.brand?.name ?? "ART Region Template";
    const brandHeadline = brandName.replace(/^ART\s+/i, "");

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
                {/* Hydrate pods from live DB for the dashboard */}
                <PodDataHydrator />
                <ActiveRosterHydrator />

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

function QuickStartDrawerContent() {
    const Item = ({
        icon,
        title,
        children,
    }: {
        icon: React.ReactNode;
        title: string;
        children: React.ReactNode;
    }) => (
        <div className="flex gap-3">
            <div className="mt-0.5 text-muted-foreground">{icon}</div>
            <div>
                <h3 className="font-semibold leading-6">{title}</h3>
                <div className="text-sm text-muted-foreground mt-1">{children}</div>
            </div>
        </div>
    );

    return (
        <div className="flex h-full flex-col">
            <DrawerHeader>
                <DrawerTitle>Quick Start Understanding</DrawerTitle>
                <DrawerDescription>
                    Short explainers for the main sections of your region.
                </DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[50dvh] overflow-y-auto px-4 pb-4 space-y-5">
                <Item icon={<GraduationCap className="h-5 w-5" />} title="Academy">
                    The Academy is your training hub for learning how this platform and
                    your region operate. Courses are self‑paced and cover both
                    fundamentals and role‑specific practices so you can onboard quickly.
                    As you complete modules, you earn credentials that unlock permissions
                    and responsibilities in other areas of the app. Returning users can
                    use the Academy for refreshers or to track progress toward advanced
                    qualifications.
                </Item>

                <Item icon={<Shield className="h-5 w-5" />} title="Admin">
                    The Admin area provides region‑level oversight and configuration tools
                    for authorized administrators. Use it to review activity, access audit
                    trails, manage reports, and keep operations compliant with local
                    policies. From here you can tune integrations, branding, and feature
                    availability so the platform matches your needs. Access is restricted
                    to protect sensitive settings while preserving transparency for
                    coordinators.
                </Item>

                <Item icon={<Eye className="h-5 w-5" />} title="Watch">
                    Watch is a live map for situational awareness across your region.
                    Layers and filters help you focus on relevant reports, signals, and
                    activity as conditions change. It’s useful for real‑time monitoring,
                    early triage, and spotting patterns before they turn into dispatches.
                    Teams can use Watch during operations briefings to align on what’s
                    happening right now.
                </Item>

                <Item
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    title="Confirmed Watch"
                >
                    Confirmed Watch highlights reports that coordinators have reviewed and
                    verified for accuracy. This view reduces noise and uncertainty so
                    on‑the‑ground teams can act with confidence. It lives inside Watch as
                    a filter or dedicated layer rather than a separate tool. Use it when
                    you need a trusted baseline for decisions or public communication.
                </Item>

                <Item icon={<ClipboardList className="h-5 w-5" />} title="Dispatches">
                    Dispatches is the intake‑to‑action pipeline that moves a report from
                    first contact to resolution. Coordinators triage submissions, set
                    status, and record intended actions so everyone sees the current plan.
                    Roles and staffing needs are tracked here, and updates form the
                    running incident log for handoffs. Use Dispatches to keep decisions
                    visible, responsibilities clear, and progress easy to audit.
                </Item>

                <Item icon={<BookOpen className="h-5 w-5" />} title="How to Use">
                    The How‑to guide is a built‑in reference for new and experienced
                    volunteers. It contains standard operating procedures, role
                    definitions, and best practices for using the platform safely. Unlike
                    the Academy, which is for training, the How‑to guide is designed for
                    quick lookups during active operations. Keep it handy when you need to
                    verify a protocol or find a resource.
                </Item>
            </div>
        </div>
    );
}
