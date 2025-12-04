"use client";
import { useState } from "react";
import { PageHeader } from "@workspace/ui/patterns/common/page-header";
import { FormSectionCard } from "@workspace/ui/patterns/common/form-section-card";
import { Input } from "@workspace/ui/primitives/input";
import { Label } from "@workspace/ui/primitives/label";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Button } from "@workspace/ui/primitives/button";
import {
  ErrorText,
  LoadingText,
  EmptyText,
} from "@workspace/ui/patterns/common/status-text";
import {
  BugPrioritySelect,
  BugStatusSelect,
} from "@workspace/ui/patterns/features/admin/bug-report-selects";
import type {
  BugPriority,
  BugStatus,
} from "@workspace/ui/patterns/features/admin/bug-report-selects";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog";
export type BugReport = {
  id: string;
  created_at: string;
  created_by: string;
  title: string;
  area: string;
  steps?: string | null;
  expected?: string | null;
  actual?: string | null;
  status: BugStatus;
  priority?: BugPriority | null;
  metadata?: Record<string, unknown> | null;
};
export interface BugReportDetailProps {
  loading?: boolean;
  error?: string | null;
  report: BugReport | null;
  saving?: boolean;
  deleting?: boolean;
  onBack: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<BugReport>) => void;
}
export function BugReportDetail({
  loading,
  error,
  report,
  saving,
  deleting,
  onBack,
  onSave,
  onDelete,
  onChange,
}: BugReportDetailProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  if (loading) return <LoadingText />;
  if (error) return <ErrorText>{String(error)}</ErrorText>;
  if (!report) return <EmptyText>Not found</EmptyText>;
  return (
    <section className="space-y-6">
      <PageHeader
        title="Bug Report"
        actions={
          <>
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              disabled={!!deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
            <Button onClick={onSave} disabled={!!saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
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
          <Input
            id="title"
            value={report.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="area">Area</Label>
          <Input
            id="area"
            value={report.area}
            onChange={(e) => onChange({ area: e.target.value })}
          />
        </div>
        <BugStatusSelect
          value={report.status}
          onChange={(v) => onChange({ status: v })}
        />
        <BugPrioritySelect
          value={report.priority ?? null}
          onChange={(v) => onChange({ priority: v })}
        />
        <div className="grid gap-2">
          <Label htmlFor="steps">Steps to reproduce</Label>
          <Textarea
            id="steps"
            rows={4}
            value={report.steps ?? ""}
            onChange={(e) => onChange({ steps: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expected">Expected</Label>
          <Textarea
            id="expected"
            rows={3}
            value={report.expected ?? ""}
            onChange={(e) => onChange({ expected: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="actual">Actual</Label>
          <Textarea
            id="actual"
            rows={3}
            value={report.actual ?? ""}
            onChange={(e) => onChange({ actual: e.target.value })}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Reported: {new Date(report.created_at).toLocaleString()} · Reporter:{" "}
          {report.created_by.slice(0, 8)}…
        </div>
      </FormSectionCard>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>Delete Bug Report</DialogTitle>
            <DialogDescription>
              This will permanently delete this bug report. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>Title: {report.title}</div>
            <div>ID: {report.id}</div>
          </div>
          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                disabled={!!deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setDeleteOpen(false);
                  onDelete();
                }}
                disabled={!!deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
export default BugReportDetail;
