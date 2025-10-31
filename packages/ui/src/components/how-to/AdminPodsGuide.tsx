import { Button } from "@workspace/ui/components/button";

export default function AdminPodsGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Admin – Pods</h2>
      <p>
        Organize pods at the regional level. Create new pods, rename existing ones, archive old
        pods, and jump into member management. Use search to quickly find pods by name, area, or
        slug.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/admin/pods">Open Pods Admin</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/admin">Back to Admin</a>
        </Button>
      </div>

      <h3>Overview</h3>
      <ul>
        <li>Table shows pod name, area, member count, and channels.</li>
        <li>Search across name, area, and slug for quick filtering.</li>
        <li>Actions per row: Members, Rename, Archive.</li>
      </ul>

      <h3>Create, Rename, Archive</h3>
      <ul>
        <li>
          Create Pod: prompts for a name and adds the pod to the region. Slug is generated
          automatically.
        </li>
        <li>
          Rename: opens a modal to update the pod name; slug updates to match for consistency.
        </li>
        <li>
          Archive: removes a pod from active lists after confirmation. Use for retired or merged
          pods.
        </li>
      </ul>

      <h3>Manage Members</h3>
      <ul>
        <li>
          Select Members to open the pod roster at <code>/pods/&lt;id&gt;/roster</code>, where you can
          add or remove members and set leadership.
        </li>
        <li>
          Channel badges display configured contact channels; manage channel details from the pod
          workspace.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Admin roles (dispatcher_admin, regional_admin, national_admin, admin) can create, rename,
        and archive pods. Non‑admins can view and interact with pods from the Pods pages as
        permitted by policy.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Create a pod for each new team or region.</li>
        <li>Open Members to build the roster and assign leads.</li>
        <li>Configure channels and basic details in the pod workspace.</li>
        <li>Archive inactive pods to keep lists clean.</li>
      </ol>
    </section>
  );
}
