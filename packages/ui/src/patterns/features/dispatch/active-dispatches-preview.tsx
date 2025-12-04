"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { Badge } from "@workspace/ui/primitives/badge";
import { cn } from "@workspace/ui/lib/utils";
import { STATUS_META } from "@workspace/ui/lib/constants/dispatch";
import { DISPATCH_TYPE_LABELS } from "@workspace/store/types/dispatch";
import type { DispatchSubmission } from "@workspace/store/types/global";

type ActiveDispatchesPreviewProps = {
  submissions: DispatchSubmission[];
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";

  const diffMs = date.getTime() - Date.now();
  const isFuture = diffMs > 0;
  const absoluteMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (absoluteMinutes < 1) {
    return isFuture ? "starting now" : "just now";
  }

  if (absoluteMinutes < 60) {
    return isFuture
      ? `in ${absoluteMinutes} min${absoluteMinutes === 1 ? "" : "s"}`
      : `${absoluteMinutes} min${absoluteMinutes === 1 ? "" : "s"} ago`;
  }

  const absoluteHours = Math.round(absoluteMinutes / 60);
  if (absoluteHours < 24) {
    return isFuture
      ? `in ${absoluteHours} hr${absoluteHours === 1 ? "" : "s"}`
      : `${absoluteHours} hr${absoluteHours === 1 ? "" : "s"} ago`;
  }

  const absoluteDays = Math.round(absoluteHours / 24);
  return isFuture
    ? `in ${absoluteDays} day${absoluteDays === 1 ? "" : "s"}`
    : `${absoluteDays} day${absoluteDays === 1 ? "" : "s"} ago`;
}

export function ActiveDispatchesPreview({
  submissions,
}: ActiveDispatchesPreviewProps) {
  const items = useMemo(
    () =>
      [...submissions]
        // Filter out non-actionable dispatches
        .filter(
          (entry) =>
            !["cancelled", "expired", "archived"].includes(entry.status)
        )
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 4),
    [submissions]
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle>Dispatch queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest entries flowing through the queue.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dispatches">Open dispatch</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dispatches yet.</p>
        ) : (
          items.map((submission) => {
            const statusMeta = STATUS_META[submission.status];
            const typeLabel = DISPATCH_TYPE_LABELS[submission.type ?? "other"];
            const requiredRoles = submission.required_roles ?? [];
            const rolePreview = requiredRoles.slice(0, 3).join(", ");
            const hasMoreRoles = requiredRoles.length > 3;

            return (
              <div
                key={submission.id}
                className="rounded-md border border-border/60 bg-muted/40 p-4 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="border-none bg-background/60 px-2 py-1 text-xs"
                    >
                      {typeLabel}
                    </Badge>
                    <span>{formatRelativeTime(submission.timestamp)}</span>
                  </div>
                  <Badge
                    className={cn(
                      "border-none px-2 py-1 text-xs font-semibold capitalize text-white",
                      statusMeta?.color ?? "bg-slate-600"
                    )}
                  >
                    {statusMeta?.label ?? submission.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-medium">
                  {submission.location_label ?? "Unlabeled dispatch"}
                </p>
                {submission.intended_action_notes ? (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {submission.intended_action_notes}
                  </p>
                ) : null}
                {rolePreview ? (
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Needs: {rolePreview}
                    {hasMoreRoles ? "…" : ""}
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
