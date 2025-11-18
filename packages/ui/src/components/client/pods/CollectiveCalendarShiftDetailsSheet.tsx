"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet";
import { formatDateRange } from "@workspace/ui/lib/utils";
import { Clock3, LayoutList, MapPin, MapPinned, Users } from "lucide-react";
import {
  CollectiveCalendarShift,
  needsRemaining,
  routeSummary,
  visibilityBadge,
} from "./CollectiveCalendarShared";

type CollectiveCalendarShiftDetailsSheetProps = {
  shift: CollectiveCalendarShift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewerId: string | null;
  onSignup: (shift: CollectiveCalendarShift) => void;
  signupLoadingId: string | null;
};

export function CollectiveCalendarShiftDetailsSheet({
  shift,
  open,
  onOpenChange,
  viewerId,
  onSignup,
  signupLoadingId,
}: CollectiveCalendarShiftDetailsSheetProps) {
  if (!shift) return null;

  const detailVis = visibilityBadge(shift.visibility);
  const signedUp = viewerId ? shift.signups.includes(viewerId) : false;
  const remaining = needsRemaining(shift);
  const DetailIcon = detailVis.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card text-card-foreground p-2">
        <SheetHeader>
          <SheetTitle>{shift.label ?? "Shift details"}</SheetTitle>
          <SheetDescription>
            {shift.pod.name} •{" "}
            {shift.organizations.map((o) => o.name).join(", ") || "No org"}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant={detailVis.variant}>
              <span className="flex items-center gap-1">
                <DetailIcon className="h-3.5 w-3.5" />
                {detailVis.label}
              </span>
            </Badge>
            {shift.organizations.map((org) => (
              <Badge key={org.id} variant="secondary">
                {org.name}
              </Badge>
            ))}
            {shift.pod.slug ? (
              <Badge variant="outline">/{shift.pod.slug}</Badge>
            ) : null}
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex items-start gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold">Timing</p>
                <p className="text-muted-foreground" suppressHydrationWarning>
                  {formatDateRange(shift.start, shift.end, shift.tz)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-muted-foreground">
                  {shift.location || "TBA"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-semibold">Crew</p>
                <p className="text-muted-foreground">
                  Needed: {shift.needed} · Signed up: {shift.signups.length} ·
                  Remaining: {remaining}
                </p>
              </div>
            </div>
            {shift.route ? (
              <div className="mt-2 flex items-start gap-2">
                <MapPinned className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Route</p>
                  <p className="text-muted-foreground">
                    {routeSummary(shift.route)}
                  </p>
                </div>
              </div>
            ) : null}
            {shift.notes ? (
              <div className="mt-2 flex items-start gap-2">
                <LayoutList className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Notes</p>
                  <p className="text-muted-foreground">{shift.notes}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <SheetFooter className="gap-3">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <p>Routes remain rough-only. Dispatch links stay private.</p>
            {shift.dispatchLink ? (
              <a
                className="text-primary underline"
                href={shift.dispatchLink}
                target="_blank"
                rel="noreferrer"
              >
                Open dispatch / related link
              </a>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              disabled={signupLoadingId === shift.id}
              onClick={() => onSignup(shift)}
            >
              {signupLoadingId === shift.id
                ? "Signing up…"
                : signedUp
                  ? "Signed up"
                  : "Sign up"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
