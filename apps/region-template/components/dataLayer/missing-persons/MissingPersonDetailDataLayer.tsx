"use client";

import * as React from "react";

import { MissingPersonDetail } from "@/components/missing-persons/MissingPersonDetail";
import { demoMissingPersons, getMissingPersonSlug } from "@/data/demoMissingPersons";
import type { DetaineeIntake } from "@/src/types/DetaineeIntake";
import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";

async function fetchMissingPersonsFromDatabase(): Promise<DetaineeIntake[]> {
  await Promise.resolve();
  return [];
}

function findRecordBySlug(
  slug: string,
  collections: Array<Iterable<Partial<DetaineeIntake> | MissingPersonRecord>>
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

export function MissingPersonDetailDataLayer({ slug }: { slug: string }) {
  const localRecords = useMissingPersonStore((state) => state.records);
  const [remoteRecords, setRemoteRecords] = React.useState<DetaineeIntake[] | null>(null);
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
          console.warn("MissingPersonDetailDataLayer: failed to fetch records", err);
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
    () =>
      findRecordBySlug(slug, [
        localRecords,
        remoteRecords ?? [],
        demoMissingPersons,
      ]),
    [slug, localRecords, remoteRecords]
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
      {error ? (
        <p className="text-sm text-amber-600">{error}</p>
      ) : null}
      <MissingPersonDetail record={record} slug={slug} />
    </div>
  );
}
