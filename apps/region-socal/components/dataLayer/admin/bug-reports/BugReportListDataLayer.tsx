"use client";

import * as React from "react";
import { safeErrorMessage } from "@workspace/ui/lib/http";
import BugReportList, {
  type BugReportRow,
} from "@workspace/ui/components/admin/bug-reports/BugReportList";
import type {
  BugArea,
  BugStatus,
} from "@workspace/ui/components/admin/bug-report-selects";

export default function BugReportListDataLayer() {
  const [rows, setRows] = React.useState<BugReportRow[]>([]);
  const [status, setStatus] = React.useState<BugStatus | undefined>(undefined);
  const [area, setArea] = React.useState<BugArea | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<
    "created_at" | "priority" | "status" | "title"
  >("created_at");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const load = React.useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (area) params.set("area", area);
        if (sortBy) params.set("sort", sortBy);
        if (sortDir) params.set("dir", sortDir);
        const res = await fetch(`/api/admin/bug-reports?${params.toString()}`, {
          credentials: "include",
          signal,
        });
        if (!res.ok) throw new Error(await safeErrorMessage(res));
        const j = (await res.json()) as { reports?: BugReportRow[] };
        const arr = Array.isArray(j.reports) ? j.reports : [];
        // client-side sort fallback
        const sorted = [...arr].sort((a, b) => {
          let av: any;
          let bv: any;
          switch (sortBy) {
            case "created_at":
              av = new Date(a.created_at).getTime();
              bv = new Date(b.created_at).getTime();
              break;
            case "priority": {
              const order: Record<string, number> = {
                critical: 3,
                high: 2,
                medium: 1,
                low: 0,
              };
              av = order[a.priority || "low"] || 0;
              bv = order[b.priority || "low"] || 0;
              break;
            }
            case "status":
              av = a.status;
              bv = b.status;
              break;
            case "title":
              av = a.title.toLowerCase();
              bv = b.title.toLowerCase();
              break;
          }
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
        setRows(sorted);
      } catch (e: unknown) {
        if (
          e &&
          typeof e === "object" &&
          "name" in e &&
          (e as any).name === "AbortError"
        )
          return;
        const message =
          e instanceof Error ? e.message : "Failed to load reports";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [status, area, sortBy, sortDir],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [status, area, sortBy, sortDir, load]);

  return (
    <BugReportList
      rows={rows}
      loading={loading}
      error={error}
      status={status}
      area={area}
      onStatusChange={setStatus}
      onAreaChange={setArea}
      sortBy={sortBy}
      sortDir={sortDir}
      onSortByChange={setSortBy}
      onSortDirChange={setSortDir}
    />
  );
}
