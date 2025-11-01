"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { PageHeader } from '@workspace/ui/components/page-header';
import { FormSectionCard } from '@workspace/ui/components/form-section-card';
import { ErrorText, LoadingText, EmptyText } from '@workspace/ui/components/status-text';
import { safeErrorMessage } from '@workspace/ui/lib/http';
import { BugPrioritySelect, BugStatusSelect } from '@workspace/ui/components/admin/bug-report-selects';
import type { BugPriority, BugStatus } from '@workspace/ui/components/admin/bug-report-selects';

type Report = {
  id: string;
  created_at: string;
  created_by: string;
  title: string;
  area: string;
  steps?: string | null;
  expected?: string | null;
  actual?: string | null;
  status: BugStatus;
  priority?: BugPriority;
  metadata?: Record<string, any> | null;
};

export default function AdminBugReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/bug-reports/${id}`, { credentials: 'include', signal: controller.signal });
        if (!res.ok) throw new Error(await safeErrorMessage(res));
        const j = (await res.json()) as { report?: Report };
        if (!j.report) throw new Error('Not found');
        setReport(j.report);
        setError(null);
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    return () => controller.abort();
  }, [id]);

  const update = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const { id: _id, created_at: _a, created_by: _b, ...payload } = report;
      const res = await fetch(`/api/admin/bug-reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
      return;
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!report) return;
    if (!confirm('Delete this report?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bug-reports/${report.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      router.push('/admin/bug-reports');
    } catch (e: any) {
      setError(e?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingText />;
  if (error) return <ErrorText>{String(error)}</ErrorText>;
  if (!report) return <EmptyText>Not found</EmptyText>;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Bug Report"
        actions={
          <>
            <Button variant="secondary" onClick={() => router.push('/admin/bug-reports')}>Back</Button>
            <Button variant="destructive" onClick={remove} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</Button>
            <Button onClick={update} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      />

      <FormSectionCard
        title="Edit"
        description="Update status, priority, and details"
        contentClassName="grid gap-4 max-w-2xl"
      >
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={report.title} onChange={(e) => setReport({ ...report, title: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="area">Area</Label>
          <Input id="area" value={report.area} onChange={(e) => setReport({ ...report, area: e.target.value })} />
        </div>
        <BugStatusSelect value={report.status} onChange={(v) => setReport({ ...report, status: v })} />
        <BugPrioritySelect value={report.priority ?? null} onChange={(v) => setReport({ ...report, priority: v })} />
        <div className="grid gap-2">
          <Label htmlFor="steps">Steps to reproduce</Label>
          <Textarea id="steps" rows={4} value={report.steps ?? ''} onChange={(e) => setReport({ ...report, steps: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expected">Expected</Label>
          <Textarea id="expected" rows={3} value={report.expected ?? ''} onChange={(e) => setReport({ ...report, expected: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="actual">Actual</Label>
          <Textarea id="actual" rows={3} value={report.actual ?? ''} onChange={(e) => setReport({ ...report, actual: e.target.value })} />
        </div>
        <div className="text-xs text-muted-foreground">Reported: {new Date(report.created_at).toLocaleString()} · Reporter: {report.created_by.slice(0, 8)}…</div>
      </FormSectionCard>
    </section>
  );
}
