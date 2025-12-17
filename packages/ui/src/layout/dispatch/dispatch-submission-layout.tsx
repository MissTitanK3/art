"use client";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/primitives/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/primitives/collapsible";
import { Badge } from "@workspace/ui/primitives/badge";
import { SituationalAwarenessCard } from "@workspace/ui/patterns/features/dispatch/situational-awareness-card";
import DispatchStatusUpdater from "@workspace/ui/patterns/features/status/dispatch-status-updater";
import DispatchIntendedActionsUpdater from "@workspace/ui/patterns/features/actions/dispatch-intended-actions-updater";
import DispatchSignalLinkUpdater from "@workspace/ui/patterns/features/external-link/dispatch-signal-link-updater";
import DispatchPublicSignalLinkUpdater from "@workspace/ui/patterns/features/external-link/dispatch-public-signal-link-updater";
import DispatchNotesUpdater from "@workspace/ui/patterns/features/notes/dispatch-notes-updater";
import DispatchLocationUpdater from "@workspace/ui/patterns/features/location/dispatch-location-updater";
import DispatchLocationPinSelector from "@workspace/ui/patterns/features/location/dispatch-location-pin-selector";
import DispatchDateOfEventUpdater from "@workspace/ui/patterns/features/event/dispatch-date-of-event-updater";
import DispatchRolesManager from "@workspace/ui/patterns/features/roles/dispatch-roles-manager";
import DispatchUpdates from "@workspace/ui/patterns/features/updates/dispatch-updates";
import LogisticsPanel from "@workspace/ui/patterns/features/logistics/logistics-panel";
import PublicEngagementPanel from "@workspace/ui/patterns/features/engagement/public-engagement-panel";
import { VolunteerAttributionPanel } from "@workspace/ui/patterns/features/impact/volunteer-attribution-panel";
import { ImpactMetricsPanel } from "@workspace/ui/patterns/features/impact/impact-metrics-panel";
import { Button } from "@workspace/ui/primitives/button";
import AfterActionReportGuide from "@workspace/ui/patterns/features/dispatch/after-action-report-guide";
import { MemberPermissionsManager } from "@workspace/ui/patterns/features/permissions/member-permissions-manager";
import { Share2, Flag, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { DispatchSubmission, DispatchPermissionLayer } from "@workspace/store/types/global.ts";
import type { DispatchUpdate } from "@workspace/store/types/dispatch";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
import type { AccessRole } from "@workspace/store/types/roles.ts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/primitives/alert";
import { bucketFor, bucketEmoji } from "./dispatch-buckets";
import { humanize } from "@workspace/ui/lib/utils";
import { RISK_EXPLANATIONS, VISIBILITY_EXPLANATIONS } from "@workspace/ui/lib/constants/dispatch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/primitives/sheet";
import { Textarea } from "@workspace/ui/primitives/textarea";

export type DispatchSubmissionLayoutProps = {
  submission: DispatchSubmission;
  defaultTab?:
  | "overview"
  | "planning"
  | "roles"
  | "updates"
  | "public_engagement"
  | "comms";
  loadingMessage?: React.ReactNode;
  onUpdateSubmission: (patch: Partial<DispatchSubmission>) => void;
  onAddUpdate: (update: Omit<DispatchUpdate, "id" | "createdAt">) => void;
  onEditUpdate: (updateId: string, text: string) => void;
  onRemoveUpdate: (updateId: string) => void;
  roster?: RosterEntry[];
  commsTabContent?: React.ReactNode;
  commsTabLabel?: string;
  viewerRole?: AccessRole | null;
  viewerUserId?: string | null;
  viewerProfileId?: string | null;
};

export function DispatchSubmissionLayout({
  submission,
  defaultTab = "overview",
  loadingMessage,
  onUpdateSubmission,
  onAddUpdate,
  onEditUpdate,
  onRemoveUpdate,
  roster = [],
  commsTabContent,
  commsTabLabel = "Comms",
  viewerRole = null,
  viewerUserId = null,
  viewerProfileId = null,
}: DispatchSubmissionLayoutProps) {
  const locationLabel = submission.location_label ?? "Unknown Location";
  const timestamp = new Date(submission.timestamp).toLocaleString();
  const eventDate = submission.date_of_event
    ? new Date(submission.date_of_event).toLocaleString()
    : undefined;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set<string>(["location", "intended-action", "notes"]),
  );
  const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState(submission.summary ?? "");

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const urgency = bucketFor(submission);
  const urgencyIcon = bucketEmoji(urgency);
  const riskLevel = submission.risk_level ?? "unknown";
  const riskColor =
    RISK_EXPLANATIONS[riskLevel as keyof typeof RISK_EXPLANATIONS]?.color ?? "";
  const visibilityScope = (
    submission.visibility_scope ?? "org_and_region_masked"
  ) as keyof typeof VISIBILITY_EXPLANATIONS;
  const visibilityAudience =
    VISIBILITY_EXPLANATIONS[visibilityScope]?.whoCanSee ?? "";
  const submittedBy = submission.submitted_by?.toLowerCase?.();
  const viewerUser = viewerUserId?.toLowerCase?.();
  const viewerProfile = viewerProfileId?.toLowerCase?.();
  const isCreator = Boolean(
    (submittedBy && viewerUser && submittedBy === viewerUser) ||
    (submittedBy && viewerProfile && submittedBy === viewerProfile),
  );

  const totalRoster = roster?.length ?? 0;
  const activeRoster = (roster ?? []).filter(
    (r) => (r.status ?? "") === "active",
  ).length;

  const resolveVisibility = () => {
    if (isCreator) {
      return {
        showActionability: true,
        showCoordination: true,
        showSensitive: true,
        showLifecycle: true,
        showOutcomes: true,
      };
    }

    // Check for per-dispatch member permission overrides
    const memberPermissions = submission.member_permissions ?? {};
    const viewerPermissions = viewerProfileId ? memberPermissions[viewerProfileId] : undefined;

    if (viewerPermissions && viewerPermissions.length > 0) {
      // Member has custom permissions for this dispatch
      return {
        showActionability: viewerPermissions.includes('planning' as DispatchPermissionLayer),
        showCoordination: viewerPermissions.includes('coordination' as DispatchPermissionLayer),
        showSensitive: viewerPermissions.includes('coordination' as DispatchPermissionLayer),
        showLifecycle: viewerPermissions.includes('coordination' as DispatchPermissionLayer),
        showOutcomes: viewerPermissions.includes('outcomes' as DispatchPermissionLayer),
      };
    }

    if (!viewerRole) {
      return {
        showActionability: true,
        showCoordination: true,
        showSensitive: true,
        showLifecycle: true,
        showOutcomes: true,
      };
    }

    const privilegedRoles: AccessRole[] = [
      "dispatcher_basic",
      "dispatcher_verified",
      "dispatcher_admin",
      "pod_leader",
      "admin",
      "regional_admin",
      "national_admin",
    ];
    const coordinationRoles: AccessRole[] = privilegedRoles;
    const sensitiveRoles: AccessRole[] = [
      "dispatcher_verified",
      "dispatcher_admin",
      "admin",
      "regional_admin",
      "national_admin",
    ];
    const lifecycleRoles: AccessRole[] = sensitiveRoles;

    // team_member can view basic dispatch details but not manage
    const canViewBasicRoles: AccessRole[] = [
      "team_member",
      ...privilegedRoles,
    ];

    const showOutcomesStatuses: string[] = [
      "verified_complete",
      "debriefing",
      "completed",
      "archived",
      "cancelled",
      "expired",
    ];

    // All authenticated team members can see at least basic info (planning and coordination tabs not visible to basic members)
    // This allows team members to see their dispatch assignments
    return {
      showActionability: privilegedRoles.includes(viewerRole),
      showCoordination: privilegedRoles.includes(viewerRole),
      showSensitive: sensitiveRoles.includes(viewerRole),
      showLifecycle: lifecycleRoles.includes(viewerRole),
      showOutcomes:
        showOutcomesStatuses.includes(submission.status) ||
        privilegedRoles.includes(viewerRole),
    };
  };

  const visibility = resolveVisibility();
  const canManageVisibility =
    isCreator ||
    (viewerRole
      ? [
        "dispatcher_verified",
        "dispatcher_admin",
        "admin",
        "regional_admin",
        "national_admin",
      ].includes(viewerRole)
      : false);
  const canEditSummary = canManageVisibility;

  const openSummarySheet = () => {
    setSummaryDraft(submission.summary ?? "");
    setIsSummarySheetOpen(true);
  };

  const handleSummarySheetChange = (open: boolean) => {
    setIsSummarySheetOpen(open);
    if (open) {
      setSummaryDraft(submission.summary ?? "");
    } else {
      setSummaryDraft(submission.summary ?? "");
    }
  };

  const handleSummarySave = () => {
    onUpdateSubmission({ summary: summaryDraft.trim() });
    setIsSummarySheetOpen(false);
  };

  const handleSummaryCancel = () => {
    setSummaryDraft(submission.summary ?? "");
    setIsSummarySheetOpen(false);
  };

  const audienceLabel = (
    layer: "awareness" | "planning" | "coordination" | "outcomes",
  ) => {
    switch (layer) {
      case "awareness":
        return visibilityAudience || "Your org and region coordinators";
      case "planning":
        return "Creator + coordinators (dispatcher/pod leader/admin)";
      case "coordination":
        return "Creator + coordinators (roles tab)";
      case "outcomes":
        return "Creator + coordinators after completion";
      default:
        return "";
    }
  };

  const handleShare = () => {
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      toast.error("Clipboard access unavailable");
      return;
    }
    const url = new URL(window.location.href);
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        toast.success("Dispatch link copied to clipboard ✅");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };

  const overviewSections = [
    {
      id: "location",
      title: "Location & Coverage",
      description: "Update dispatch location, map pin, and schedule details.",
      visibilityHint: audienceLabel("awareness"),
      content: (
        <div className="space-y-4">
          <DispatchLocationUpdater
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DispatchDateOfEventUpdater
              submission={submission}
              onUpdate={onUpdateSubmission}
            />
            <DispatchLocationPinSelector
              submission={submission}
              onUpdate={onUpdateSubmission}
            />
          </div>
        </div>
      ),
    },
    {
      id: "notes",
      title: "Notes & Context",
      description: "Keep field updates and sensitive info in one place.",
      visibilityHint: audienceLabel("coordination"),
      content: (
        <div className="space-y-3">
          {canEditSummary ? (
            <div className="flex w-full">
              <Button size="sm" className="w-full" variant="outline" onClick={openSummarySheet}>
                Edit Public Summary
              </Button>
            </div>
          ) : null}
          <DispatchNotesUpdater
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
        </div>
      ),
    },
    {
      id: "signal-link",
      title: "Signal Links",
      description:
        "Set the Signal channels: public link invites future responders & private link is for the on-the-ground team.",
      visibilityHint: audienceLabel("coordination"),
      content: (
        <div className="space-y-4">
          <DispatchSignalLinkUpdater
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
          <DispatchPublicSignalLinkUpdater
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
        </div>
      ),
    },
    {
      id: "volunteer-impact",
      title: "Volunteer Attribution",
      description: "Track hours, unlock Undo, and keep daily lifts realistic.",
      visibilityHint: audienceLabel("coordination"),
      content: (
        <VolunteerAttributionPanel dispatchId={submission.id} roster={roster} />
      ),
    },
    {
      id: "impact-metrics",
      title: "Impact Metrics",
      description: "Log people served, resources moved, and risk level.",
      visibilityHint: audienceLabel("outcomes"),
      content: (
        <ImpactMetricsPanel
          dispatchId={submission.id}
          status={submission.status}
          initialMetrics={{
            people_served: submission.people_served ?? 0,
            resources_distributed: submission.resources_distributed ?? 0,
            risk_level: submission.risk_level ?? "unknown",
            updated_at: submission.updated_at,
            updated_by: submission.updated_by ?? null,
          }}
          onChange={(metrics) =>
            onUpdateSubmission({
              risk_level: metrics.risk_level,
              people_served: metrics.people_served,
              resources_distributed: metrics.resources_distributed,
              updated_at: metrics.updated_at ?? submission.updated_at,
              updated_by: metrics.updated_by ?? submission.updated_by,
            })
          }
        />
      ),
    },
  ];

  const planningSections = [
    {
      id: "intended-action",
      title: "Intended Action",
      description:
        "Clarify goals, note changes, and coordinate next steps before mobilizing.",
      visibilityHint: audienceLabel("planning"),
      content: (
        <DispatchIntendedActionsUpdater
          submission={submission}
          onUpdate={onUpdateSubmission}
        />
      ),
    },
    {
      id: "updates",
      title: "Updates",
      description: "Running notes, incident log, and updates.",
      visibilityHint: audienceLabel("planning"),
      content: (
        <DispatchUpdates
          updates={submission.updates}
          onAddUpdate={onAddUpdate}
          onEditUpdate={onEditUpdate}
          onRemoveUpdate={onRemoveUpdate}
          afterComposer={<AfterActionReportGuide onAddUpdate={onAddUpdate} />}
        />
      ),
    },
    {
      id: "logistics",
      title: "Logistics",
      description: "Manage transport, supplies, and other resources.",
      visibilityHint: audienceLabel("planning"),
      content: (
        <LogisticsPanel submission={submission} onUpdate={onUpdateSubmission} />
      ),
    },
  ];

  const visibleOverviewSections = overviewSections.filter((section) => {
    if (section.id === "impact-metrics" && !visibility.showOutcomes) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <Sheet open={isSummarySheetOpen} onOpenChange={handleSummarySheetChange}>
        <SheetContent side="right" className="p-0 bg-card text-card-foreground max-w-2xl z-[1200]">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Edit Public Summary</SheetTitle>
            <SheetDescription>
              This summary is used in Public Engagement messaging and materials.
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-3 px-6 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Public Summary</p>
                <p className="text-xs text-muted-foreground">
                  A concise, public-facing description used for posts, images, and flyers.
                </p>
              </div>
              <Textarea
                value={summaryDraft}
                onChange={(e) => setSummaryDraft(e.target.value)}
                className="min-h-[160px]"
                placeholder="Summarize what’s happening for the public (what, where, urgency)"
              />
            </div>
            <SheetFooter className="border-t px-6 py-4">
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={handleSummaryCancel}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSummarySave}>
                  Save Public Summary
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      <div className="mb-3 flex flex-col justify-between border-b bg-background py-3 md:flex-row">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-center md:items-start gap-2">
            {locationLabel ? <h2 className="text-lg font-bold">{locationLabel}</h2> : null}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {urgencyIcon} {urgency}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs font-normal capitalize ${riskColor}`}
              >
                Risk: {humanize(riskLevel)}
              </Badge>
            </div>
            {timestamp ? (
              <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                {eventDate ? `Event: ${eventDate}` : timestamp}
              </p>
            ) : null}
          </div>
          {submission.flagged ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">
              <Flag className="h-3.5 w-3.5" />
              <span>Flagged for review by admin</span>
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex flex-col items-center gap-2 sm:mt-0 sm:flex-row">
          <DispatchStatusUpdater
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
          <Button size="sm" variant="default" className="w-full sm:w-auto" onClick={handleShare}>
            Share <Share2 className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contextual CTA: suggest Missing Persons intake if this looks like a detention */}
      {(() => {
        const preset = (submission.intended_action_preset || "").toLowerCase();
        const notes = (submission.intended_action_notes || "").toLowerCase();
        const looksLikeDetention =
          preset.includes("detention") ||
          preset.includes("scout") ||
          notes.includes("detention") ||
          notes.includes("arrest");
        return looksLikeDetention ? (
          <div className="px-4 pb-4">
            <Alert>
              <AlertTitle>Confirm and document detention details</AlertTitle>
              <AlertDescription>
                If this incident involves a detention or arrest, capture
                identifiers and facility details so advocates can act fast.
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <a href="/missing-persons/intake">Open Missing Persons Intake</a>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/missing-persons">View Directory</a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : null;
      })()}

      <Tabs defaultValue={defaultTab} className="flex md:w-full">
        <TabsList className="mb-3 flex h-full w-full flex-wrap gap-2 px-1 md:px-0">
          <TabsTrigger
            value="overview"
            className="flex-1 min-w-[25%] px-2 py-2 text-sm sm:flex-none sm:min-w-[110px] sm:px-3 sm:text-base"
          >
            Details
          </TabsTrigger>
          {visibility.showActionability ? (
            <TabsTrigger
              value="planning"
              className="flex-1 min-w-[25%] px-2 py-2 text-sm sm:flex-none sm:min-w-[110px] sm:px-3 sm:text-base"
            >
              Planning
            </TabsTrigger>
          ) : null}
          {visibility.showCoordination ? (
            <TabsTrigger
              value="roles"
              className="flex-1 min-w-[25%] px-2 py-2 text-sm sm:flex-none sm:min-w-[110px] sm:px-3 sm:text-base"
            >
              Roles
            </TabsTrigger>
          ) : null}
          <TabsTrigger
            value="public_engagement"
            className="flex-1 min-w-[25%] px-2 py-2 text-sm sm:flex-none sm:min-w-[110px] sm:px-3 sm:text-base"
          >
            Public Engagement
          </TabsTrigger>
          {commsTabContent ? (
            <TabsTrigger
              value="comms"
              className="flex-1 min-w-[25%] px-2 py-2 text-sm sm:flex-none sm:min-w-[110px] sm:px-3 sm:text-base"
            >
              {commsTabLabel}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="w-full max-w-full">
          <div className="flex gap-2 flex-col w-full max-w-full">
            {/* Layer A: Always-visible Situational Awareness */}
            <SituationalAwarenessCard submission={submission} />

            {/* Visibility controls for creator / privileged roles */}
            <Card className="border border-primary/20 w-full">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base font-semibold">
                    Visibility & Sharing
                  </CardTitle>
                  {isCreator ? (
                    <Badge variant="outline" className="text-xs">
                      You are the creator
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Control who can see this dispatch. Sensitive details stay private by default.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Who can see this?</p>
                  {canManageVisibility ? (
                    <Select
                      value={visibilityScope}
                      onValueChange={(value) =>
                        onUpdateSubmission({ visibility_scope: value as any })
                      }
                    >
                      <SelectTrigger className="w-full h-auto min-h-[4.5rem] items-start text-left">
                        <SelectValue className="py-4 whitespace-normal break-words leading-snug text-left" />
                      </SelectTrigger>
                      <SelectContent className="z-[1300] max-w-[18rem]">
                        <SelectGroup>
                          <SelectLabel>Visibility scope</SelectLabel>
                          {Object.entries(VISIBILITY_EXPLANATIONS).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex flex-col gap-0.5 text-left">
                                <span className="text-sm font-medium capitalize">{humanize(key)}</span>
                                <span className="text-[11px] text-muted-foreground whitespace-normal break-words leading-snug text-left">
                                  {info.definition}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">{visibilityAudience}</p>
                  )}
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <p className="text-sm font-medium">Dispatch Member Permissions</p>
                  <p className="text-xs text-muted-foreground">
                    Assigned members see different levels of detail based on their role and the visibility layers below.
                  </p>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs w-full max-w-full">
                    <div className="flex flex-col gap-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[11px]">
                          Awareness
                        </Badge>
                        <span className="font-medium">Basic Details</span>
                      </div>
                      <span className="text-muted-foreground">
                        Visible to: Your org + region coordinators (others see masked version)
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Includes: Location, event date, urgency, status
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[11px]">
                          Planning
                        </Badge>
                        <span className="font-medium">Operational Details</span>
                      </div>
                      <span className="text-muted-foreground">
                        Visible to: Creator + coordinators (dispatcher/pod leader/admin)
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Includes: Intended actions, logistics, updates
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[11px]">
                          Coordination
                        </Badge>
                        <span className="font-medium">Sensitive Info</span>
                      </div>
                      <span className="text-muted-foreground">
                        Visible to: Creator + coordinators (roles tab)
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Includes: Notes, Signal links, roster management, volunteer attribution
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[11px]">
                          Outcomes
                        </Badge>
                        <span className="font-medium">Impact & Results</span>
                      </div>
                      <span className="text-muted-foreground">
                        Visible to: Creator + coordinators after completion
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        Includes: Impact metrics, people served, resources distributed
                      </span>
                    </div>
                  </div>
                </div>

                {canManageVisibility ? (
                  <div className="pt-3 border-t">
                    <MemberPermissionsManager
                      submission={submission}
                      roster={roster}
                      onUpdate={onUpdateSubmission}
                      canManage={canManageVisibility}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Collapsible operational sections */}
            {visibleOverviewSections.map((section) => (
              <Collapsible
                key={section.id}
                open={expandedSections.has(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <Card className="w-full">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="space-y-1 cursor-pointer hover:bg-muted/50 transition-colors py-3 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold">
                            {section.title}
                          </CardTitle>
                          {section.description ? (
                            <p className="text-xs text-muted-foreground mt-1">
                              {section.description}
                            </p>
                          ) : null}
                          {section.visibilityHint ? (
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Who can see: {section.visibilityHint}
                            </p>
                          ) : null}
                        </div>
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent suppressHydrationWarning>
                      {section.content}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </TabsContent>

        {visibility.showActionability ? (
          <TabsContent value="planning" className="flex-1" suppressHydrationWarning>
            <div className="grid gap-3">
              {planningSections.map((section) => (
                <Card key={section.id}>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                      {section.title}
                    </CardTitle>
                    {section.description ? (
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    ) : null}
                    {section.visibilityHint ? (
                      <p className="text-[11px] text-muted-foreground">
                        Who can see: {section.visibilityHint}
                      </p>
                    ) : null}
                  </CardHeader>
                  <CardContent suppressHydrationWarning>
                    {section.content}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ) : null}

        {visibility.showCoordination ? (
          <TabsContent value="roles" className="flex-1" suppressHydrationWarning>
            <div className="grid gap-3">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-sm font-semibold">
                    Availability Snapshot
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Check who is present and available before assigning roles.
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Who can see: {audienceLabel("coordination")}
                  </p>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="flex flex-wrap gap-3 items-center">
                    <Badge variant="outline">Available now: {activeRoster}</Badge>
                    <Badge variant="outline">Total roster: {totalRoster}</Badge>
                  </div>
                </CardContent>
              </Card>
              <DispatchRolesManager
                submission={submission}
                onUpdate={onUpdateSubmission}
                roster={roster}
              />
            </div>
          </TabsContent>
        ) : null}

        <TabsContent value="public_engagement" className="flex-1">
          {canEditSummary ? (
            <div className="mb-3">
              <Button size="sm" className="w-full sm:w-auto" variant="outline" onClick={openSummarySheet}>
                Edit Public Summary
              </Button>
            </div>
          ) : null}
          <PublicEngagementPanel submission={submission} />
        </TabsContent>

        {commsTabContent ? (
          <TabsContent value="comms" className="flex-1">
            {commsTabContent}
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
export default DispatchSubmissionLayout;
