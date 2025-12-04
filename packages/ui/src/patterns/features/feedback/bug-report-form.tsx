"use client";
import { useState } from "react";
import { Input } from "@workspace/ui/primitives/input";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { Label } from "@workspace/ui/primitives/label";
import { Button } from "@workspace/ui/primitives/button";
import {
  BugAreaSelect,
  type BugArea,
} from "@workspace/ui/patterns/features/admin/bug-report-selects";
import { safeErrorMessage } from "@workspace/ui/lib/http";
import { cn } from "@workspace/ui/lib/utils";
export type BugReportPayload = {
  title: string;
  area: BugArea;
  steps?: string;
  expected?: string;
  actual?: string;
};
type Props = {
  onSubmit?: (payload: BugReportPayload) => void | Promise<unknown>;
  endpoint?: string; // if provided (or defaults), performs fetch when onSubmit is not passed
  successMessage?: string;
  className?: string;
  initialArea?: BugArea;
};
export function BugReportForm({
  onSubmit,
  endpoint = "/api/bug-reports",
  successMessage = "Thanks! Your report was submitted.",
  className,
  initialArea = "general",
}: Props) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<BugArea>(initialArea);
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [steps, setSteps] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const payload: BugReportPayload = { title, area, steps, expected, actual };
    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else if (endpoint) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await safeErrorMessage(res));
      }
      setResult({ ok: true, message: successMessage });
      setTitle("");
      setArea(initialArea);
      setSteps("");
      setExpected("");
      setActual("");
    } catch (err: any) {
      setResult({
        ok: false,
        message: err?.message || "Failed to submit bug report",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form
      className={cn("space-y-4 border rounded-md p-4 bg-card", className)}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <Label htmlFor="bug-title">Title</Label>
        <Input
          id="bug-title"
          placeholder="Short summary (e.g., Watch map fails to load)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <BugAreaSelect
        value={area}
        onChange={(v) => setArea((v ?? initialArea) as BugArea)}
        label="Area"
        includeAll={false}
        srOnlyLabel={false}
        className="min-w-full"
        triggerClassName="w-full"
      />

      <div className="grid gap-2">
        <Label htmlFor="bug-steps">Steps to reproduce</Label>
        <Textarea
          id="bug-steps"
          placeholder={"1. Go to ...\n2. Click ...\n3. See error ..."}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bug-expected">Expected behavior</Label>
        <Textarea
          id="bug-expected"
          placeholder="What did you expect to happen?"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bug-actual">Actual behavior</Label>
        <Textarea
          id="bug-actual"
          placeholder="What happened instead? Include any error messages."
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Report"}
        </Button>
        {result && (
          <span
            className={
              result.ok ? "text-green-600 text-sm" : "text-red-600 text-sm"
            }
          >
            {result.message}
          </span>
        )}
      </div>
    </form>
  );
}
export default BugReportForm;
