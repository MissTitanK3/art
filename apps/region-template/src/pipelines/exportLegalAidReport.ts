import { generatePDF, type GeneratePDFOptions } from "@/lib/pdf";
import { DetaineeIntake } from "@/types/DetaineeIntake";

type ReportFormat = "pdf" | "json";

// Filters out empty, null, or undefined values so the generated report stays concise.
function pickDefined<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Partial<Pick<T, K>> {
  const result: Partial<Pick<T, K>> = {};

  keys.forEach((key) => {
    const value = source[key];
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === "string" && value.trim().length === 0) {
      return;
    }
    if (Array.isArray(value) && value.length === 0) {
      return;
    }
    (result as Record<string, unknown>)[key as string] = value;
  });

  return result;
}

export async function exportLegalAidReport(
  intake: DetaineeIntake,
  format: ReportFormat = "pdf",
): Promise<Blob | string> {
  if (format === "json") {
    return JSON.stringify(intake);
  }

  const payload: GeneratePDFOptions = {
    title: `Detainee Report: ${intake.fullName || intake.caseId}`,
    sections: [
      {
        heading: "Case Metadata",
        fields: pickDefined(intake, [
          "caseId",
          "detentionDateTime",
          "detentionLocation",
          "arrestingAgency",
          "witnessContacts",
          "dispatcherContact",
        ]),
      },
      {
        heading: "Identification",
        fields: pickDefined(intake, [
          "fullName",
          "aliases",
          "dateOfBirth",
          "countryOfBirth",
          "genderIdentity",
          "pronouns",
          "languagesSpoken",
          "aNumber",
          "photoUrl",
          "physicalDescription",
        ]),
      },
      {
        heading: "Detention Details",
        fields: pickDefined(intake, [
          "lastKnownFacility",
          "lastKnownCity",
          "arrestingOfficers",
          "statedReasonForDetention",
          "knownTransfers",
          "belongingsLeftBehind",
          "dependentsLeftBehind",
        ]),
      },
      {
        heading: "Legal & Support",
        fields: pickDefined(intake, [
          "familyContacts",
          "priorAttorney",
          "preferredLegalAidOrgs",
          "interpreterNeeded",
          "urgentNeeds",
        ]),
      },
      {
        heading: "Verification Notes",
        fields: pickDefined(intake, [
          "informationSources",
          "lastUpdated",
          "confidenceRating",
          "createdAt",
          "createdBy",
          "version",
        ]),
      },
    ],
  };

  const pdf = await generatePDF(payload);
  return pdf;
}
