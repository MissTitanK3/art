"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Star, MapPin } from "lucide-react";
import type { DispatchSubmission } from "@workspace/store/types/global";

export function RecommendedDispatchesCard({
  submissions,
}: {
  submissions: DispatchSubmission[];
}) {
  // Mock logic: filter for dispatches that might need help
  const recommendedDispatches = submissions.slice(2, 5);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Recommended for You
        </CardTitle>
        <Star className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendedDispatches.map((dispatch) => (
            <div
              key={dispatch.id}
              className="flex items-start justify-between space-x-2 rounded-md border p-2 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {dispatch.location_label || "Dispatch Request"}
                  </span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {dispatch.location_label ?? "Location pending"}
                  </span>
                </div>
                <div className="flex gap-1 mt-1">
                  {/* Mock matching skills */}
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    Medical
                  </Badge>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    Driver
                  </Badge>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                <span className="sr-only">View</span>
                <span className="text-lg">›</span>
              </Button>
            </div>
          ))}
          {recommendedDispatches.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recommendations at this time.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
