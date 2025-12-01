"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { AlertTriangle, TrendingUp } from "lucide-react";
import type { RegionReadinessChecklistItem } from "@workspace/store/types/academy-readiness";

type CriticalNeed = {
  roleLabel: string;
  deficitSummary?: string;
  coverageStatus: string;
};

type ReadinessResponse = {
  score: number;
  scoreMethod: string;
  checklist: RegionReadinessChecklistItem[];
  criticalNeeds: CriticalNeed[];
};

export function RegionReadinessCard() {
  const [data, setData] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/academy/readiness", {
          credentials: "include",
        });
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          setUnauthorized(true);
          setData(null);
          return;
        }
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const json = (await res.json()) as ReadinessResponse;
        setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load readiness");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const scorePercent = useMemo(() => {
    if (!data) return 0;
    // API returns score 0–1
    return Math.round(Math.max(0, Math.min(1, data.score)) * 100);
  }, [data]);

  const statusCounts = useMemo(() => {
    const counts = { met: 0, at_risk: 0, critical: 0 };
    data?.checklist?.forEach((item) => {
      if (item.status === "met") counts.met += 1;
      else if (item.status === "at_risk") counts.at_risk += 1;
      else counts.critical += 1;
    });
    return counts;
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Region Readiness</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading readiness…
          </div>
        ) : unauthorized ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Sign in to view academy readiness.
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : data ? (
          <>
            <div className="mb-4">
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold">{scorePercent}%</span>
                <span className="text-xs text-muted-foreground mb-1">
                  Operational Capacity
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                <span>Met: {statusCounts.met}</span>
                <span>At risk: {statusCounts.at_risk}</span>
                <span>Critical: {statusCounts.critical}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Critical Needs
                </div>
                <Badge
                  variant={
                    (data.criticalNeeds?.length ?? 0) > 0
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {data.criticalNeeds?.length ?? 0} Urgent
                </Badge>
              </div>

              {data.criticalNeeds && data.criticalNeeds.length > 0 ? (
                <div className="space-y-2">
                  {data.criticalNeeds.slice(0, 3).map((need, i) => (
                    <div
                      key={`${need.roleLabel}-${i}`}
                      className="flex items-start justify-between text-sm p-2 bg-muted/50 rounded-md border"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500 mt-[2px]" />
                        <div className="flex flex-col">
                          <span className="font-medium">{need.roleLabel}</span>
                          {need.deficitSummary ? (
                            <span className="text-xs text-muted-foreground">
                              {need.deficitSummary}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <Badge
                        variant={
                          need.coverageStatus === "critical"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px] h-5 px-1.5 py-0"
                      >
                        {need.coverageStatus === "critical"
                          ? "Critical"
                          : "At risk"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No urgent gaps detected. Keep training cadence steady.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Readiness data unavailable.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
