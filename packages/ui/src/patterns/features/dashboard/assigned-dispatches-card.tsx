"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Badge } from "@workspace/ui/primitives/badge";
import { Button } from "@workspace/ui/primitives/button";
import { Calendar, ArrowRight, ClipboardList } from "lucide-react";
import type { DispatchSubmission } from "@workspace/store/types/global";
import { humanize } from "@workspace/ui/lib";

export function AssignedDispatchesCard({
  submissions,
  userId,
  profileId,
}: {
  submissions: DispatchSubmission[];
  userId?: string | null;
  profileId?: string | null;
}) {
  const startOfToday = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const assignedDispatches = useMemo(() => {
    if (!userId && !profileId) return [];

    const normalizeVolunteers = (input: unknown) => {
      if (Array.isArray(input)) return input as any[];
      if (input && typeof input === "object") {
        return Object.values(input as Record<string, unknown>).flatMap(
          (value) => {
            if (Array.isArray(value)) return value as any[];
            return value ? [value] : [];
          }
        );
      }
      return [];
    };

    const upcoming = submissions
      .filter((dispatch) => dispatch.status !== "archived")
      .filter((dispatch) => {
        const volunteers = normalizeVolunteers(dispatch.assigned_volunteers);
        return volunteers.some((v: any) => {
          const profile = (v?.profile as any) ?? {};
          const entryProfileId =
            v?.profile_id ?? profile?.id ?? v?.volunteer_id ?? v?.id;
          const entryUserId =
            profile?.user_id ?? v?.profile_user_id ?? v?.user_id;

          return Boolean(
            (userId && entryUserId && entryUserId === userId) ||
              (profileId && entryProfileId && entryProfileId === profileId)
          );
        });
      })
      .filter((dispatch) => {
        const targetDate = dispatch.date_of_event ?? dispatch.timestamp;
        if (!targetDate) return false;
        const eventDate = new Date(targetDate);
        if (Number.isNaN(eventDate.getTime())) return false;
        return eventDate >= startOfToday;
      })
      .sort((a, b) => {
        const aDate = new Date(a.date_of_event ?? a.timestamp).getTime();
        const bDate = new Date(b.date_of_event ?? b.timestamp).getTime();
        return aDate - bDate;
      })
      .slice(0, 3);

    return upcoming;
  }, [submissions, userId, profileId, startOfToday]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {assignedDispatches.length > 0 ? (
          <div className="space-y-4">
            {assignedDispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                className="flex flex-col space-y-2 rounded-md border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate">
                    {dispatch.location_label || "Unknown Location"}
                  </span>
                  <Badge
                    variant={
                      dispatch.status === "mobilizing"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {dispatch.status}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(
                      dispatch.date_of_event ?? dispatch.timestamp
                    ).toLocaleDateString()}
                  </span>
                  {dispatch.type && (
                    <span className="ml-2">{humanize(dispatch.type)}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full mt-2 h-7 text-xs"
                  asChild
                >
                  <a href={`/dispatches/submission/${dispatch.id}`}>
                    View Details <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
            <p className="text-sm">No active assignments.</p>
            <Button variant="link" size="sm" className="mt-1" asChild>
              <a href="/dispatches">Browse Open Dispatches</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
