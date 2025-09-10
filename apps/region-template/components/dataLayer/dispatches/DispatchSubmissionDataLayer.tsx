// apps/region-template/components/dataLayer/dispatches/DispatchSubmissionDataLayer.tsx
"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";
import DispatchStatusUpdater from "@workspace/ui/components/client/status/DispatchStatusUpdater";
import DispatchIntendedActionsUpdater from "@workspace/ui/components/client/actions/DispatchIntendedActionsUpdater";
import DispatchSignalLinkUpdater from "@workspace/ui/components/client/external-link/DispatchSignalLinkUpdater";
import DispatchNotesUpdater from "@workspace/ui/components/client/notes/DispatchNotesUpdater";
import DispatchLocationUpdater from "@workspace/ui/components/client/location/DispatchLocationUpdater";
import DispatchRolesManager from "@workspace/ui/components/client/roles/DispatchRolesManager";
import DispatchUpdates from "@workspace/ui/components/client/updates/DispatchUpdates";
import LogisticsPanel from "@workspace/ui/components/client/logistics/LogisticsPanel";
import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { useDispatchStore } from "@workspace/store/dispatchStore";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  id: string;
};

export default function DispatchSubmissionDataLayer({ id }: Props) {
  const submission = useDispatchStore((s) =>
    s.submissions.find((sub) => sub.id === id)
  );

  if (!submission) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Dispatch not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" suppressHydrationWarning>
      {/* Sticky Header */}
      <div className="sticky top-14 z-10 mb-3 bg-background border-b px-4 py-3 flex flex-col md:flex-row items-center justify-between" suppressHydrationWarning>
        <div>
          <h2 className="text-lg font-bold">
            {submission.location_label ?? "Unknown Location"}
          </h2>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            {new Date(submission.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-col sm:flex-row">
          <DispatchStatusUpdater id={submission.id} />
          <Button size="sm" variant="outline">
            Share <Share2 className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <TabsList className="flex flex-wrap w-full h-full mb-3 md:flex-nowrap">
          <TabsTrigger value="overview" className="flex-1 basis-1/2">Overview</TabsTrigger>
          <TabsTrigger value="roles" className="flex-1 basis-1/2">Roles</TabsTrigger>
          <TabsTrigger value="updates" className="flex-1 basis-1/2">Updates</TabsTrigger>
          <TabsTrigger value="logistics" className="flex-1 basis-1/2">Logistics</TabsTrigger>
          <TabsTrigger value="public_engagement" className="flex-1 basis-1/2">Public Engagement</TabsTrigger>
        </TabsList>


        {/* Overview */}
        <TabsContent value="overview" className="flex-1 overflow-y-auto">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Overview</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const summary = [
                    `📍 Location: ${submission.location_label ?? "Unknown"}${submission.state ? `, ${submission.state}` : ""
                    }`,
                    `📅 Time: ${new Date(submission.timestamp).toLocaleString()}`,
                    `⚡ Status: ${submission.status}`,
                    submission.intended_action_preset
                      ? `🎯 Action: ${submission.intended_action_preset}`
                      : null,
                    submission.intended_action_notes
                      ? `📝 Notes: ${submission.intended_action_notes}`
                      : null,
                    submission.signal_link
                      ? `🔗 Signal: ${submission.signal_link}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join("\n");
                  toast.success("Summary copied to clipboard");
                  navigator.clipboard.writeText(summary);
                }}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div>
                <DispatchLocationUpdater id={submission.id} />
              </div>

              <div>
                <p className="font-medium">Submitted At</p>
                <p suppressHydrationWarning>
                  {new Date(submission.timestamp).toLocaleString()}
                </p>
              </div>

              {submission.intended_action_preset && (
                <div>
                  <p className="font-medium">Intended Action</p>
                  <DispatchIntendedActionsUpdater id={submission.id} />
                </div>
              )}

              {submission.intended_action_notes && (
                <div>
                  <DispatchNotesUpdater id={submission.id} />
                </div>
              )}

              {submission.signal_link && (
                <div>
                  <DispatchSignalLinkUpdater id={submission.id} />
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles" className="flex-1" suppressHydrationWarning>
          <DispatchRolesManager id={submission.id} />
        </TabsContent>

        {/* Public Engagement */}
        <TabsContent value="public_engagement" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Public Engagement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Manage public communications and outreach efforts.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Updates */}
        <TabsContent value="updates" className="flex-1">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4 text-sm">
              <p className="text-muted-foreground">
                Running notes, incident log, and updates.
              </p>
              <DispatchUpdates dispatchId={submission.id} />
            </CardContent>
          </Card>
        </TabsContent>


        {/* Logistics */}
        <TabsContent value="logistics" className="flex-1">
          <LogisticsPanel dispatchId={submission.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
