import { Button } from "@workspace/ui/primitives/button";

export function PodsGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Pods</h2>
      <p>
        Browse local response pods, then open one to manage details, roster, and
        shifts. Each pod has a public slug, primary channel, and optional
        recruiting link to coordinate onboarding.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/pods">Open Pods</a>
        </Button>
        <Button asChild variant="secondary">
          <a href="/pods/new">Create Pod</a>
        </Button>
      </div>

      <h3>Directory</h3>
      <ul>
        <li>
          Cards list pod name, area, and primary channel (Signal/Matrix/LoRa).
        </li>
        <li>Click a card to open the pod’s management page.</li>
      </ul>

      <h3>Create Pod</h3>
      <ul>
        <li>
          Name, Coverage Area, Primary Channel, and optional join/vetting link.
        </li>
        <li>
          Slug preview updates as you type; it becomes the pod’s public path.
        </li>
        <li>
          After create, you’re redirected to the pod page to continue setup.
        </li>
      </ul>

      <h3>Manage Pod</h3>
      <ul>
        <li>
          Edit name, area, slug (must start with <code>pod-</code>), channel
          type, and link.
        </li>
        <li>
          Recruiting/Vetting Link is public; use a group or form link
          appropriate for your region.
        </li>
        <li>Archive removes the pod from active lists.</li>
      </ul>

      <h3>Roster & Shifts</h3>
      <ul>
        <li>
          Roster: add/edit members, roles, languages, skills at{" "}
          <code>/pods/&lt;slug&gt;/roster</code>.
        </li>
        <li>
          Shifts: configure coverage and assignments at{" "}
          <code>/pods/&lt;slug&gt;/shifts</code>.
        </li>
      </ul>

      <h3>Data Source</h3>
      <p>
        Pods and changes persist to the regional database when configured
        (Supabase). The UI also hydrates the local store for consistency across
        views.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Pod creation and management are typically limited to coordinators or
        admins; roster edits may be delegated per local policy.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Create a pod with name, area, and primary channel.</li>
        <li>Add a recruiting/vetting link if applicable.</li>
        <li>Open Roster to add members and set roles.</li>
        <li>Configure Shifts for upcoming coverage.</li>
      </ol>
    </section>
  );
}
