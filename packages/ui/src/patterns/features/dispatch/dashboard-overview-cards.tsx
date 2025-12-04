"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import type { DispatchSubmission } from "@workspace/store/types/global";
import type { Pod, RosterEntry } from "@workspace/store/types/pod";
import { DispatchStatus } from "@workspace/store/types/dispatch";

type DashboardOverviewCardsProps = {
  submissions: DispatchSubmission[];
  pods: Pod[];
  roster: RosterEntry[];
};

function isActiveStatus(status: DispatchStatus) {
  return !["completed", "cancelled", "expired", "archived"].includes(status);
}

export function DashboardOverviewCards({
  submissions,
  pods,
  roster,
}: DashboardOverviewCardsProps) {
  const metrics = useMemo(() => {
    const totalDispatches = submissions.length;
    const activeDispatches = submissions.filter((entry) =>
      isActiveStatus(entry.status)
    ).length;
    const mobilizing = submissions.filter(
      (entry) => entry.status === "mobilizing"
    ).length;
    const podsOnline = pods.length;
    const rosterReady = roster.filter(
      (entry) => entry.status === "active"
    ).length;
    const rosterTotal = roster.length;
    const totalPodMembers = pods.reduce(
      (sum, pod) => sum + (pod.team?.length ?? 0),
      0
    );
    const languages = new Set<string>();
    roster.forEach((entry) => {
      entry.langs?.forEach((lang) => languages.add(lang.display_name));
    });

    return [
      {
        key: "dispatches",
        label: "Active dispatches",
        value: activeDispatches,
        subtext:
          totalDispatches === 0
            ? "No dispatches in the queue."
            : mobilizing > 0
              ? `${mobilizing} mobilizing right now.`
              : `${totalDispatches} logged in the queue.`,
      },
      {
        key: "pods",
        label: "Pods online",
        value: podsOnline,
        subtext:
          podsOnline === 0
            ? "Create pods to coordinate your teams."
            : `${totalPodMembers} volunteers assigned.`,
      },
      {
        key: "roster",
        label: "Ready volunteers",
        value: rosterReady,
        subtext:
          rosterTotal === 0
            ? "Invite your first volunteers."
            : `${languages.size} languages covered across ${rosterTotal} people.`,
      },
    ];
  }, [pods, roster, submissions]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{metric.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {metric.subtext}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
