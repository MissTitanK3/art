"use client";
import { Suspense, lazy, useEffect, useMemo, useState, useCallback } from "react";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import {
  SortableTable,
  useSortableData,
  type Column,
} from "@workspace/ui/patterns/common/sortable-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { Badge } from "@workspace/ui/primitives/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import { Input } from "@workspace/ui/primitives/input";
import { toast } from "sonner";
import { Map, Table2, Archive, Flag, FlagOff } from "lucide-react";
import type { WizardReport } from "@workspace/store/types/watch.ts";
import { DISPATCH_TYPE_LABELS } from "@workspace/store/types/dispatch.ts";
import { safeErrorMessage } from "@workspace/ui/lib/http";
const WatchMap = lazy(
  () => import("@workspace/ui/patterns/features/watch/watch-map")
);
type Props = {
  initialItems: DispatchSubmission[];
  totalItems?: number;
  onToggleFlag?: (id: string, flagged: boolean) => void;
};
const STATUS_OPTIONS: DispatchSubmission["status"][] = [
  "preplanning",
  "unconfirmed",
  "confirmed",
  "mobilizing",
  "in_progress",
  "debriefing",
  "completed",
  "cancelled",
  "expired",
  "archived",
];
const TYPE_OPTIONS = [
  "rapid_response",
  "planned_event",
  "training",
  "community_aid",
  "technical_aid",
  "other",
] as const;
export default function DispatchClient({ initialItems, totalItems, onToggleFlag }: Props) {
  const [query, setQuery] = useState("");
  const [totalCount, setTotalCount] = useState(totalItems);
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [mapView, setMapView] = useState(false);
  const [rows, setRows] = useState<DispatchSubmission[]>(() => initialItems);
  // Keep local rows in sync when new data arrives from the data layer
  useEffect(() => {
    setRows(initialItems);
  }, [initialItems]);
  const filtered = useMemo(() => {
    if (typeof totalItems === "number") return rows;
    return rows.filter((d) => {
      if (status && d.status !== status) return false;
      if (type && d.type !== type) return false;
      if (query) {
        const hay = [
          d.location_label ?? "",
          d.state ?? "",
          d.intended_action_notes ?? "",
          d.type ?? "",
        ]
          .join("\n")
          .toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, status, type, query, totalItems]);
  const toggleFlag = useCallback(
    async (id: string) => {
      let nextFlag = false;
      setRows((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            const next = Boolean(!(d as any).flagged);
            nextFlag = next;
            return { ...d, flagged: next } as any;
          }
          return d;
        }),
      );
      onToggleFlag?.(id, nextFlag);
      try {
        const res = await fetch(
          `/api/admin/dispatches/${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flagged: nextFlag }),
          },
        );
        if (!res.ok) throw new Error(await safeErrorMessage(res));
        toast.success(nextFlag ? "Flagged for review" : "Flag removed");
      } catch (e: any) {
        toast.error(e?.message ?? "Update failed");
      }
    },
    [onToggleFlag],
  );

  const archive = useCallback(async (id: string) => {
    setRows((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "archived" } : d)),
    );
    try {
      const res = await fetch(
        `/api/admin/dispatches/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "archived" }),
        },
      );
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      toast.success("Dispatch archived");
    } catch (e: any) {
      toast.error(e?.message ?? "Archive failed");
    }
  }, []);
  const columns = useMemo<Column<DispatchSubmission>[]>(
    () => [
      {
        header: "Time",
        accessorKey: "timestamp",
        sortable: true,
        className: "whitespace-nowrap",
        cell: (d) => new Date(d.timestamp).toLocaleString(),
      },
      {
        header: "Type",
        accessorKey: "type",
        sortable: true,
        cell: (d) => (
          <Badge variant="outline">
            {d.type ? DISPATCH_TYPE_LABELS[d.type] : "Other"}
          </Badge>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        sortable: true,
        cell: (d) => {
          const flagged = Boolean((d as any).flagged);
          return (
            <div className="flex items-center gap-2">
              <span>{d.status}</span>
              {flagged ? <Badge variant="secondary">Flagged</Badge> : null}
            </div>
          );
        },
      },
      {
        header: "Label",
        accessorKey: "location_label",
        sortable: true,
        className: "max-w-[240px] truncate",
      },
      {
        header: "State",
        accessorKey: "state",
        sortable: true,
      },
      {
        header: "Training",
        accessorKey: "training",
        sortable: true,
        cell: (d) =>
          d.training ? <Badge variant="outline">Training</Badge> : "",
      },
      {
        header: "Actions",
        id: "actions",
        className: "text-right",
        cell: (d) => {
          const flagged = Boolean((d as any).flagged);
          return (
            <div className="inline-flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`/dispatches/submission/${d.id}`}
                >
                  View
                </a>
              </Button>
              <Button
                size="sm"
                variant={flagged ? "outline" : "secondary"}
                onClick={() => toggleFlag(d.id)}
              >
                {flagged ? (
                  <>
                    <FlagOff className="h-4 w-4 mr-2" /> Unflag
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4 mr-2" /> Flag
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => archive(d.id)}
              >
                <Archive className="h-4 w-4 mr-2" /> Archive
              </Button>
            </div>
          );
        },
      },
    ],
    [toggleFlag, archive],
  );

  const {
    sortedData: sorted,
    paginatedData,
    sortConfig,
    toggleSort,
    currentPage,
    totalPages,
    setCurrentPage,
    pageSize,
    setPageSize,
  } = useSortableData(filtered, columns, undefined, undefined, totalCount);

  useEffect(() => {
    if (typeof totalItems === "number") {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("pageSize", pageSize.toString());

      fetch(`/api/admin/dispatches?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.submissions) {
            setRows(data.submissions);
            setTotalCount(data.count);
          }
        })
        .catch(() => toast.error("Failed to load dispatches"));
    }
  }, [currentPage, pageSize, totalItems]);

  // AAR export hidden/back-burner
  const { reports, idMap } = useMemo(() => {
    const map: Record<number, string> = {};
    const reps: WizardReport[] = filtered.map((d, i) => ({
      id: i + 1,
      timestamp: d.timestamp,
      agency_type: d.type ? [d.type] : null,
      agency_other: d.type ?? null,
      location: d.location as any,
      media_url: null,
      officer_moving: null,
      officer_direction: null,
      lights_on: null,
      sirens_on: null,
      submitted_by: d.submitted_by ?? null,
      test: d.training ?? null,
    }));
    reps.forEach((r, idx) => {
      map[r.id] = filtered[idx]!.id;
    });
    return { reports: reps, idMap: map };
  }, [filtered]);
  const handleView = (r: WizardReport) => {
    const dispatchId = idMap[r.id];
    if (dispatchId && typeof window !== "undefined") {
      window.location.href = `/dispatches/submission/${dispatchId}`;
    }
  };
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatch Oversight</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMapView((v) => !v)}
          >
            {mapView ? (
              <>
                <Table2 className="h-4 w-4 mr-2" /> Table
              </>
            ) : (
              <>
                <Map className="h-4 w-4 mr-2" /> Map
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Dispatch Activity</CardTitle>
          <CardDescription>
            Filter by status, type, and keyword. Actions persist to the
            database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location, notes, state..."
              className="w-[260px]"
            />
            <Select
              value={status || undefined}
              onValueChange={(v) => setStatus(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={type || undefined}
              onValueChange={(v) => setType(v === "all" ? "" : v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {DISPATCH_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mapView ? (
            <div className="h-[500px] overflow-hidden rounded-md border">
              <Suspense
                fallback={
                  <div className="p-4 text-sm text-muted-foreground">
                    Loading map…
                  </div>
                }
              >
                <WatchMap
                  reports={reports}
                  className="h-full"
                  actionMode="view"
                  onViewDispatch={handleView}
                />
              </Suspense>
            </div>
          ) : (
            <SortableTable
              data={paginatedData}
              columns={columns}
              sortConfig={sortConfig}
              onSort={toggleSort}
              keyExtractor={(d) => d.id}
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
                pageSize,
                onPageSizeChange: setPageSize,
              }}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
