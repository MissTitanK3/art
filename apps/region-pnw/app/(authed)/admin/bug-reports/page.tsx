"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { PageHeader } from '@workspace/ui/components/page-header';
import { LoadingText, ErrorText, EmptyText } from '@workspace/ui/components/status-text';
import { safeErrorMessage } from '@workspace/ui/lib/http';
import { BugAreaSelect, BugStatusFilterSelect } from '@workspace/ui/components/admin/bug-report-selects';
import type { BugArea, BugPriority, BugStatus } from '@workspace/ui/components/admin/bug-report-selects';
import { BugPriorityBadge } from '@workspace/ui/components/admin/bug-report-badges';

type ReportRow = {
  id: string;
  created_at: string;
  created_by: string;
  title: string;
  area: BugArea;
  status: BugStatus;
  priority: BugPriority;
};

export default function AdminBugReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState<BugStatus | undefined>(undefined);
  const [area, setArea] = useState<BugArea | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (area) params.set('area', area);
      const res = await fetch(`/api/admin/bug-reports?${params.toString()}`, { credentials: 'include', signal });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      const j = (await res.json()) as { reports?: ReportRow[] };
      setRows(Array.isArray(j.reports) ? j.reports : []);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [status, area]);

  const grouped = useMemo(() => {
    const map = new Map<string, ReportRow[]>();
    for (const r of rows) {
      const key = r.status || 'open';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [rows]);

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
            <BugStatusFilterSelect value={status} onChange={setStatus} />
            <BugAreaSelect value={area} onChange={setArea} />
            <button className="text-sm underline text-muted-foreground" onClick={() => { setStatus(undefined); setArea(undefined); }}>
              Reset
            </button>
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
                <span className="capitalize">{stat.replace('_', ' ')}</span>
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
                      <tr key={r.id} className="border-t border-muted/50 hover:bg-muted/40 transition-colors">
                        <td className="py-2 pr-4 align-top font-medium">
                          <a className="text-blue-600 hover:underline" href={`/admin/bug-reports/${r.id}`}>{r.title}</a>
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
                          <span className="font-mono text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                        </td>
                        <td className="py-2 pr-4 align-top">
                          <span className="font-mono text-xs text-muted-foreground">{r.created_by.slice(0, 8)}…</span>
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
