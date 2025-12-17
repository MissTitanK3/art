import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/responses";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";

function mapRowToDetaineeIntake(row: any): DetaineeIntake {
    return {
        caseId: row.case_id,
        detentionDateTime: row.detention_datetime ?? undefined,
        detentionLocation: row.detention_location ?? undefined,
        arrestingAgency: row.arresting_agency ?? undefined,
        witnessContacts: Array.isArray(row.witness_contacts)
            ? row.witness_contacts
            : undefined,
        dispatcherContact: row.dispatcher_contact ?? undefined,
        fullName: row.full_name ?? undefined,
        aliases: Array.isArray(row.aliases) ? row.aliases : undefined,
        dateOfBirth: row.date_of_birth ?? undefined,
        countryOfBirth: row.country_of_birth ?? undefined,
        genderIdentity: row.gender_identity ?? undefined,
        pronouns: row.pronouns ?? undefined,
        languagesSpoken: Array.isArray(row.languages_spoken)
            ? row.languages_spoken
            : undefined,
        aNumber: row.a_number ?? undefined,
        photoUrl: row.photo_url ?? undefined,
        physicalDescription: row.physical_description ?? undefined,
        lastKnownFacility: row.last_known_facility ?? undefined,
        lastKnownCity: row.last_known_city ?? undefined,
        arrestingOfficers: Array.isArray(row.arresting_officers)
            ? row.arresting_officers
            : undefined,
        statedReasonForDetention: row.stated_reason_for_detention ?? undefined,
        knownTransfers: Array.isArray(row.known_transfers)
            ? row.known_transfers
            : undefined,
        belongingsLeftBehind: row.belongings_left_behind ?? undefined,
        dependentsLeftBehind: row.dependents_left_behind ?? undefined,
        familyContacts: Array.isArray(row.family_contacts)
            ? row.family_contacts
            : undefined,
        priorAttorney: row.prior_attorney ?? undefined,
        preferredLegalAidOrgs: Array.isArray(row.preferred_legal_aid_orgs)
            ? row.preferred_legal_aid_orgs
            : undefined,
        interpreterNeeded: row.interpreter_needed ?? undefined,
        urgentNeeds: Array.isArray(row.urgent_needs) ? row.urgent_needs : undefined,
        informationSources: Array.isArray(row.information_sources)
            ? row.information_sources
            : undefined,
        lastUpdated: row.last_updated ?? undefined,
        confidenceRating:
            typeof row.confidence_rating === "number"
                ? row.confidence_rating
                : undefined,
        createdAt: row.created_at ?? undefined,
        createdBy: row.created_by ?? undefined,
        version: typeof row.version === "number" ? row.version : undefined,
    } as DetaineeIntake;
}

export async function GET(req: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
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
                ].join(", "),
            )
            .is("deleted_at", null)
            .order("last_updated", { ascending: false, nullsFirst: false });

        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        const records = rows
            .map(mapRowToDetaineeIntake)
            .filter(
                (r): r is DetaineeIntake =>
                    typeof r.caseId === "string" && r.caseId.length > 0,
            );

        return NextResponse.json({ records });
    } catch (e: any) {
        return jsonError(e);
    }
}
