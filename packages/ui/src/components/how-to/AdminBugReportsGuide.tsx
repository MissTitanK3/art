import { Button } from "@workspace/ui/components/button";

export default function AdminBugReportsGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Admin – Bug Reports</h2>
      <p>
        Triage and manage bug reports submitted by users. Filter, review details, set status and
        priority, and keep records up to date as fixes ship.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/admin/bug-reports">Open Bug Reports</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/admin">Back to Admin</a>
        </Button>
      </div>

      <h3>Overview</h3>
      <ul>
        <li>List of all reports with title, area, priority, created time, reporter.</li>
        <li>Grouped by status for quick scanning and triage.</li>
        <li>Click a report to open details and edit.</li>
      </ul>

      <h3>Filters</h3>
      <ul>
        <li>Filter by Status: open, triage, in_progress, resolved, closed.</li>
        <li>
          Filter by Area: general, create, dispatches, watch, schedules, pods, academy, intents,
          roles, impact, missing-persons, profile, admin, auth.
        </li>
        <li>Use Reset to clear filters and reload all results.</li>
      </ul>

      <h3>Triage Workflow</h3>
      <ul>
        <li>
          Open → Triage: verify reproduction steps, add expected/actual, assign a priority.
        </li>
        <li>In Progress: work acknowledged; linked to an active fix.</li>
        <li>Resolved: fix deployed and verified; keep for short time.</li>
        <li>Closed: archival state or invalid/duplicate after review.</li>
      </ul>

      <h3>Status & Priority</h3>
      <ul>
        <li>Status values: open, triage, in_progress, resolved, closed.</li>
        <li>Priority values: none, low, medium, high, critical.</li>
        <li>
          Critical and High render with distinct badges in the list for visibility.
        </li>
      </ul>

      <h3>View & Edit Reports</h3>
      <ul>
        <li>
          Detail page fields: title, area, status, priority, steps to reproduce, expected, actual.
        </li>
        <li>Use Save to persist updates; Back to return to the list.</li>
        <li>
          Delete removes a report permanently; confirm only when duplicates/spam or migrated.
        </li>
        <li>
          Metadata includes created time and reporter id (partial for privacy) for follow‑ups.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Admin roles manage triage and editing. Non‑admins should use the user‑facing Bug Tracker to
        submit reports.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Apply filters to your area and scan new Open reports.</li>
        <li>Move valid items to Triage and set a priority.</li>
        <li>Add clear steps, expected, and actual behavior to aid fixes.</li>
        <li>Mark In Progress when a fix is underway.</li>
        <li>Verify and mark Resolved, then Close after a short window.</li>
      </ol>
    </section>
  );
}
