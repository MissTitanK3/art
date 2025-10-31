import { Button } from "@workspace/ui/components/button";

export default function AdminTrustGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Admin – Trust</h2>
      <p>
        Maintain a registry of signed endorsements for key roles (regional admins, pod leaders,
        trainers). This page supports a simple check‑in cadence using ROT fingerprints to cue
        regular safety follow‑ups. It is not used for permissions.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/admin/trust">Open Trust Admin</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/admin">Back to Admin</a>
        </Button>
      </div>

      <h3>Overview</h3>
      <ul>
        <li>Trust entries list: Subject, Signer, Signer Role, Signed time, Check‑in, Status.</li>
        <li>
          Check‑in shows time until next follow‑up; badges highlight Due soon or Overdue.
        </li>
        <li>Use Export to download the current view as JSON for audits.</li>
      </ul>

      <h3>Add Entry</h3>
      <ul>
        <li>
          Click Add Entry to select a Subject and Signer from profiles and choose a signer role
          (regional_admin, pod_leader, trainer).
        </li>
        <li>
          ROT (fingerprint) is recorded with the endorsement; keys can be managed separately.
        </li>
      </ul>

      <h3>Filters & Search</h3>
      <ul>
        <li>Search by subject or signer name, ROT fingerprint, or entry hash.</li>
        <li>Filter by Signer Role and Status (active/inactive).</li>
      </ul>

      <h3>Actions</h3>
      <ul>
        <li>
          Resume/Deactivate toggles whether an endorsement is currently active; reactivation resets
          the check‑in clock.
        </li>
        <li>Re‑verify flows are disabled in this version; use region policy if needed.</li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Admin roles (dispatcher_admin, regional_admin, national_admin, admin) manage trust entries.
        Subject and signer names are drawn from Profiles.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Add entries for key roles to establish check‑in cadence.</li>
        <li>Filter by role and scan for Due soon or Overdue check‑ins.</li>
        <li>Reach out on overdue items and document follow‑ups per policy.</li>
        <li>Export JSON for periodic audits with leadership.</li>
      </ol>
    </section>
  );
}
