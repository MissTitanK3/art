"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { exportLegalAidReport } from "@/lib/pipelines/exportLegalAidReport";
import { MissingPersonDetail } from "@workspace/ui/components/missing-persons/MissingPersonDetail";
import { getMissingPersonSlug } from "@workspace/ui/lib/missing-persons";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { toast } from "@workspace/ui/components/sonner";

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
        ].join(", "),
      )
      .order("last_updated", { ascending: false, nullsFirst: false });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    return rows
      .map(mapRowToDetaineeIntake)
      .filter(
        (r): r is DetaineeIntake =>
          typeof r.caseId === "string" && r.caseId.length > 0,
      );
  } catch (e) {
    console.warn("[MissingPersonDetailPage] supabase fetch error", e);
    return [];
  }
}

function findRecordBySlug(
  slug: string,
  collections: Array<Iterable<Partial<DetaineeIntake> | MissingPersonRecord>>,
): DetaineeIntake | null {
  for (const collection of collections) {
    for (const item of collection) {
      const record = item as DetaineeIntake;
      const recordSlug = getMissingPersonSlug(record);
      if (recordSlug === slug) {
        return record;
      }
    }
  }
  return null;
}

function MissingPersonDetailDataLayer({ slug }: { slug: string }) {
  const localRecords = useMissingPersonStore((state) => state.records);
  const router = useRouter();
  const [remoteRecords, setRemoteRecords] = React.useState<
    DetaineeIntake[] | null
  >(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const renderDirectoryLink = React.useCallback(
    (href: string, label: React.ReactNode) => (
      <Link href={href} className="inline-flex items-center gap-1">
        {label}
      </Link>
    ),
    [],
  );
  const handleDeleteSuccess = React.useCallback(
    ({
      directoryHref,
    }: {
      caseId: string;
      record: DetaineeIntake;
      directoryHref: string;
    }) => {
      router.push(directoryHref);
    },
    [router],
  );
  const handleSaveRemote = React.useCallback(async (record: DetaineeIntake) => {
    try {
      const client = getSupabaseBrowserClient();
      const row = {
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
      const { error } = await client.from("missing_person_records").upsert(row);
      if (error) throw error;
    } catch (err) {
      console.warn(
        "[MissingPersonDetailPage] supabase upsert failed",
        err,
      );
    }
  }, []);
  const handleDeleteRemote = React.useCallback(async (caseId: string) => {
    try {
      const client = getSupabaseBrowserClient();
      const { error } = await client.rpc(
        "safe_delete_missing_person_record",
        { p_case_id: caseId },
      );
      if (error) throw error;
    } catch (err) {
      console.warn(
        "[MissingPersonDetailPage] supabase delete failed",
        err,
      );
    }
  }, []);

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
          console.warn(
            "MissingPersonDetailPage: failed to fetch records",
            err,
          );
          setError("Unable to load the latest record from the database.");
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

  const record = React.useMemo(
    () => findRecordBySlug(slug, [localRecords, remoteRecords ?? []]),
    [slug, localRecords, remoteRecords],
  );

  if (!record) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
        {loading ? (
          <p>Loading missing person record…</p>
        ) : (
          <p>We couldn&apos;t find a missing person record with that ID.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-amber-600">{error}</p> : null}
      <MissingPersonDetail
        record={record}
        slug={slug}
        directoryHref="/missing-persons"
        onExportRecord={exportLegalAidReport}
        onFinalizeRecord={async (rec) => {
          try {
            const res = await fetch("/api/missing-persons/finalize", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                record: { caseId: rec.caseId, fullName: rec.fullName ?? null },
                slug,
              }),
            });
            if (!res.ok) {
              toast.error("Finalize failed");
            } else {
              toast.success("Shared with active advocacy groups");
            }
          } catch (e) {
            console.warn("Finalize notify failed", e);
            toast.error("Finalize failed");
            throw e;
          }
        }}
        renderDirectoryLink={renderDirectoryLink}
        onDeleteSuccess={handleDeleteSuccess}
        onSaveRecord={handleSaveRemote}
        onDeleteRecord={(caseId) => handleDeleteRemote(caseId)}
      />
    </div>
  );
}

export default async function MissingPersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-16">
      <MissingPersonDetailDataLayer slug={id} />
    </div>
  );
}
