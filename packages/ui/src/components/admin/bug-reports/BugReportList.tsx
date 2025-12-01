"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../card";
import { Badge } from "../../badge";
import { PageHeader } from "../../page-header";
import { LoadingText, ErrorText, EmptyText } from "../../status-text";
import { BugAreaSelect, BugStatusFilterSelect } from "../bug-report-selects";
import type { BugArea, BugPriority, BugStatus } from "../bug-report-selects";
import { BugPriorityBadge } from "../bug-report-badges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";

export type BugReportRow = {
  id: string;
  created_at: string;
  created_by: string;
  created_by_email?: string | null;
  reporter_username?: string | null;
  title: string;
  area: BugArea;
  status: BugStatus;
  priority: BugPriority;
};

export interface BugReportListProps {
  rows: BugReportRow[];
  loading?: boolean;
  error?: string | null;
  status?: BugStatus | undefined;
  area?: BugArea | undefined;
  onStatusChange: (s: BugStatus | undefined) => void;
  onAreaChange: (a: BugArea | undefined) => void;
  sortBy: "created_at" | "priority" | "status" | "title";
  sortDir: "asc" | "desc";
  onSortByChange: (v: "created_at" | "priority" | "status" | "title") => void;
  onSortDirChange: (v: "asc" | "desc") => void;
}

export function BugReportList({
  rows,
  loading,
  error,
  status,
  area,
  onStatusChange,
  onAreaChange,
  sortBy,
  sortDir,
  onSortByChange,
  onSortDirChange,
}: BugReportListProps) {
  const grouped = React.useMemo(() => {
    const map = new Map<string, BugReportRow[]>();
    for (const r of rows) {
      const key = r.status || "open";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    // sort items in each group according to sortBy/sortDir
    const priorityOrder: Record<string, number> = {
      critical: 3,
      high: 2,
      medium: 1,
      low: 0,
    };
    const compare = (a: BugReportRow, b: BugReportRow) => {
      let av: any;
      let bv: any;
      switch (sortBy) {
        case "created_at":
          av = new Date(a.created_at).getTime();
          bv = new Date(b.created_at).getTime();
          break;
        case "priority":
          av = priorityOrder[a.priority || "low"] || 0;
          bv = priorityOrder[b.priority || "low"] || 0;
          break;
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
    };
    return Array.from(map.entries()).map(
      ([k, arr]) => [k, arr.slice().sort(compare)] as const
    );
  }, [rows, sortBy, sortDir]);

  return (
    <section className="space-y-6">
      <PageHeader title="Bug Reports" />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter by status and area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            <BugStatusFilterSelect value={status} onChange={onStatusChange} />
            <BugAreaSelect value={area} onChange={onAreaChange} />
            <button
              className="text-sm underline text-muted-foreground"
              onClick={() => {
                onStatusChange(undefined);
                onAreaChange(undefined);
              }}
            >
              Reset
            </button>
            <div className="ml-auto flex gap-2 items-center">
              <div className="text-sm text-muted-foreground">Sort</div>
              <Select
                value={sortBy}
                onValueChange={(v) => onSortByChange(v as any)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortDir}
                onValueChange={(v) => onSortDirChange(v as any)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <ErrorText>{error}</ErrorText>}
      {loading && <LoadingText />}

      <div className="grid gap-4">
        {grouped.map(([stat, items]) => (
          <Card key={stat}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="capitalize">{stat.replace("_", " ")}</span>
                <Badge variant="secondary">{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-2 pr-4">Title</th>
                      <th className="py-2 pr-4">Area</th>
                      <th className="py-2 pr-4">Priority</th>
                      <th className="py-2 pr-4">Created</th>
                      <th className="py-2 pr-4">Reporter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-muted/50 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-2 pr-4 align-top font-medium">
                          <a
                            className="text-blue-600 hover:underline"
                            href={`/admin/bug-reports/${r.id}`}
                          >
                            {r.title}
                          </a>
                        </td>
                        <td className="py-2 pr-4 align-top">
                          <Badge variant="outline" className="capitalize">
                            {r.area}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 align-top">
                          <BugPriorityBadge priority={r.priority} />
                        </td>
                        <td className="py-2 pr-4 align-top">
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 pr-4 align-top">
                          {r.reporter_username ? (
                            <div className="flex flex-col text-sm">
                              <span className="font-medium">
                                {r.reporter_username}
                              </span>
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {r.created_by.slice(0, 8)}…
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">
                              {r.created_by.slice(0, 8)}…
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && !loading && !error && (
          <EmptyText>No reports found.</EmptyText>
        )}
      </div>
    </section>
  );
}

export default BugReportList;
