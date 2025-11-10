import { Callout } from "@workspace/ui/components/academy/Callout";
import { Button } from "@workspace/ui/components/button";

export default function WatchGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Community Watch</h2>
      <p>
        Monitor incoming reports on a live map or in a list, then convert
        credible items into dispatch requests for coordination. Designed for
        quick situational awareness and handoff into Dispatch.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/watch">Open Watch</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/team-req">Create Team Request</a>
        </Button>
      </div>

      <h3>Map and List Views</h3>
      <ul>
        <li>
          Map: markers show time, source label, and optional media. Click a
          marker for actions.
        </li>
        <li>
          List: cards show recent items with city/coordinates and quick actions.
          “View on Map” focuses the map to the selected report.
        </li>
      </ul>

      <h3>Create Dispatch</h3>
      <ul>
        <li>
          From a marker or list card, choose Create Dispatch to prefill a team
          request with location and agency/label.
        </li>
        <li>
          The request opens in Create → Team Requests with latitude/longitude
          and context attached.
        </li>
      </ul>

      <h3>Map Styles</h3>
      <ul>
        <li>
          Switch between multiple base maps (OSM Standard/HOT, Carto, OpenTopo,
          USGS Topo) using the selector; preference is saved locally per
          browser.
        </li>
      </ul>

      <h3>Tips</h3>
      <ul>
        <li>
          Use List view to skim and then jump to a report’s location on the map.
        </li>
        <li>
          Check media when available to improve verification before creating a
          dispatch.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        All authenticated users can view Watch. Creating dispatches follows your
        region’s policy and may be limited to coordinators.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Open Watch and scan Map or List for relevant activity.</li>
        <li>Verify location/details; view media if present.</li>
        <li>Create a Team Request to route credible items to Dispatch.</li>
      </ol>

      <Callout type="info">Respect privacy and follow local SOPs.</Callout>
    </section>
  );
}
