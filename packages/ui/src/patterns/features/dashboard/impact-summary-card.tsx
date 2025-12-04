"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Heart, Users, Clock } from "lucide-react";

export function ImpactSummaryCard() {
  // Mock data
  const stats = {
    hours: 124,
    peopleHelped: 450,
    missions: 12,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Impact Summary</CardTitle>
        <Heart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{stats.hours}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Volunteer Hours
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{stats.peopleHelped}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> People Served
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center italic">
            &quot;Your dedication makes our community stronger every single
            day.&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
