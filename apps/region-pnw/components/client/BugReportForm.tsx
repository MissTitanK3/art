"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";

export default function BugReportForm() {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("general");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [steps, setSteps] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <form
      className="space-y-4 border rounded-md p-4 bg-card"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);
        try {
          const res = await fetch('/api/bug-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, area, steps, expected, actual }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || `HTTP ${res.status}`);
          }
          setResult({ ok: true, message: 'Thanks! Your report was submitted.' });
          setTitle(""); setArea("general"); setSteps(""); setExpected(""); setActual("");
        } catch (err: any) {
          setResult({ ok: false, message: err?.message || 'Failed to submit bug report' });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Short summary (e.g., Watch map fails to load)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label>Area</Label>
        <Select value={area} onValueChange={(v) => setArea(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
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

      <div className="grid gap-2">
        <Label htmlFor="steps">Steps to reproduce</Label>
        <Textarea
          id="steps"
          placeholder="1. Go to ...\n2. Click ...\n3. See error ..."
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="expected">Expected behavior</Label>
        <Textarea
          id="expected"
          placeholder="What did you expect to happen?"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="actual">Actual behavior</Label>
        <Textarea
          id="actual"
          placeholder="What happened instead? Include any error messages."
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Report'}</Button>
        {result && (
          <span className={result.ok ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
            {result.message}
          </span>
        )}
      </div>
    </form>
  );
}
