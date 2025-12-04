import { Button } from "@workspace/ui/primitives/button";

export function AdminTrainingGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Admin – Training</h2>
      <p>
        View regional training sessions at a glance. Filter by status and
        modality, search by title/instructor/topic, and review seat utilization.
        Management actions happen in the Academy hub; this view is read‑only for
        oversight.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/admin/training">Open Training Admin</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/admin">Back to Admin</a>
        </Button>
      </div>

      <h3>Overview</h3>
      <ul>
        <li>
          Sessions list shows title, schedule, modality, instructor, seats, and
          status.
        </li>
        <li>
          Seat summary displays confirmed capacity and waitlist when applicable.
        </li>
        <li>
          Statuses include scheduled, in_progress, completed, and archived.
        </li>
      </ul>

      <h3>Filters & Search</h3>
      <ul>
        <li>
          Search across title, location, instructor name, and related topic.
        </li>
        <li>Filter by Status: scheduled, in_progress, completed, archived.</li>
        <li>Filter by Modality: online, in_person, hybrid.</li>
      </ul>

      <h3>Data Source</h3>
      <p>
        Sessions hydrate from the regional database (Supabase). If not
        configured, demo data will render so admins can still explore the
        interface.
      </p>

      <h3>Manage in Academy</h3>
      <p>
        Create or edit classes and sessions, assign instructors, and manage
        participants from the Academy hub. Use Admin → Training for reporting
        and visibility across the region.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Admin roles (dispatcher_admin, regional_admin, national_admin, admin)
        can view training across the region. Instructors and coordinators manage
        details in Academy.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Filter to in_progress to monitor live sessions.</li>
        <li>Scan for sessions near capacity or large waitlists.</li>
        <li>Open Academy to adjust schedule or add capacity if needed.</li>
        <li>Review completed sessions for coverage and follow‑ups.</li>
      </ol>
    </section>
  );
}
