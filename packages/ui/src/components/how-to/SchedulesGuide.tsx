import { Button } from "@workspace/ui/components/button";

export default function SchedulesGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Coverage Schedules</h2>
      <p>
        Plan, review, and update dispatch coverage across pods. See active,
        upcoming, and all shifts; add new coverage; and assign volunteers from a
        pod roster or record an unlisted volunteer.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/schedules">Open Schedules</a>
        </Button>
      </div>

      <h3>Tabs</h3>
      <ul>
        <li>Active: shifts currently in progress (with “Active” badge).</li>
        <li>Upcoming: future shifts sorted by start time.</li>
        <li>All: every shift for quick scanning and edits.</li>
      </ul>

      <h3>Add Shift</h3>
      <ul>
        <li>Use New Shift to open the drawer.</li>
        <li>Select Pod, set start/end times, and add notes.</li>
        <li>
          Optional volunteer: choose from the pod’s roster, or pick “Unlisted
          volunteer” to type a name and optional identifier.
        </li>
      </ul>

      <h3>Edit or Delete</h3>
      <ul>
        <li>Edit opens a drawer to change pod, volunteer, timing, or notes.</li>
        <li>Delete removes a shift after confirmation.</li>
        <li>Status badges: Active, Upcoming/Starts in 1h, or Ended.</li>
      </ul>

      <h3>Roster Integration</h3>
      <ul>
        <li>
          When a pod is selected, members are fetched for that pod to populate
          the volunteer list.
        </li>
        <li>
          Volunteer selection maps roster entry to a profile for accurate
          attribution in reports.
        </li>
      </ul>

      <h3>Data Source</h3>
      <p>
        Shifts read and write to the regional database when configured
        (Supabase). If unavailable, shifts operate from the local store so you
        can still prototype scheduling flows.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Coordinators, pod leaders, or admins typically create and manage shifts.
        Regions can set stricter policies as needed.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Open Schedules and check Active coverage.</li>
        <li>Add a New Shift for the appropriate pod.</li>
        <li>Assign a rostered or unlisted volunteer if known.</li>
        <li>Update timing/notes as plans change; delete stale shifts.</li>
      </ol>
    </section>
  );
}
