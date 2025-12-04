"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import type { Pod } from "@workspace/store/types/pod";
import type { DispatchShift } from "@workspace/store/useDispatchStore";

type ResourceCoverageCardProps = {
  pods: Pod[];
  shifts: DispatchShift[];
};

type ShiftPreview = {
  id: string;
  podId?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
  volunteerName?: string;
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

function formatTimeRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Unscheduled";
  }

  const sameDay = startDate.toDateString() === endDate.toDateString();
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${dateFormatter.format(startDate)} • ${timeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`;
  }

  return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)} – ${dateFormatter.format(endDate)} ${timeFormatter.format(endDate)}`;
}

function ShiftColumn({
  title,
  shifts,
  podsById,
  emptyCopy,
}: {
  title: string;
  shifts: ShiftPreview[];
  podsById: Map<string, { name: string; area?: string }>;
  emptyCopy: string;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">
          Pulled from the dispatch roster.
        </p>
      </div>
      {shifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyCopy}</p>
      ) : (
        shifts.slice(0, 3).map((shift) => {
          const pod = shift.podId ? podsById.get(shift.podId) : undefined;
          return (
            <div
              key={shift.id}
              className="rounded-md border border-border/60 bg-muted/40 p-3 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{pod?.name ?? "Unassigned pod"}</span>
                <span>{formatRelativeTime(shift.startsAt)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">
                {formatTimeRange(shift.startsAt, shift.endsAt)}
              </p>
              {pod?.area ? (
                <p className="text-xs text-muted-foreground">{pod.area}</p>
              ) : null}
              {shift.notes ? (
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {shift.notes}
                </p>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}

export function ResourceCoverageCard({
  pods,
  shifts,
}: ResourceCoverageCardProps) {
  const podsById = useMemo(
    () => new Map(pods.map((pod) => [pod.id, pod])),
    [pods]
  );

  const { activeShifts, upcomingShifts } = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    const active = [];
    const upcoming = [];

    for (const shift of shifts) {
      const start = new Date(shift.startsAt);
      const end = new Date(shift.endsAt);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        continue;

      if (start <= now && end >= now) {
        active.push(shift);
        continue;
      }

      if (start > now && start <= cutoff) {
        upcoming.push(shift);
      }
    }

    upcoming.sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );

    return { activeShifts: active, upcomingShifts: upcoming };
  }, [shifts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coverage window</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <ShiftColumn
          title="Live shifts"
          shifts={activeShifts}
          podsById={podsById}
          emptyCopy="No teams on shift right now."
        />
        <ShiftColumn
          title="Next 12 hours"
          shifts={upcomingShifts}
          podsById={podsById}
          emptyCopy="No coverage scheduled yet."
        />
      </CardContent>
    </Card>
  );
}
