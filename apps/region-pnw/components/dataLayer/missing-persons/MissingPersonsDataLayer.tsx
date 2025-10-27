"use client";

import * as React from "react";

import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";
import { MissingPersonsDirectory } from "@workspace/ui/components/missing-persons/MissingPersonsDirectory";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function mapRowToDetaineeIntake(row: any): DetaineeIntake {
  return {
    caseId: row.case_id,
    detentionDateTime: row.detention_datetime ?? undefined,
    detentionLocation: row.detention_location ?? undefined,
    arrestingAgency: row.arresting_agency ?? undefined,
    witnessContacts: Array.isArray(row.witness_contacts) ? row.witness_contacts : undefined,
    dispatcherContact: row.dispatcher_contact ?? undefined,
    fullName: row.full_name ?? undefined,
    aliases: Array.isArray(row.aliases) ? row.aliases : undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    countryOfBirth: row.country_of_birth ?? undefined,
    genderIdentity: row.gender_identity ?? undefined,
    pronouns: row.pronouns ?? undefined,
    languagesSpoken: Array.isArray(row.languages_spoken) ? row.languages_spoken : undefined,
    aNumber: row.a_number ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    physicalDescription: row.physical_description ?? undefined,
    lastKnownFacility: row.last_known_facility ?? undefined,
    lastKnownCity: row.last_known_city ?? undefined,
    arrestingOfficers: Array.isArray(row.arresting_officers) ? row.arresting_officers : undefined,
    statedReasonForDetention: row.stated_reason_for_detention ?? undefined,
    knownTransfers: Array.isArray(row.known_transfers) ? row.known_transfers : undefined,
    belongingsLeftBehind: row.belongings_left_behind ?? undefined,
    dependentsLeftBehind: row.dependents_left_behind ?? undefined,
    familyContacts: Array.isArray(row.family_contacts) ? row.family_contacts : undefined,
    priorAttorney: row.prior_attorney ?? undefined,
    preferredLegalAidOrgs: Array.isArray(row.preferred_legal_aid_orgs)
      ? row.preferred_legal_aid_orgs
      : undefined,
    interpreterNeeded: row.interpreter_needed ?? undefined,
    urgentNeeds: Array.isArray(row.urgent_needs) ? row.urgent_needs : undefined,
    informationSources: Array.isArray(row.information_sources) ? row.information_sources : undefined,
    lastUpdated: row.last_updated ?? undefined,
    confidenceRating: typeof row.confidence_rating === "number" ? row.confidence_rating : undefined,
    createdAt: row.created_at ?? undefined,
    createdBy: row.created_by ?? undefined,
    version: typeof row.version === "number" ? row.version : undefined,
  } as DetaineeIntake;
}

async function fetchMissingPersonsFromDatabase(): Promise<DetaineeIntake[]> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client
      .from("missing_person_records")
      .select(
        [
          "case_id",
          "detention_datetime",
          "detention_location",
          "arresting_agency",
          "witness_contacts",
          "dispatcher_contact",
          "full_name",
          "aliases",
          "date_of_birth",
          "country_of_birth",
          "gender_identity",
          "pronouns",
          "languages_spoken",
          "a_number",
          "photo_url",
          "physical_description",
          "last_known_facility",
          "last_known_city",
          "arresting_officers",
          "stated_reason_for_detention",
          "known_transfers",
          "belongings_left_behind",
          "dependents_left_behind",
          "family_contacts",
          "prior_attorney",
          "preferred_legal_aid_orgs",
          "interpreter_needed",
          "urgent_needs",
          "information_sources",
          "last_updated",
          "confidence_rating",
          "created_at",
          "created_by",
          "version",
        ].join(", ")
      )
      .order("last_updated", { ascending: false, nullsFirst: false });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows
      .map(mapRowToDetaineeIntake)
      .filter((r): r is DetaineeIntake => typeof r.caseId === "string" && r.caseId.length > 0);
  } catch (e) {
    console.warn("[MissingPersonsDataLayer] supabase fetch error", e);
    return [];
  }
}

function mergeRecords(
  remote: DetaineeIntake[] | null,
  local: MissingPersonRecord[]
): DetaineeIntake[] {
  const merged = new Map<string, DetaineeIntake>();

  const addRecord = (record: DetaineeIntake | MissingPersonRecord, index: number, origin: string) => {
    const key =
      record.caseId ??
      record.fullName ??
      ("aNumber" in record ? record.aNumber : undefined) ??
      record.createdAt ??
      `${origin}-${index}`;
    if (!merged.has(key)) {
      merged.set(key, record as DetaineeIntake);
    }
  };

  local.forEach((record, index) => addRecord(record, index, "local"));

  if (remote) {
    remote.forEach((record, index) => addRecord(record, index, "remote"));
  }

  return Array.from(merged.values());
}

export default function MissingPersonsDataLayer({
  initialRemoteRecords,
}: {
  initialRemoteRecords?: DetaineeIntake[];
}) {
  const localRecords = useMissingPersonStore((state) => state.records);
  const [remoteRecords, setRemoteRecords] = React.useState<DetaineeIntake[] | null>(initialRemoteRecords ?? null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchMissingPersonsFromDatabase();
        if (active) {
          setRemoteRecords(result);
        }
      } catch (err) {
        if (active) {
          console.warn("MissingPersonsDataLayer: failed to fetch records", err);
          setError("Unable to load live missing person records.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const records = React.useMemo(() => mergeRecords(remoteRecords, localRecords), [localRecords, remoteRecords]);

  return (
    <div className="space-y-4" suppressHydrationWarning>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading missing person directory…</p>
      ) : null}
      {error ? (
        <p className="text-sm text-amber-600">{error}</p>
      ) : null}
      <MissingPersonsDirectory records={records} />
    </div>
  );
}
