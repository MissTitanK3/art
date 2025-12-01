"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Calendar, MapPin, ArrowRight, ClipboardList } from "lucide-react";
import type { DispatchSubmission } from "@workspace/store/types/global";

export function AssignedDispatchesCard({
  submissions,
  userId,
}: {
  submissions: DispatchSubmission[];
  userId?: string | null;
}) {
  const assignedDispatches = useMemo(() => {
    if (!userId) return [];

    return submissions
      .filter((dispatch) => dispatch.status !== "archived")
      .filter((dispatch) =>
        (dispatch.assigned_volunteers ?? []).some((v: any) => {
          const profile = (v as any)?.profile ?? {};
          return (
            v?.id === userId ||
            profile?.id === userId ||
            profile?.user_id === userId
          );
        }),
      )
      .slice(0, 3);
  }, [submissions, userId]);

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
                    {new Date(dispatch.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {dispatch.location && (
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      Lat: {dispatch.location.lat.toFixed(4)}, Lng:{" "}
                      {dispatch.location.lng.toFixed(4)}
                    </span>
                  </div>
                )}
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
