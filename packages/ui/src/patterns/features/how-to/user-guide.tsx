import { Callout } from "@workspace/ui/patterns/features/academy/callout";

export function HowToUserGuide() {
  return (
    <section id="user-guide" className="prose dark:prose-invert max-w-none">
      <h2>Platform User Guide</h2>
      <Callout type="info">
        New here? Start with the Academy for foundational knowledge, then return
        to this guide to operate the platform day-to-day.
      </Callout>

      <p>
        The platform is organized by mission areas. Use the global navigation to
        access each area. Below is a quick overview and deep links:
      </p>

      <ul>
        <li>
          <strong>Create</strong> — Submit new team or community requests.{" "}
          <a href="/team-req" className="text-blue-500 hover:underline">
            Go to Create
          </a>
        </li>
        <li>
          <strong>Dispatch</strong> — Maps, Watch, and schedules for operations.
          <ul>
            <li>
              <a href="/dispatches" className="text-blue-500 hover:underline">
                Dispatch Map
              </a>
            </li>
            <li>
              <a href="/watch" className="text-blue-500 hover:underline">
                Community Watch
              </a>
            </li>
            <li>
              <a href="/schedules" className="text-blue-500 hover:underline">
                Coverage Schedules
              </a>
            </li>
          </ul>
        </li>
        <li>
          <strong>Pods</strong> — Manage pods and members.
          <ul>
            <li>
              <a href="/pods" className="text-blue-500 hover:underline">
                Pod Directory
              </a>
            </li>
            <li>
              <a href="/pods/new" className="text-blue-500 hover:underline">
                Create Pod
              </a>
            </li>
          </ul>
        </li>
        <li>
          <strong>Knowledge</strong> — Learn concepts and SOPs.
          <ul>
            <li>
              <a href="/academy" className="text-blue-500 hover:underline">
                Academy
              </a>
            </li>
            <li>
              <a href="/intents" className="text-blue-500 hover:underline">
                Intents
              </a>
            </li>
            <li>
              <a href="/roles" className="text-blue-500 hover:underline">
                Roles
              </a>
            </li>
            <li>
              <a href="/impact" className="text-blue-500 hover:underline">
                Impact
              </a>
            </li>
          </ul>
        </li>
        <li>
          <strong>Missing Persons</strong> — Manage cases and signals.{" "}
          <a href="/missing-persons" className="text-blue-500 hover:underline">
            Missing Persons
          </a>
        </li>
        <li>
          <strong>Settings</strong> — Your profile and admin tools.{" "}
          <a href="/my-profile" className="text-blue-500 hover:underline">
            My Profile
          </a>
          {" • "}
          <a href="/admin" className="text-blue-500 hover:underline">
            Admin
          </a>
        </li>
      </ul>

      <Callout type="important">
        Access to some areas depends on your role and onboarding status. If
        something is missing, contact a regional admin.
      </Callout>
    </section>
  );
}
