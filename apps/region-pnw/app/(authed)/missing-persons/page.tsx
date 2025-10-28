import Link from "next/link";
import { cookies as nextCookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import MissingPersonsDataLayer from "@/components/dataLayer/missing-persons/MissingPersonsDataLayer";
import { Button } from "@workspace/ui/components/button";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import { ensureSupabaseEnv } from "@/lib/auth/supabase/utils";

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

export default async function MissingPersonsPage() {
  let initialRemoteRecords: DetaineeIntake[] | undefined = undefined;
  try {
    const env = ensureSupabaseEnv("server");
    const store = await nextCookies().catch(() => null as any);
    const client = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          if (!store) return [] as { name: string; value: string }[];
          return store.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }));
        },
        setAll(cookies) {
          if (!store) return;
          try {
            cookies.forEach(({ name, value, options }) => {
              store.set(name, value, options as CookieOptions | undefined);
            });
          } catch { }
        },
      },
    });

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
    initialRemoteRecords = rows
      .map(mapRowToDetaineeIntake)
      .filter((r): r is DetaineeIntake => typeof r.caseId === "string" && r.caseId.length > 0);
  } catch (e) {
    // Leave initialRemoteRecords undefined to allow client fetch and standard error flow
  }
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Missing Persons Directory</h1>
          <p className="text-muted-foreground max-w-2xl">
            Track all currently detained individuals, monitor urgent needs, and route each case to the right responders.
            Use search to quickly locate a case, or open a record to print and export an updated report.
          </p>
        </div>
        <Button asChild>
          <Link href="/missing-persons/intake">Add new intake</Link>
        </Button>
      </div>

      <MissingPersonsDataLayer initialRemoteRecords={initialRemoteRecords} />
    </div>
  );
}
