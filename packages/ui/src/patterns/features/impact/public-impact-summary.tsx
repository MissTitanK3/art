"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2, Sparkles, Users } from "lucide-react";

export type PublicImpactSummaryProps = {
  regionId: string;
  className?: string;
};

type SummaryResponse =
  | { hidden: true }
  | { hours: number; people: number; message: string; dispatchCount: number };

type State =
  | { status: "loading" }
  | { status: "ready"; payload: Exclude<SummaryResponse, { hidden: true }> }
  | { status: "hidden" }
  | { status: "error" };

export function PublicImpactSummary({
  regionId,
  className,
}: PublicImpactSummaryProps) {
  const [state, setState] = React.useState<State>({ status: "loading" });

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setState({ status: "loading" });
        const res = await fetch(
          `/api/public/impact/summary?regionId=${encodeURIComponent(regionId)}`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as SummaryResponse;
        if (cancelled) return;
        if ("hidden" in json && json.hidden) {
          setState({ status: "hidden" });
        } else if (json && "hours" in json) {
          setState({ status: "ready", payload: json });
        } else {
          setState({ status: "error" });
        }
      } catch (error) {
        if (!cancelled) setState({ status: "error" });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [regionId]);

  const content = (() => {
    if (state.status === "loading") {
      return (
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-3 w-full animate-pulse rounded-full bg-muted/70" />
        </div>
      );
    }
    if (state.status === "hidden") {
      return (
        <p className="text-sm text-muted-foreground">
          Impact metrics are withheld until more verified dispatches are
          available. Check back soon.
        </p>
      );
    }
    if (state.status === "error") {
      return (
        <p className="text-sm text-muted-foreground">
          Impact summary is cooling off. Please refresh later.
        </p>
      );
    }
    const payload = state.payload;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Community lift (30d)
          </p>
        </div>
        <div className="flex items-baseline gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Volunteer hours</p>
            <p className="text-3xl font-semibold">
              {payload.hours.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Neighbors served</p>
            <p className="text-3xl font-semibold text-primary">
              {payload.people.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="rounded-md bg-muted/60 p-3 text-sm">
          {payload.message}
        </div>
      </div>
    );
  })();

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          Regional Impact
        </CardTitle>
        {state.status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
