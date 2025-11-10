"use client";

import * as React from "react";

import { demoMissingPersons } from "@/data/demoMissingPersons";
import { exportLegalAidReport } from "@/src/pipelines/exportLegalAidReport";
import { MissingPersonIntakeForm } from "@workspace/ui/components/missing-persons/MissingPersonIntakeForm";

export function MissingPersonIntakeDataLayer() {
  const seedRecords = React.useMemo(() => demoMissingPersons, []);
  const handleExport = React.useCallback(exportLegalAidReport, []);

  return (
    <MissingPersonIntakeForm
      seedRecords={seedRecords}
      onExportRecord={handleExport}
    />
  );
}
