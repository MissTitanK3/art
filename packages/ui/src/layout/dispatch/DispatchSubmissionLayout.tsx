"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import DispatchStatusUpdater from "@workspace/ui/components/client/status/DispatchStatusUpdater";
import DispatchIntendedActionsUpdater from "@workspace/ui/components/client/actions/DispatchIntendedActionsUpdater";
import DispatchSignalLinkUpdater from "@workspace/ui/components/client/external-link/DispatchSignalLinkUpdater";
import DispatchPublicSignalLinkUpdater from "@workspace/ui/components/client/external-link/DispatchPublicSignalLinkUpdater";
import DispatchNotesUpdater from "@workspace/ui/components/client/notes/DispatchNotesUpdater";
import DispatchLocationUpdater from "@workspace/ui/components/client/location/DispatchLocationUpdater";
import DispatchLocationPinSelector from "@workspace/ui/components/client/location/DispatchLocationPinSelector";
import DispatchDateOfEventUpdater from "@workspace/ui/components/client/event/DispatchDateOfEventUpdater";
import DispatchRolesManager from "@workspace/ui/components/client/roles/DispatchRolesManager";
import DispatchUpdates from "@workspace/ui/components/client/updates/DispatchUpdates";
import LogisticsPanel from "@workspace/ui/components/client/logistics/LogisticsPanel";
import PublicEngagementPanel from "@workspace/ui/components/client/engagement/PublicEngagementPanel";
import { VolunteerAttributionPanel } from "@workspace/ui/components/client/impact/VolunteerAttributionPanel";
import { ImpactMetricsPanel } from "@workspace/ui/components/client/impact/ImpactMetricsPanel";
import { Button } from "@workspace/ui/components/button";
import AfterActionReportGuide from "@workspace/ui/components/dispatch/AfterActionReportGuide";
import { Copy, Share2, Flag } from "lucide-react";
import { toast } from "sonner";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import type { DispatchUpdate } from "@workspace/store/types/dispatch";
import type { RosterEntry } from "@workspace/store/types/pod.ts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";

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
      <div className="mb-3 flex flex-col items-center justify-between border-b bg-background px-4 py-3 md:flex-row">
        <div>
          {locationLabel ? (
            <h2 className="text-lg font-bold">{locationLabel}</h2>
          ) : null}
          {timestamp ? (
            <p
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {eventDate ? `Event: ${eventDate}` : timestamp}
            </p>
          ) : null}
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
            Overview
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex-1 basis-1/2">
            Roles
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex-1 basis-1/2">
            Updates
          </TabsTrigger>
          <TabsTrigger value="logistics" className="flex-1 basis-1/2">
            Logistics
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

        <TabsContent value="logistics" className="flex-1">
          <LogisticsPanel
            submission={submission}
            onUpdate={onUpdateSubmission}
          />
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
