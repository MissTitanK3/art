import { Button } from "@workspace/ui/primitives/button";

export function MissingPersonsIntakeGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Missing Persons – Intake</h2>
      <p>
        Open a new case, capture key details, and generate a case ID. The form
        validates required fields, helps prevent duplicate IDs, and can export a
        legal‑aid‑ready report.
      </p>

      <div className="my-4 flex gap-2">
        <Button asChild>
          <a href="/missing-persons/intake">Open Intake</a>
        </Button>
        <Button asChild variant="outline">
          <a href="/missing-persons">Back to Directory</a>
        </Button>
      </div>

      <h3>Form Sections</h3>
      <ul>
        <li>
          Case Metadata: case ID, created dates, and who recorded it. Use
          Generate to propose a new ID; IDs are normalized (e.g., ZONE‑2025‑001)
          and checked for duplicates.
        </li>
        <li>
          Contacts: dispatcher contact and witness contacts for follow‑ups.
        </li>
        <li>
          Identification: name, aliases, DOB, country of birth, gender identity,
          pronouns, languages, A‑Number, and physical description.
        </li>
        <li>
          Detention Details: date/time, location/facility, city, arresting
          agency/officers, reason for detention, known transfers,
          belongings/dependents left behind.
        </li>
        <li>
          Legal Support: prior attorney and preferred legal‑aid orgs;
          interpreter needed and languages.
        </li>
        <li>
          Verification: information sources, urgency/needs, and confidence
          rating.
        </li>
        <li>
          Latest Output: shows the most recent JSON snapshot after save or
          export for quick copy.
        </li>
      </ul>

      <h3>Saving & Exporting</h3>
      <ul>
        <li>
          Submit Intake saves locally and persists to the regional database when
          configured (Supabase).
        </li>
        <li>
          Download PDF or Copy JSON after validation to share with partners;
          records are normalized before export.
        </li>
      </ul>

      <h3>Case ID Rules</h3>
      <ul>
        <li>
          IDs are normalized and checked against local/seeded records to avoid
          duplicates.
        </li>
        <li>
          Use the Generate button to propose the next sequential ID for your
          zone.
        </li>
      </ul>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Intake is typically limited to trained volunteers or admins. Follow
        privacy and consent requirements when recording personal data.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Generate or enter a unique Case ID.</li>
        <li>
          Fill Contacts, Identification, Detention, Legal, and Verification
          sections.
        </li>
        <li>Submit to save; export PDF/JSON if needed for legal aid.</li>
      </ol>
    </section>
  );
}
