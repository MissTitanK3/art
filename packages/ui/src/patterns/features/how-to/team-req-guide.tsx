import { Callout } from "@workspace/ui/patterns/features/academy/callout";
import { Button } from "@workspace/ui/primitives/button";

export function TeamReqGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Create – Team Requests</h2>
      <p>
        Submit new requests that route into Dispatch: Rapid Response, Planned
        Event, Training, Community Aid, Technical Aid, or Other. A short wizard
        helps you capture location, planned actions, and roles needed.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/team-req">Open Team Request</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/watch">Open Watch</a>
        </Button>
      </div>

      <h3>Prefill from Watch</h3>
      <p>
        If you start from Community Watch, choosing “Create Dispatch” carries
        forward the map pin and context. The form pre‑populates location, label,
        and a suggested “Scout Check” plan.
      </p>

      <h3>Steps</h3>
      <ul>
        <li>
          Basic Info: location label, response type, state, visibility radius;
          coordinates are shown when provided from the map.
        </li>
        <li>
          Event Type: pick a preset (e.g., Rapid Response, Planned Event) to
          seed actions and roles.
        </li>
        <li>
          Intended Actions: select from grouped action presets, add notes, or
          specify a custom action.
        </li>
        <li>
          Roles Needed: select roles and counts; suggestions appear based on
          chosen actions.
        </li>
        <li>
          Review & Submit: verify details and optionally mark as Training before
          submitting.
        </li>
      </ul>

      <h3>After Submit</h3>
      <ul>
        <li>Request is saved and added to the Dispatch Board.</li>
        <li>
          You are redirected to the submission detail page for follow‑up and
          assignment.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Submitting team requests typically requires an elevated role. Regions
        set local policy for who can create requests vs. view and assist.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Open from Watch to prefill, or start a blank request.</li>
        <li>Confirm location and response type in Basic Info.</li>
        <li>Select Event Type, then refine Actions and Roles.</li>
        <li>On Review, mark Training if appropriate and submit.</li>
      </ol>

      <Callout type="info">
        Include only necessary personal data; follow local SOPs.
      </Callout>
    </section>
  );
}
