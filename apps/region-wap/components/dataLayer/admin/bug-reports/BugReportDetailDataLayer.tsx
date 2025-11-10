"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { safeErrorMessage } from "@workspace/ui/lib/http";
import BugReportDetail, {
  type BugReport,
} from "@workspace/ui/components/admin/bug-reports/BugReportDetail";

export default function BugReportDetailDataLayer() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<BugReport | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/bug-reports/${id}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(await safeErrorMessage(res));
        const j = (await res.json()) as { report?: BugReport };
        if (!j.report) throw new Error("Not found");
        setReport(j.report);
        setError(null);
      } catch (e: unknown) {
        if (
          e &&
          typeof e === "object" &&
          "name" in e &&
          (e as any).name === "AbortError"
        )
          return;
        const message = e instanceof Error ? e.message : "Failed to load";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    return () => controller.abort();
  }, [id]);

  const onChange = React.useCallback((patch: Partial<BugReport>) => {
    setReport((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const onSave = React.useCallback(async () => {
    if (!report) return;
    setSaving(true);
    try {
      const payload = {
        title: report.title,
        area: report.area,
        steps: report.steps,
        expected: report.expected,
        actual: report.actual,
        status: report.status,
        priority: report.priority ?? null,
        metadata: report.metadata ?? null,
      };
      const res = await fetch(`/api/admin/bug-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save";
      setError(message);
      return;
    } finally {
      setSaving(false);
    }
  }, [report]);

  const onDelete = React.useCallback(async () => {
    if (!report) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/bug-reports/${report.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await safeErrorMessage(res));
      router.push("/admin/bug-reports");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to delete";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }, [report, router]);

  return (
    <BugReportDetail
      loading={loading}
      error={error}
      report={report}
      saving={saving}
      deleting={deleting}
      onBack={() => router.push("/admin/bug-reports")}
      onSave={onSave}
      onDelete={onDelete}
      onChange={onChange}
    />
  );
}
