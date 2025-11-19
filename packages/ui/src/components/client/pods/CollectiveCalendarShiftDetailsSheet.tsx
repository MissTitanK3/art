"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
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
  canManage?: boolean;
  onEditShift?: (shift: CollectiveCalendarShift) => void;
  onDeleteShift?: (shiftId: string) => void;
};

export function CollectiveCalendarShiftDetailsSheet({
  shift,
  open,
  onOpenChange,
  viewerId,
  onSignup,
  signupLoadingId,
  canManage,
  onEditShift,
  onDeleteShift,
}: CollectiveCalendarShiftDetailsSheetProps) {
  if (!shift) return null;

  const detailVis = visibilityBadge(shift.visibility);
  const signedUp = viewerId ? shift.signups.includes(viewerId) : false;
  const remaining = needsRemaining(shift);
  const DetailIcon = detailVis.icon;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="bg-card text-card-foreground h-full max-h-[90vh] gap-4 overflow-y-auto p-3 sm:p-4 [&::after]:hidden max-w-4xl mx-auto">
        <DrawerHeader>
          <DrawerTitle>{shift.label ?? "Shift details"}</DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            {shift.pod.name} •{" "}
            {shift.organizations.map((o) => o.name).join(", ") || "No org"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-4">
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
              <Badge variant="outline">{shift.pod.slug}</Badge>
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
        <DrawerFooter className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {(shift.dispatchLink || canManage) && (
            <div className="flex w-full flex-col gap-3 text-sm sm:w-auto">
              {canManage ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => onEditShift?.(shift)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-destructive sm:w-auto"
                    onClick={() => onDeleteShift?.(shift.id)}
                  >
                    Delete
                  </Button>
                </div>
              ) : null}
              {shift.dispatchLink ? (
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <a
                    className="text-primary underline"
                    href={shift.dispatchLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open dispatch / related link
                  </a>
                </div>
              ) : null}
            </div>
          )}
          <div className="flex w-full flex-col gap-2 sm:max-w-sm sm:flex-1 sm:flex-row">
            <Button
              variant="secondary"
              className="w-full sm:flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              className="w-full sm:flex-1"
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
