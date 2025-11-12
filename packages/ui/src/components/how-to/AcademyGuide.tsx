import { Button } from "@workspace/ui/components/button";

export default function AcademyGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Academy</h2>
      <p>
        Learn foundational concepts, SOPs, and best practices. Coordinate live
        classes with mentors and dispatchers while tracking qualification
        progress across your pod.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/academy">Open Academy Hub</a>
        </Button>
        <Button asChild variant="outline">
          <a
            href="https://academy.alwaysreadytools.org/courses"
            target="_blank"
            rel="noreferrer noopener"
          >
            General Academy
          </a>
        </Button>
      </div>

      <h3>Dashboard Overview</h3>
      <p>
        The Academy Hub provides a clear snapshot of your pod’s training
        readiness and the tools to coordinate instruction:
      </p>
      <ul>
        <li>
          Stats grid summarizes readiness, in-progress work, and instructor
          bench status.
        </li>
        <li>
          Active Classes highlights ongoing classes and lets you schedule new
          ones.
        </li>
        <li>
          Sessions Board manages discrete training sessions with status, timing,
          and participants.
        </li>
        <li>
          Instructor Bench tracks experts/mentors, registration, and vetting
          status.
        </li>
        <li>
          Qualification Pathways visualize progress through course groups and
          tracks.
        </li>
      </ul>

      <h3>Classes vs Sessions</h3>
      <p>
        Classes are the training container — a group of learners working through
        a set of topics or a qualification track. Sessions are standalone events
        focused on a single lesson or topic. Sessions are managed independently
        (scheduling, status, and participants) and are not necessarily attached
        to a class.
      </p>

      <h3>Key Actions</h3>
      <ul>
        <li>
          Schedule a class from Active Classes, or create a session from
          Sessions Board.
        </li>
        <li>
          Manage session status (scheduled, in-progress, completed, canceled)
          and participants.
        </li>
        <li>
          Track qualification progress across course groups and start
          pathway-aligned classes.
        </li>
        <li>
          Build an instructor bench by adding experts or dispatchers and
          maintaining vetting.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Dispatcher admins can manage the instructor bench and coordinate
        sessions. All pod members can review progress and enroll in classes
        according to local policy.
      </p>

      <p className="!mt-6">
        Complete recommended classes before operating core tools. Use the Online
        Academy for self‑paced learning and the Academy Hub for coordination and
        live sessions.
      </p>
    </section>
  );
}
