import { Button } from "@workspace/ui/components/button";

export default function MyProfileGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>My Profile</h2>
      <p>
        Manage your identity, roles, verification, safety acknowledgment, and
        weekly availability. Update your Signal handle and coordination zone so
        dispatchers can reach you quickly. You can also select your coverage
        zones on the map.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/my-profile">Open My Profile</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/my-profile/map">Select Coverage Zones</a>
        </Button>
      </div>

      <h3>Profile Editor</h3>
      <ul>
        <li>Identity: display name, state, city, affiliation.</li>
        <li>Contact: Signal handle and coordination zone.</li>
        <li>
          Roles: select field roles; access role and verification are shown.
        </li>
        <li>
          Coverage: choose zones via the map; they appear in your profile.
        </li>
      </ul>

      <h3>Risk & Availability</h3>
      <ul>
        <li>
          Self‑Risk Acknowledgment: review the risk sheet, then enable the
          toggle to acknowledge safety protocols.
        </li>
        <li>
          Weekly Unavailability: mark times you cannot respond; dispatchers plan
          around these blocks.
        </li>
      </ul>

      <h3>Saving and Deleting</h3>
      <ul>
        <li>
          Save updates your profile and persists to the regional database when
          configured.
        </li>
        <li>
          Purge deletes your profile/account for this region after confirmation.
          Use with care.
        </li>
      </ul>

      <h3>Verification & Redirects</h3>
      <ul>
        <li>
          A banner may prompt verification or risk acknowledgment. Admins can
          verify profiles per region policy.
        </li>
        <li>
          If you’re redirected here, the page may show a reason (e.g.,
          verification needed or restricted area).
        </li>
      </ul>

      <h3>Checklist</h3>
      <ol>
        <li>Update name, Signal, state/city, and coordination zone.</li>
        <li>Select field roles and confirm verification status.</li>
        <li>Review the risk sheet and acknowledge if appropriate.</li>
        <li>Set weekly unavailability and pick coverage zones on the map.</li>
        <li>Save changes.</li>
      </ol>
    </section>
  );
}
