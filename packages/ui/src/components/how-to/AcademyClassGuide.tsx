import { Button } from "@workspace/ui/components/button";

export default function AcademyClassGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Academy – Classes</h2>
      <p>
        Classes are cohort workspaces used to coordinate live instruction and
        track learner progress through a pathway. Use them to assign an
        instructor, build a roster, schedule sessions, and record attendance and
        understanding.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/academy">Back to Academy Hub</a>
        </Button>
        <Button asChild variant="outline">
          <a
            href="https://academy.alwaysreadytools.org"
            target="_blank"
            rel="noreferrer noopener"
          >
            General Academy
          </a>
        </Button>
      </div>

      <h3>Two Entry Points</h3>
      <ul>
        <li>
          Create from pathway: selecting a pathway opens a simple setup to name
          the cohort, choose modality, instructor focus, capacity, and notes.
        </li>
        <li>
          Manage existing class: opens the cohort workspace with instructor
          assignment, roster, sessions, and tracking tools.
        </li>
      </ul>

      <h3>Class Details</h3>
      <ul>
        <li>
          Title, modality (online/in-person/hybrid), instructor focus
          (dispatcher/mentor/expert).
        </li>
        <li>Capacity target and notes for coordinators and mentors.</li>
        <li>Pathway modules overview when created from a pathway.</li>
      </ul>

      <h3>Assign Instructor</h3>
      <ul>
        <li>Select from the Instructor Bench or enter a lead manually.</li>
        <li>
          Status transitions: no instructor → <code>needs_instructor</code>;
          instructor + upcoming session → <code>scheduled</code>; otherwise{" "}
          <code>draft</code>.
        </li>
      </ul>

      <h3>Build the Roster</h3>
      <ul>
        <li>
          Add members with optional notes (role, timezone, accessibility needs,
          etc.).
        </li>
        <li>
          Edit or remove members inline; changes auto‑save while you work.
        </li>
      </ul>

      <h3>Schedule Sessions</h3>
      <ul>
        <li>Name, date/time, duration, and notes per session.</li>
        <li>
          Track for each learner per session: presence, engagement
          (low/medium/high), and understanding (needs
          support/building/confident).
        </li>
        <li>
          Next session and sessions scheduled are derived from what you set;
          marking dates will surface an upcoming session automatically.
        </li>
      </ul>

      <h3>Completion & Cleanup</h3>
      <ul>
        <li>
          Mark sessions complete and update learner understanding as you go.
        </li>
        <li>
          When the cohort is finished, you can archive or delete the class from
          its workspace.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Coordinator/dispatcher roles manage instructors, rosters, and sessions.
        Pod members can view details and attend according to local policy.
      </p>

      <h3>Quick‑Start Checklist</h3>
      <ol>
        <li>Start in the Academy Hub and choose a pathway.</li>
        <li>Create a cohort (title, modality, focus, capacity, notes).</li>
        <li>Assign an instructor or mentor lead.</li>
        <li>Add your initial roster.</li>
        <li>Schedule the first session and share the link/location.</li>
        <li>Track attendance and understanding after each session.</li>
      </ol>
    </section>
  );
}
