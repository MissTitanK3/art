"use client";

import * as React from "react";
import type { DispatchSubmission } from "@workspace/store/types/global.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { toast } from "sonner";
import { Map, Table2, Archive, Flag, FlagOff } from "lucide-react";
import type { WizardReport } from "@workspace/store/types/watch.ts";
import { DISPATCH_TYPE_LABELS } from "@workspace/store/types/dispatch.ts";
import { safeErrorMessage } from "@workspace/ui/lib/http";

const WatchMap = React.lazy(() => import("@workspace/ui/components/client/watch/WatchMap"));

type Props = {
  initialItems: DispatchSubmission[];
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

const TYPE_OPTIONS = ["rapid_response", "planned_event", "training", "community_aid", "technical_aid", "other"] as const;

export default function DispatchClient({ initialItems, onToggleFlag }: Props) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string>("");
  const [type, setType] = React.useState<string>("");
  const [mapView, setMapView] = React.useState(false);
  const [rows, setRows] = React.useState<DispatchSubmission[]>(() => initialItems);

  // Keep local rows in sync when new data arrives from the data layer
  React.useEffect(() => {
    setRows(initialItems);
  }, [initialItems]);

  const filtered = React.useMemo(() => {
    return rows.filter((d) => {
      if (status && d.status !== status) return false;
      if (type && d.type !== type) return false;
      if (query) {
        const hay = [d.location_label ?? "", d.state ?? "", d.intended_action_notes ?? "", d.type ?? ""].join("\n").toLowerCase();
        if (!hay.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, status, type, query]);

  async function toggleFlag(id: string) {
    let nextFlag = false;
    setRows((prev) => prev.map((d) => {
      if (d.id === id) {
        const next = Boolean(!(d as any).flagged);
        nextFlag = next;
        return { ...d, flagged: next } as any;
      }
      return d;
    }));
    onToggleFlag?.(id, nextFlag);
    try {
      const res = await fetch(`/api/admin/dispatches/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagged: nextFlag }),
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      toast.success(nextFlag ? 'Flagged for review' : 'Flag removed');
    } catch (e: any) {
      toast.error(e?.message ?? 'Update failed');
    }
  }

  async function archive(id: string) {
    setRows((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'archived' } : d)));
    try {
      const res = await fetch(`/api/admin/dispatches/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      toast.success('Dispatch archived');
    } catch (e: any) {
      toast.error(e?.message ?? 'Archive failed');
    }
  }

  // AAR export hidden/back-burner

  const { reports, idMap } = React.useMemo(() => {
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
    reps.forEach((r, idx) => { map[r.id] = filtered[idx]!.id; });
    return { reports: reps, idMap: map };
  }, [filtered]);

  const handleView = (r: WizardReport) => {
    const dispatchId = idMap[r.id];
    if (dispatchId && typeof window !== 'undefined') {
      window.location.href = `/dispatches/submission/${dispatchId}`;
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatch Oversight</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setMapView((v) => !v)}>
            {mapView ? <><Table2 className="h-4 w-4 mr-2" /> Table</> : <><Map className="h-4 w-4 mr-2" /> Map</>}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Dispatch Activity</CardTitle>
          <CardDescription>Filter by status, type, and keyword. Actions persist to the database.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location, notes, state..."
              className="w-[260px]"
            />
            <Select value={status || undefined} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type || undefined} onValueChange={(v) => setType(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{DISPATCH_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mapView ? (
            <div className="h-[500px] overflow-hidden rounded-md border">
              <React.Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading map…</div>}>
                <WatchMap
                  reports={reports}
                  className="h-full"
                  actionMode="view"
                  onViewDispatch={handleView}
                />
              </React.Suspense>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Training</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => {
                    const flagged = Boolean((d as any).flagged);
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="whitespace-nowrap">{new Date(d.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.type ? DISPATCH_TYPE_LABELS[d.type] : 'Other'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{d.status}</span>
                            {flagged ? <Badge variant="secondary">Flagged</Badge> : null}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[240px] truncate">{d.location_label ?? ''}</TableCell>
                        <TableCell>{d.state ?? ''}</TableCell>
                        <TableCell>{d.training ? <Badge variant="outline">Training</Badge> : ''}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <a target="_blank" rel="noreferrer" href={`/dispatches/submission/${d.id}`}>View</a>
                            </Button>
                            <Button size="sm" variant={flagged ? "outline" : "secondary"} onClick={() => toggleFlag(d.id)}>
                              {flagged ? <><FlagOff className="h-4 w-4 mr-2" /> Unflag</> : <><Flag className="h-4 w-4 mr-2" /> Flag</>}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => archive(d.id)}>
                              <Archive className="h-4 w-4 mr-2" /> Archive
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
