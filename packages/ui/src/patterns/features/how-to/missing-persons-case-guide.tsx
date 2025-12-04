export function MissingPersonsCaseGuide() {
  return (
    <section className="prose dark:prose-invert max-w-none">
      <h2>Missing Persons – Case View</h2>
      <p>
        Open a specific case to review full intake details, update fields,
        export a legal‑aid report, or remove local drafts. The page shows
        last‑updated info and helpful badges (e.g., pronouns, languages,
        interpreter needed, confidence).
      </p>

      <h3>Accessing a Case</h3>
      <ul>
        <li>From the Directory, click “View details” on a card.</li>
        <li>Use the Back to directory link to return to the list.</li>
      </ul>

      <h3>Header & Badges</h3>
      <ul>
        <li>
          Shows case title (name or case ID), last updated time, and created
          timestamp.
        </li>
        <li>
          Badges: Pronouns, Languages, Interpreter needed, and Confidence rating
          if present.
        </li>
      </ul>

      <h3>Edit Mode</h3>
      <ul>
        <li>
          Click Edit to modify the intake. Sections include Case Metadata,
          Contacts, Identification, Detention Details, Legal Support, and
          Verification.
        </li>
        <li>
          Save persists changes; Cancel discards edits and returns to read‑only.
        </li>
        <li>
          Case ID updates are normalized and tracked locally for quick recall.
        </li>
      </ul>

      <h3>Actions</h3>
      <ul>
        <li>
          Download PDF or Copy JSON via the export controls (when enabled by the
          app).
        </li>
        <li>
          Delete removes the local record after confirmation. Regions may also
          remove the remote record when permitted.
        </li>
      </ul>

      <h3>Saving & Persistence</h3>
      <p>
        Changes save to the regional database when configured (Supabase) and
        update the local store. Local drafts and remote records are merged so
        work is not blocked by connectivity.
      </p>

      <h3>Latest Output</h3>
      <p>
        The read‑only view includes a “Latest Output” JSON snapshot of the
        current record for quick copy or audit.
      </p>

      <h3>Permissions</h3>
      <p className="!mt-2">
        Intake editing and deletion are typically restricted to trained
        volunteers or admins. Follow regional policy and privacy requirements
        when handling personal data.
      </p>

      <h3>Checklist</h3>
      <ol>
        <li>Open a case from the Directory.</li>
        <li>Review badges and last updated; click Edit to make changes.</li>
        <li>Save to persist; export PDF/JSON for partners as needed.</li>
      </ol>
    </section>
  );
}
