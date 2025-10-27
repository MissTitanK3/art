"use client";

import * as React from "react";

import { exportLegalAidReport } from "@/src/pipelines/exportLegalAidReport";
import { MissingPersonIntakeForm } from "@workspace/ui/components/missing-persons/MissingPersonIntakeForm";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function toRow(record: DetaineeIntake) {
  return {
    case_id: record.caseId,
    detention_datetime: record.detentionDateTime ?? null,
    detention_location: record.detentionLocation ?? null,
    arresting_agency: record.arrestingAgency ?? null,
    witness_contacts: record.witnessContacts ?? null,
    dispatcher_contact: record.dispatcherContact ?? null,
    full_name: record.fullName ?? null,
    aliases: record.aliases ?? null,
    date_of_birth: record.dateOfBirth ?? null,
    country_of_birth: record.countryOfBirth ?? null,
    gender_identity: record.genderIdentity ?? null,
    pronouns: record.pronouns ?? null,
    languages_spoken: record.languagesSpoken ?? null,
    a_number: record.aNumber ?? null,
    photo_url: record.photoUrl ?? null,
    physical_description: record.physicalDescription ?? null,
    last_known_facility: record.lastKnownFacility ?? null,
    last_known_city: record.lastKnownCity ?? null,
    arresting_officers: record.arrestingOfficers ?? null,
    stated_reason_for_detention: record.statedReasonForDetention ?? null,
    known_transfers: record.knownTransfers ?? null,
    belongings_left_behind: record.belongingsLeftBehind ?? null,
    dependents_left_behind: record.dependentsLeftBehind ?? null,
    family_contacts: record.familyContacts ?? null,
    prior_attorney: record.priorAttorney ?? null,
    preferred_legal_aid_orgs: record.preferredLegalAidOrgs ?? null,
    interpreter_needed: record.interpreterNeeded ?? null,
    urgent_needs: record.urgentNeeds ?? null,
    information_sources: record.informationSources ?? null,
    last_updated: record.lastUpdated ?? null,
    confidence_rating: record.confidenceRating ?? null,
    created_at: record.createdAt ?? null,
    created_by: record.createdBy ?? null,
    version: record.version ?? null,
  } as const;
}

export function MissingPersonIntakeDataLayer() {
  const handleExport = React.useCallback(exportLegalAidReport, []);
  const handlePersistRemote = React.useCallback(async (record: DetaineeIntake) => {
    try {
      const client = getSupabaseBrowserClient();
      const row = toRow(record);
      const { error } = await client.from("missing_person_records").upsert(row);
      if (error) throw error;
    } catch (err) {
      console.warn("[MissingPersonIntakeDataLayer] supabase upsert failed", err);
    }
  }, []);

  return (
    <MissingPersonIntakeForm
      onExportRecord={handleExport}
      onPersistRecord={handlePersistRemote}
    />
  );
}
