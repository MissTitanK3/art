import { z } from "zod";

export const DetaineeIntakeSchema = z.object({
  caseId: z.string(),
  detentionDateTime: z.string().datetime().optional(),
  detentionLocation: z.string().optional(),
  arrestingAgency: z.string().optional(),
  witnessContacts: z
    .array(
      z.object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        relation: z.string().optional(),
      })
    )
    .optional(),
  dispatcherContact: z
    .object({
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      relation: z.string().optional(),
    })
    .optional(),
  fullName: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  dateOfBirth: z.string().optional(),
  countryOfBirth: z.string().optional(),
  genderIdentity: z.string().optional(),
  pronouns: z.string().optional(),
  languagesSpoken: z.array(z.string()).optional(),
  aNumber: z.string().optional(),
  photoUrl: z.string().url().optional(),
  physicalDescription: z.string().optional(),
  lastKnownFacility: z.string().optional(),
  lastKnownCity: z.string().optional(),
  arrestingOfficers: z.array(z.string()).optional(),
  statedReasonForDetention: z.string().optional(),
  knownTransfers: z
    .array(
      z.object({
        fromFacility: z.string().optional(),
        toFacility: z.string().optional(),
        transferDate: z.string().optional(),
        method: z.string().optional(),
      })
    )
    .optional(),
  belongingsLeftBehind: z.string().optional(),
  dependentsLeftBehind: z.string().optional(),
  familyContacts: z
    .array(
      z.object({
        name: z.string(),
        phone: z.string().optional(),
        email: z.string().optional(),
        relation: z.string().optional(),
      })
    )
    .optional(),
  priorAttorney: z.string().optional(),
  preferredLegalAidOrgs: z.array(z.string()).optional(),
  interpreterNeeded: z.boolean().optional(),
  urgentNeeds: z.array(z.string()).optional(),
  informationSources: z
    .array(
      z.object({
        field: z.string(),
        sourceType: z.enum(["witness", "document", "phone", "other"]),
        details: z.string().optional(),
        timestamp: z.string().optional(),
        confidence: z.number().min(1).max(5).optional(),
      })
    )
    .optional(),
  lastUpdated: z.string().optional(),
  confidenceRating: z.number().min(1).max(5).optional(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  version: z.number().optional(),
});

export type DetaineeIntakeSchemaType = typeof DetaineeIntakeSchema;
