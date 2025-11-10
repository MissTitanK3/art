import { Callout } from "@workspace/ui/components/academy/Callout";

export default function NavRolesGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Roles & Access (Navigation)</h2>
      <p>
        The app uses role groupings to control which navigation items users can
        see. These map to operational responsibilities and safety requirements.
      </p>

      <h3>Roles</h3>
      <ul>
        <li>
          <strong>Team Member</strong> – onboarded volunteer; core features.
        </li>
        <li>
          <strong>Pod Leader</strong> – leads a pod; manages local work.
        </li>
        <li>
          <strong>Trainer</strong> – facilitates training and classes.
        </li>
        <li>
          <strong>Dispatcher (Basic)</strong> – dispatcher (limited/in
          training).
        </li>
        <li>
          <strong>Dispatcher (Verified)</strong> – verified dispatcher; broader
          access.
        </li>
        <li>
          <strong>Dispatcher (Admin)</strong> – admin dispatcher; manages
          sessions/instructors.
        </li>
        <li>
          <strong>Admin / Regional Admin</strong> – regional administration.
        </li>
        <li>
          <strong>National Admin</strong> – cross‑region oversight.
        </li>
      </ul>

      <h3>Access Groups</h3>
      <ul>
        <li>
          <strong>Complete Onboarding</strong> – core features: Watch, Academy,
          Intents, Roles, Impact, Pods (+ Create Pod), Missing Persons.
        </li>
        <li>
          <strong>Elevated Roles</strong> – coordination tools: Dispatches,
          Schedules, Team Requests.
        </li>
        <li>
          <strong>Pod Admins / Local Admins</strong> – admin console and
          people/pod management.
        </li>
        <li>
          <strong>Region Admins</strong> – full regional admin powers; sensitive
          surfaces.
        </li>
        <li>
          <strong>National Admins</strong> – cross‑region oversight.
        </li>
      </ul>

      <Callout type="info">
        See <code>packages/store/src/utils/NAV_ROLES.md</code> for a deeper
        reference and examples on authoring nav configs.
      </Callout>
    </section>
  );
}
