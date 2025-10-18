"use client";

import * as React from "react";

import { MissingPersonsDirectory } from "@/components/missing-persons/MissingPersonsDirectory";
import { demoMissingPersons } from "@/data/demoMissingPersons";
import type { DetaineeIntake } from "@/src/types/DetaineeIntake";
import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import type { MissingPersonRecord } from "@workspace/store/types/missing-person";

async function fetchMissingPersonsFromDatabase(): Promise<DetaineeIntake[]> {
  // TODO: replace with real data source.
  await Promise.resolve();
  return [];
}

function mergeRecords(
  seed: DetaineeIntake[],
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

  seed.forEach((record, index) => addRecord(record, index, "seed"));

  return Array.from(merged.values());
}

export default function MissingPersonsDataLayer() {
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
          console.warn("MissingPersonsDataLayer: failed to fetch records", err);
          setError("Unable to load live missing person records. Showing demo data.");
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

  const records = React.useMemo(
    () => mergeRecords(demoMissingPersons, remoteRecords, localRecords),
    [localRecords, remoteRecords]
  );

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
