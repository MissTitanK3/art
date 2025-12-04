import { Button } from "@workspace/ui/primitives/button";

export function AdminDispatchGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Admin – Dispatch</h2>
      <p>
        Review and manage dispatch activity across the region. Filter by status
        and type, switch between a tabular list and map view, and take quick
        actions like flagging or archiving items. Use this to audit trends and
        jump into specific submissions.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/admin/dispatch">Open Dispatch Admin</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/admin">Back to Admin</a>
        </Button>
      </div>

      <h3>Overview</h3>
      <ul>
        <li>
          All dispatches listed with time, type, status, label, state, and
          training tag.
        </li>
        <li>
          Toggle Map/Table views to analyze spatial patterns or scan details.
        </li>
        <li>
          Open the submission detail to review the full report and timeline.
        </li>
      </ul>

      <h3>Filters</h3>
      <ul>
        <li>Search by keyword across location label, state, and notes.</li>
        <li>
          Filter by Status: preplanning, unconfirmed, confirmed, mobilizing,
          in_progress, debriefing, completed, cancelled, expired, archived.
        </li>
        <li>
          Filter by Type: Rapid Response, Planned Event, Training, Community
          Aid, Technical Aid, Other.
        </li>
      </ul>

      <h3>Map vs Table</h3>
      <ul>
        <li>
          Map view shows recent items geographically; click to view a
          submission.
        </li>
        <li>
          Table view supports inline actions and quick scanning with badges.
        </li>
      </ul>

      <h3>Actions</h3>
      <ul>
        <li>
          Flag/Unflag: mark items needing follow‑up; persists via admin API when
          available.
        </li>
        <li>
          Archive: move completed/expired items out of active views; updates
          status to archived.
        </li>
        <li>
          View: open the full dispatch submission in a new tab for deep review.
        </li>
      </ul>

      <h3>Statuses</h3>
      <p>
        Dispatches progress through operational states. Use status filters to
        focus reviews and keep active queues clean. Training items are
        explicitly labeled and can be excluded by context.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Admin roles (dispatcher_admin, regional_admin, national_admin, admin)
        can access and act on this view. Use Pods and Dispatches pages for
        non‑admin participation.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Filter to in_progress and mobilizing to review live activity.</li>
        <li>Flag outliers or incidents needing follow‑up or policy review.</li>
        <li>Open submissions to verify details and ensure proper routing.</li>
        <li>Archive stale or completed items to keep queues focused.</li>
      </ol>
    </section>
  );
}
