import { Button } from "@workspace/ui/components/button";

export default function MissingPersonsGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Missing Persons</h2>
      <p>
        Track detained or missing individuals, capture intake details, and coordinate follow‑ups.
        Use the directory to search and filter cases, then open a record to edit, export, or route
        to partners.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/missing-persons">Open Directory</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/missing-persons/intake">New Intake</a>
        </Button>
      </div>

      <h3>Directory</h3>
      <ul>
        <li>
          Search by name, case ID, facility, city, agency, languages, or urgent needs.
        </li>
        <li>
          Urgency filter: All cases, Urgent needs only, or No flagged needs.
        </li>
        <li>
          Cards show case ID, detention time, last known location, profile info, urgent needs, and
          last update.
        </li>
      </ul>

      <h3>Intake</h3>
      <ul>
        <li>
          Capture detention details, identifiers (A‑Number), contacts, transfers, facilities,
          language/interpreter needs, and urgent needs.
        </li>
        <li>
          Save creates/updates the case; return to the directory or open the case to continue.
        </li>
      </ul>

      <h3>Case View</h3>
      <ul>
        <li>Review full record; edit fields and save changes to the regional database.</li>
        <li>Export a legal‑aid‑ready report; share with partners as needed.</li>
        <li>Delete a record when resolved or created in error.</li>
      </ul>

      <h3>Data Source</h3>
      <p>
        Records hydrate from the regional database (Supabase). Local drafts are merged with remote
        data to avoid losing context if connectivity is limited.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Intake and editing are typically limited to trained volunteers or admins. Follow region
        policy and privacy requirements when handling personal data.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Search the directory; if new, start a New Intake.</li>
        <li>Record detention details, contacts, and urgent needs.</li>
        <li>Open the case, confirm details, and export the report if needed.</li>
      </ol>
    </section>
  );
}
