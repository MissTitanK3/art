import { Button } from "@workspace/ui/components/button";

export default function MyProfileMapGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>My Profile – Map</h2>
      <p>
        Select your operating counties and mark partial coverage zones.
        Dispatchers use this to understand where you can respond or coordinate.
        Changes save back to your profile.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/my-profile/map">Open Coverage Zones</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/my-profile">Back to Profile</a>
        </Button>
      </div>

      <h3>Picking Counties</h3>
      <ul>
        <li>Click a county on the map to toggle selection.</li>
        <li>
          Selected counties appear below with actions to Edit Zones or Remove.
        </li>
        <li>Use Done to save and return to your profile.</li>
      </ul>

      <h3>Partial Coverage Zones</h3>
      <ul>
        <li>Click Edit Zones on a county to enter grid edit mode.</li>
        <li>
          Zoom to 7+ to edit; click grid cells to mark areas you can cover.
        </li>
        <li>Saved zones show as overlays when viewing selected counties.</li>
      </ul>

      <h3>Data & Persistence</h3>
      <ul>
        <li>
          Selections save to your profile’s operating counties (FIPS codes) and
          sync to the region database when configured.
        </li>
        <li>
          Map uses US county boundaries; a loading message appears while data
          hydrates.
        </li>
      </ul>

      <h3>Tips</h3>
      <ul>
        <li>
          Pick the counties you can regularly respond in; use zones for partial
          coverage.
        </li>
        <li>Adjust later as your availability changes.</li>
      </ul>

      <h3>Checklist</h3>
      <ol>
        <li>Open Coverage Zones and select your counties.</li>
        <li>Optionally mark partial coverage zones for each county.</li>
        <li>Click Done to save and return to your profile.</li>
      </ol>
    </section>
  );
}
