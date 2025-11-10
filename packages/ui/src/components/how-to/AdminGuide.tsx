import { Button } from "@workspace/ui/components/button";

export default function AdminGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Admin</h2>
      <p>
        Regional and dispatcher administrators coordinate operations across
        pods, profiles, dispatches, training, and trust. The Admin dashboard
        provides at‑a‑glance stats, a map of recent activity, and quick
        navigation into each management area.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/admin">Open Admin</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/admin/settings">Admin Settings</a>
        </Button>
      </div>

      <h3>Dashboard Overview</h3>
      <ul>
        <li>
          Stats: total profiles, active dispatches, pods, and training
          completion percentage.
        </li>
        <li>
          Map: spatial view of recent dispatch activity for quick triage and
          follow‑up.
        </li>
        <li>
          Quick tiles: one‑click access to Profiles, Pods, Dispatch, Training,
          Trust, and Bug Reports.
        </li>
      </ul>

      <h3>Core Sections</h3>
      <ul>
        <li>
          Profiles: search and manage members, roles, and
          onboarding/verification.
        </li>
        <li>Pods: create pods, manage rosters, and assign leadership.</li>
        <li>
          Dispatch: review submissions, audit status, and open details from the
          map.
        </li>
        <li>
          Training: track classes and sessions, and view participation metrics.
        </li>
        <li>Trust: manage attestations and verification workflows.</li>
        <li>Bug Reports: triage user‑submitted issues and coordinate fixes.</li>
      </ul>

      <h3>Settings</h3>
      <p>
        Configure region‑specific options and administrative preferences from
        Admin Settings. Use this area to adjust access controls and defaults
        according to local policy.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Access is limited to admin‑level roles (dispatcher_admin,
        regional_admin, national_admin, or admin). Non‑admins should use
        feature‑specific pages rather than Admin.
      </p>

      <h3>Quick Links</h3>
      <ul>
        <li>
          <a href="/admin/profiles">Admin → Profiles</a>
        </li>
        <li>
          <a href="/admin/pods">Admin → Pods</a>
        </li>
        <li>
          <a href="/admin/dispatch">Admin → Dispatch</a>
        </li>
        <li>
          <a href="/admin/training">Admin → Training</a>
        </li>
        <li>
          <a href="/admin/trust">Admin → Trust</a>
        </li>
        <li>
          <a href="/admin/bug-reports">Admin → Bug Reports</a>
        </li>
      </ul>

      <h3>Admin Checklist</h3>
      <ol>
        <li>Review stats and map for active dispatches.</li>
        <li>Check bug reports and assign owners if needed.</li>
        <li>Audit pods and rosters; update leadership where necessary.</li>
        <li>
          Validate training progress and schedule sessions/classes as needed.
        </li>
        <li>Confirm trust attestations and address pending verifications.</li>
        <li>Adjust Admin Settings for any policy changes.</li>
      </ol>
    </section>
  );
}
