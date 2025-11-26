import { z } from "zod";

const OrgNormsSingleCategorySchema = z.object({
  type: z.string().nullable(),
  other: z.string().nullable(),
});

const OrgNormsMultiCategorySchema = z.object({
  type: z.array(z.string()).nullable(),
  other: z.string().nullable(),
});

export const OrgNormsSchema = z.object({
  decision_making: OrgNormsSingleCategorySchema.nullable().optional(),
  safety_level: OrgNormsSingleCategorySchema.nullable().optional(),
  communication: OrgNormsMultiCategorySchema.nullable().optional(),
  conflict_resolution: OrgNormsSingleCategorySchema.nullable().optional(),
  safety_protocols: OrgNormsMultiCategorySchema.nullable().optional(),
  role_boundaries: OrgNormsSingleCategorySchema.nullable().optional(),
  accountability: OrgNormsSingleCategorySchema.nullable().optional(),
  onboarding: OrgNormsMultiCategorySchema.nullable().optional(),
  offboarding: OrgNormsMultiCategorySchema.nullable().optional(),
  values_culture: OrgNormsMultiCategorySchema.nullable().optional(),
});
