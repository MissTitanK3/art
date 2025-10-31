import { Button } from "@workspace/ui/components/button";

export default function AdminProfilesGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Admin – Profiles</h2>
      <p>
        Search and manage member profiles across the region. Filter by role, verification source,
        and availability; export results; and perform targeted role and verification updates.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/admin/profiles">Open Profiles Admin</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/admin">Back to Admin</a>
        </Button>
      </div>

      <h3>Overview</h3>
      <ul>
        <li>Table includes name, role, verification, availability, affiliation, Signal, and zone.</li>
        <li>
          Role and verification render as badges for quick scanning; suspended users are labeled.
        </li>
        <li>Unregistered users are marked and have limited administrative actions.</li>
      </ul>

      <h3>Filters & Search</h3>
      <ul>
        <li>Search across name, affiliation, Signal, zone, city, role, and verification text.</li>
        <li>Filter by Role using the full set of access roles.</li>
        <li>Filter by Verification source (admin, partner org, self, suspended).</li>
        <li>Available only toggle hides suspended users.</li>
      </ul>

      <h3>Export</h3>
      <ul>
        <li>Export CSV or JSON of the filtered result set for reporting.</li>
        <li>CSV includes id, name, role, verification, availability, affiliation, Signal, zone, city.</li>
      </ul>

      <h3>Manage Users</h3>
      <ul>
        <li>
          Actions menu per row: update access role, set/clear coordination zone, verify via Admin
          or Partner Org, suspend/unsuspend.
        </li>
        <li>
          Unregistered users cannot be modified until they complete registration (actions disabled).
        </li>
        <li>
          In demo environments, actions may be non‑persistent; in production, updates save via
          the admin API.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Admin roles (dispatcher_admin, regional_admin, national_admin, admin) can manage profiles.
        Others can view their own profile from My Profile.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Filter by role or verification to narrow the list.</li>
        <li>Export a CSV snapshot if needed for reporting.</li>
        <li>Update access role and verification for members as required.</li>
        <li>Set coordination zone for field teams; suspend if necessary.</li>
      </ol>
    </section>
  );
}
