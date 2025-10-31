"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';

type ReportRow = {
  id: string;
  created_at: string;
  created_by: string;
  title: string;
  area: string;
  status: string;
  priority: string | null;
};

export default function AdminBugReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [area, setArea] = useState<string | undefined>(undefined);
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
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bug Reports</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter by status and area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="min-w-48">
              <Select onValueChange={(v) => setStatus(v === 'all' ? undefined : v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="triage">Triage</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-48">
              <Select onValueChange={(v) => setArea(v === 'all' ? undefined : v)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="dispatches">Dispatch Map</SelectItem>
                  <SelectItem value="watch">Community Watch</SelectItem>
                  <SelectItem value="schedules">Coverage Schedules</SelectItem>
                  <SelectItem value="pods">Pods</SelectItem>
                  <SelectItem value="academy">Academy</SelectItem>
                  <SelectItem value="intents">Intents</SelectItem>
                  <SelectItem value="roles">Roles</SelectItem>
                  <SelectItem value="impact">Impact</SelectItem>
                  <SelectItem value="missing-persons">Missing Persons</SelectItem>
                  <SelectItem value="profile">My Profile</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="auth">Auth / Sign-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button className="text-sm underline text-muted-foreground" onClick={() => { setStatus(undefined); setArea(undefined); }}>
              Reset
            </button>
          </div>
        </CardContent>
      </Card>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading && <div className="text-muted-foreground text-sm">Loading…</div>}

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
                          {r.priority ? (
                            r.priority === 'critical' ? (
                              <Badge variant="destructive">Critical</Badge>
                            ) : r.priority === 'high' ? (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">High</Badge>
                            ) : r.priority === 'medium' ? (
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">Medium</Badge>
                            ) : (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Low</Badge>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
          <div className="text-muted-foreground text-sm">No reports found.</div>
        )}
      </div>
    </section>
  );
}
