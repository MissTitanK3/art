"use client";
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
import { Badge } from "@workspace/ui/primitives/badge";
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
import { Share2, Flag } from "lucide-react";
import { toast } from "sonner";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import type { DispatchUpdate } from "@workspace/store/types/dispatch";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/primitives/alert";
import { bucketFor, bucketEmoji } from "./dispatch-buckets";
import { humanize } from "@workspace/ui/lib/utils";

export type DispatchSubmissionLayoutProps = {
  submission: DispatchSubmission;
  defaultTab?:
    | "overview"
    | "roles"
    | "updates"
    | "logistics"
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
};

const RISK_LEVEL_COLORS: Record<string, string> = {
  unknown: "bg-gray-100 text-gray-800 border-gray-200",
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
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
}: DispatchSubmissionLayoutProps) {
  const locationLabel = submission.location_label ?? "Unknown Location";
  const timestamp = new Date(submission.timestamp).toLocaleString();
  const eventDate = submission.date_of_event
    ? new Date(submission.date_of_event).toLocaleString()
    : undefined;

  const urgency = bucketFor(submission);
  const urgencyIcon = bucketEmoji(urgency);
  const riskLevel = submission.risk_level ?? "unknown";

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

  const handleCopySummary = () => {
    const summary = [
      `📍 Location: ${submission.location_label ?? "Unknown"}${submission.state ? `, ${submission.state}` : ""}`,
      `📅 Time: ${submission.date_of_event ? new Date(submission.date_of_event).toLocaleString() : new Date(submission.timestamp).toLocaleString()}`,
      `⚡ Status: ${submission.status}`,
      `🚨 Urgency: ${urgency}`,
      `🛡️ Risk: ${humanize(riskLevel)}`,
      submission.intended_action_preset
        ? `🎯 Action: ${submission.intended_action_preset}`
        : null,
      submission.intended_action_notes
        ? `📝 Notes: ${submission.intended_action_notes}`
        : null,
      submission.public_signal_link
        ? `🔗 Public Link: ${submission.public_signal_link}`
        : null,
      submission.signal_link
        ? `🔒 Private Dispatch Link: ${submission.signal_link}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Clipboard access unavailable");
      return;
    }
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        toast.success("Summary copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy summary");
      });
  };

  const overviewSections = [
    {
      id: "location",
      title: "Location & Coverage",
      description: "Update dispatch location, map pin, and schedule details.",
      content: (
        <div className="space-y-4">
          <DispatchLocationUpdater
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
          <DispatchDateOfEventUpdater
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
          <DispatchLocationPinSelector
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
        </div>
      ),
    },
    {
      id: "logistics",
      title: "Logistics",
      description: "Manage transport, supplies, and other resources.",
      content: (
        <LogisticsPanel submission={submission} onUpdate={onUpdateSubmission} />
      ),
    },
    {
      id: "intended-action",
      title: "Intended Action",
      description: "Clarify goals, note changes, and coordinate next steps.",
      content: (
        <DispatchIntendedActionsUpdater
          submission={submission}
          onUpdate={onUpdateSubmission}
        />
      ),
    },
    {
      id: "notes",
      title: "Notes & Context",
      description: "Keep field updates and sensitive info in one place.",
      content: (
        <DispatchNotesUpdater
          submission={submission}
          onUpdate={onUpdateSubmission}
        />
      ),
    },
    {
      id: "signal-link",
      title: "Signal Links",
      description: "Set the private and public Signal channels for responders.",
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
      content: (
        <VolunteerAttributionPanel dispatchId={submission.id} roster={roster} />
      ),
    },
    {
      id: "impact-metrics",
      title: "Impact Metrics",
      description: "Log people served, resources moved, and risk level.",
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
        />
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex flex-col justify-between border-b bg-background py-3 md:flex-row">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-center md:items-start gap-2">
            {locationLabel ? (
              <h2 className="text-lg font-bold">{locationLabel}</h2>
            ) : null}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {urgencyIcon} {urgency}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs font-normal capitalize ${RISK_LEVEL_COLORS[riskLevel] ?? ""}`}
              >
                Risk: {humanize(riskLevel)}
              </Badge>
            </div>
            {timestamp ? (
              <p
                className="text-xs text-muted-foreground"
                suppressHydrationWarning
              >
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
          <Button size="sm" variant="default" onClick={handleShare}>
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
                    <a href="/missing-persons/intake">
                      Open Missing Persons Intake
                    </a>
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

      {loadingMessage ? (
        <p className="px-4 text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}

      <Tabs defaultValue={defaultTab} className="flex flex-1 flex-col">
        <TabsList className="mb-3 flex h-full w-full flex-wrap md:flex-nowrap">
          <TabsTrigger value="overview" className="flex-1 basis-1/2">
            Details
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex-1 basis-1/2">
            Roles
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex-1 basis-1/2">
            Updates
          </TabsTrigger>
          <TabsTrigger value="public_engagement" className="flex-1 basis-1/2">
            Public Engagement
          </TabsTrigger>
          {commsTabContent ? (
            <TabsTrigger value="comms" className="flex-1 basis-1/2">
              {commsTabLabel}
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="flex-1 overflow-y-auto">
          <div className="grid gap-4">
            {overviewSections.map((section) => (
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
                </CardHeader>
                <CardContent suppressHydrationWarning>
                  {section.content}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="flex-1" suppressHydrationWarning>
          <DispatchRolesManager
            submission={submission}
            onUpdate={onUpdateSubmission}
            roster={roster}
          />
        </TabsContent>

        <TabsContent value="updates" className="flex-1">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Updates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Running notes, incident log, and updates.
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col text-sm">
              <DispatchUpdates
                updates={submission.updates}
                onAddUpdate={onAddUpdate}
                onEditUpdate={onEditUpdate}
                onRemoveUpdate={onRemoveUpdate}
                afterComposer={
                  <AfterActionReportGuide onAddUpdate={onAddUpdate} />
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public_engagement" className="flex-1">
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
