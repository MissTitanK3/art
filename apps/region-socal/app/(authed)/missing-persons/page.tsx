"use client";

import * as React from "react";
import { useMissingPersonStore } from "@workspace/store/useMissingPersonStore";
import { MissingPersonsDirectory } from "@workspace/ui/components/missing-persons/MissingPersonsDirectory";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";

export default function MissingPersonsPage() {
  const localRecords = useMissingPersonStore((state) => state.records);
  const localIntakes = localRecords as unknown as DetaineeIntake[];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Missing Persons Directory
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Track all currently detained individuals, monitor urgent needs, and
            route each case to the right responders. Use search to quickly
            locate a case, or open a record to print and export an updated
            report.
          </p>
        </div>
      </div>

      <MissingPersonsDirectory
        records={localIntakes}
        fetchUrl="/api/missing-persons"
      />
    </div>
  );
}
