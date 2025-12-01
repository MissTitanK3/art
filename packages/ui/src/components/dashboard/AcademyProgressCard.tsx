"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { GraduationCap, CalendarClock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ProgressResponse = {
  stats: {
    completed: number;
    inProgress: number;
    expired: number;
    total: number;
    recertRisk: number;
  };
  nextSession: {
    id: string;
    title: string;
    start: string;
    modality: string;
    instructorName?: string;
    waitlist?: number;
    confirmed?: number;
    capacity?: number;
  } | null;
  highlights: string[];
};

export function AcademyProgressCard() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/academy/progress", {
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
        const json = (await res.json()) as ProgressResponse;
        setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load academy progress");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const completionPercent = useMemo(() => {
    if (!data) return 0;
    const { completed, total } = data.stats;
    return Math.round((completed / Math.max(1, total)) * 100);
  }, [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Academy Progress</CardTitle>
        <GraduationCap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading academy progress…
          </div>
        ) : unauthorized ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Sign in to view academy progress.
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Completion
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {completionPercent}% complete
                </Badge>
              </div>
              <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                <span>Completed: {data.stats.completed}</span>
                <span>In progress: {data.stats.inProgress}</span>
                <span>Recertify: {data.stats.expired}</span>
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Next session
                </span>
                {data.nextSession ? (
                  <Badge variant="outline" className="text-[10px]">
                    {data.nextSession.modality}
                  </Badge>
                ) : null}
              </div>
              {data.nextSession ? (
                <div className="flex items-start gap-3">
                  <CalendarClock className="h-4 w-4 text-muted-foreground mt-[2px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {data.nextSession.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(data.nextSession.start), {
                        addSuffix: true,
                      })}
                      {data.nextSession.instructorName
                        ? ` • ${data.nextSession.instructorName}`
                        : ""}
                    </span>
                    {(data.nextSession.waitlist ?? 0) > 0 ? (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400">
                        Waitlist: {data.nextSession.waitlist}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No upcoming sessions scheduled. Keep an eye on the academy board.
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs h-8"
                asChild
              >
                <a href="/academy" className="inline-flex items-center gap-1">
                  Go to Academy <ArrowRight className="h-3 w-3" />
                </a>
              </Button>
            </div>

            {data.highlights && data.highlights.length > 0 ? (
              <div className="rounded-md border p-3 space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Highlights
                </div>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {data.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No academy data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
