"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Switch } from "@workspace/ui/primitives/switch";
import { Button } from "@workspace/ui/primitives/button";
import { Badge } from "@workspace/ui/primitives/badge";
import {
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Timer,
  TrendingUp,
  Users,
  UserCheck,
} from "lucide-react";
type DashboardResponse = {
  totals: {
    volunteerHours: number;
    peopleServed: number;
    medianResponseMinutes: number;
    highRiskCount: number;
  };
  hoursTrend: {
    weekStart: string;
    hours?: number;
  }[];
  peopleTrend: {
    weekStart: string;
    people?: number;
  }[];
};
const REFRESH_INTERVAL_MS = 120000;
function formatDuration(minutes: number) {
  if (minutes <= 0) return "Instant";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}
function formatNumber(value: number) {
  return new Intl.NumberFormat().format(Math.round(value));
}
type SparklineProps = {
  label: string;
  points: number[];
  color: string;
};
function TrendSparkline({ label, points, color }: SparklineProps) {
  const width = 200;
  const height = 60;
  const paddedPoints = points.length ? points : Array(8).fill(0);
  const max = Math.max(...paddedPoints, 1);
  const path = paddedPoints
    .map((value, index) => {
      const x =
        paddedPoints.length === 1
          ? width / 2
          : (index / (paddedPoints.length - 1)) * (width - 10) + 5;
      const y = height - 5 - (value / max) * (height - 10);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{formatNumber(paddedPoints[paddedPoints.length - 1] ?? 0)}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label} sparkline`}
        className="mt-1 w-full"
      >
        <path
          d={path}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          stroke={color}
        />
      </svg>
    </div>
  );
}
export default function PerformancePage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showHighRisk, setShowHighRisk] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const fetchDashboard = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setRefreshing(true);
      setError(null);
      const res = await fetch("/api/impact/dashboard", { cache: "no-store" });
      if (!res.ok) {
        const message = (await res.json())?.error;
        throw new Error(message ?? "Unable to load dashboard");
      }
      const json = (await res.json()) as DashboardResponse;
      setData(json);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    fetchDashboard();
    const handleVisibility = () => {
      if (!document.hidden) {
        fetchDashboard(false);
      }
    };
    const interval = setInterval(() => {
      if (!document.hidden) fetchDashboard(false);
    }, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchDashboard]);
  const totals = data?.totals;
  const metricCards = [
    {
      label: "Volunteer hours (30d)",
      value: totals ? `${formatNumber(totals.volunteerHours)}h` : "—",
      icon: <Users className="h-5 w-5 text-primary" />,
    },
    {
      label: "People served (30d)",
      value: totals ? formatNumber(totals.peopleServed) : "—",
      icon: <UserCheck className="h-5 w-5 text-primary" />,
    },
    {
      label: "Median response time",
      value: totals ? formatDuration(totals.medianResponseMinutes) : "—",
      icon: <Timer className="h-5 w-5 text-primary" />,
    },
  ];
  if (showHighRisk) {
    metricCards.push({
      label: "High-risk dispatches",
      value: totals ? formatNumber(totals.highRiskCount) : "—",
      icon: <ShieldAlert className="h-5 w-5 text-primary" />,
    });
  }
  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Impact Performance</h1>
          <p className="text-sm text-muted-foreground">
            Live snapshot of volunteer throughput, neighbors served, and inbox
            risk.
          </p>
          {lastUpdated ? (
            <p className="text-xs text-muted-foreground">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-col justify-center items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
            <span>Show high-risk</span>
            <Switch
              checked={showHighRisk}
              onCheckedChange={setShowHighRisk}
              aria-label="Toggle high-risk metric"
            />
          </div>
          <Button
            onClick={() => fetchDashboard(false)}
            variant="outline"
            size="sm"
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(loading ? Array(metricCards.length).fill(null) : metricCards).map(
          (card, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col gap-3 py-4">
                {loading ? (
                  <>
                    <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {card?.icon}
                      {card?.label}
                    </div>
                    <div className="text-2xl font-semibold">{card?.value}</div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-base font-semibold">
              Volunteer hours trend
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />8 weeks
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="mt-6 h-24 animate-pulse rounded-md bg-muted/60" />
            ) : (
              <TrendSparkline
                label="Latest compared to 8-week baseline"
                points={(data?.hoursTrend ?? []).map(
                  (point) => point.hours ?? 0
                )}
                color="hsl(var(--primary))"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-base font-semibold">
              People served trend
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />8 weeks
            </Badge>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="mt-6 h-24 animate-pulse rounded-md bg-muted/60" />
            ) : (
              <TrendSparkline
                label="Neighbors helped per week"
                points={(data?.peopleTrend ?? []).map(
                  (point) => point.people ?? 0
                )}
                color="hsl(var(--primary))"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
