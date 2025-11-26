"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { formatDateRange } from "@workspace/ui/lib/utils";
import { CheckCircle2, ListChecks, MapPin, MapPinned, Users } from "lucide-react";
import {
  CollectiveCalendarShift,
  needsRemaining,
  routeSummary,
  visibilityBadge,
} from "./CollectiveCalendarShared";

type CollectiveCalendarShiftCardProps = {
  shift: CollectiveCalendarShift;
  onClick: (shift: CollectiveCalendarShift) => void;
};

export function CollectiveCalendarShiftCard({
  shift,
  onClick,
}: CollectiveCalendarShiftCardProps) {
  const need = needsRemaining(shift);
  const vis = visibilityBadge(shift.visibility, shift.visibilityScope);
  const VisIcon = vis.icon;

  return (
    <Card
      className="hover:border-primary/60 cursor-pointer transition"
      onClick={() => onClick(shift)}
    >
      <div className="space-y-3 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {shift.label ?? "Pod shift"}
            </p>
            <p
              className="text-xs text-muted-foreground"
              suppressHydrationWarning
            >
              {formatDateRange(shift.start, shift.end, shift.tz)}
            </p>
          </div>
          <Badge variant={vis.variant} className="w-fit sm:shrink-0">
            <span className="flex items-center gap-1">
              <VisIcon className="h-3.5 w-3.5" />
              {vis.label}
            </span>
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex w-full items-center gap-1 rounded-md bg-muted px-2 py-1 sm:w-auto">
            <MapPin className="h-3.5 w-3.5" />
            {shift.location || "Location TBA"}
          </span>
          <span className="inline-flex w-full items-center gap-1 rounded-md bg-muted px-2 py-1 sm:w-auto">
            <Users className="h-3.5 w-3.5" />
            {shift.pod.name}
          </span>
          {shift.organizations.map((org) => (
            <Badge key={org.id} variant="secondary" className="w-full sm:w-auto">
              {org.name}
            </Badge>
          ))}
          {shift.route ? (
            <span className="inline-flex w-full items-center gap-1 rounded-md bg-muted px-2 py-1 sm:w-auto">
              <MapPinned className="h-3.5 w-3.5" />
              {routeSummary(shift.route)}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {need > 0 ? (
              <Badge variant="destructive" className="gap-1">
                <ListChecks className="h-3.5 w-3.5" />
                Needs crew ({need})
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Crew set
              </Badge>
            )}
            {shift.headcount ? (
              <span className="text-muted-foreground">
                Planned headcount: {shift.headcount}
              </span>
            ) : null}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              onClick(shift);
            }}
          >
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
