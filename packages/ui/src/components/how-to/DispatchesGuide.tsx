import { Callout } from "@workspace/ui/components/academy/Callout";
import { Button } from "@workspace/ui/components/button";

export default function DispatchesGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Dispatches</h2>
      <p>
        Browse active and recent dispatch submissions, then open a submission to coordinate. Each
        submission has tabs for overview, roles, updates, logistics, public engagement, and comms.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/dispatches">Open Dispatches</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/team-req">Create Team Request</a>
        </Button>
      </div>

      <h3>Dispatch List</h3>
      <ul>
        <li>Cards show location, status, state, roles needed, and intended actions.</li>
        <li>Newest items appear first; select any card to open its detail view.</li>
      </ul>

      <h3>Submission Detail</h3>
      <ul>
        <li>
          Overview: update location label/pin, intended actions, notes, and Signal link. Copy a
          summary or share a link.
        </li>
        <li>Roles: assign roles and counts, selecting from the active roster.</li>
        <li>Updates: add/edit/remove running notes and incident updates.</li>
        <li>Logistics: track needs with category, quantity, priority, status, and accountability.</li>
        <li>Public Engagement: plan or record outreach and comms.</li>
        <li>Comms: region‑specific radio/comms dashboard when available.</li>
      </ul>

      <h3>Creating Dispatches</h3>
      <ul>
        <li>
          Create from Watch using “Create Dispatch” on a report to prefill location and context.
        </li>
        <li>Or start a new request via Create → Team Requests.</li>
      </ul>

      <h3>Statuses</h3>
      <p>
        Dispatch status changes over time (e.g., unconfirmed, confirmed, mobilizing, in_progress,
        debriefing, completed, cancelled, expired, archived). Use status to communicate progress.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Coordinators and dispatchers typically update submissions. View access may be broader per
        region policy.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Open Dispatches and select a submission.</li>
        <li>Confirm location, set intended actions, and add an update.</li>
        <li>Assign roles and track logistics as the situation evolves.</li>
      </ol>

      <Callout type="info">Desktop offers more space for tabs and map tools.</Callout>
    </section>
  );
}
