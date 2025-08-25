import { z } from 'zod';
import { AccessRoles, FIELD_ROLE_OPTIONS, VerifiedBy } from './roles.ts';

/** DB-enforced enums */

export const LastKnownLocationSchema = z
  .object({
    lat: z.number().optional(),
    lng: z.number().optional(),
    /** ISO timestamp */
    at: z.string().datetime().optional(),
    /** optional human label */
    label: z.string().optional(),
  })
  .partial();

export const CoverageZonesSchema = z
  .array(
    z.object({
      /** free-form, e.g. "King County" or a code */
      id: z.string(),
      label: z.string(),
      /** polygon/geojson later; keep string for MVP */
      area: z.any().optional(),
    }),
  )
  .default([]);

export const WeeklyAvailabilitySchema = z
  .object({
    /** e.g. { "Monday":[{"start":"09:00","end":"13:00"}], ... } */
    blocks: z
      .record(
        z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/), // 24h "HH:mm"
            end: z.string().regex(/^\d{2}:\d{2}$/),
          }),
        ),
      )
      .default({}),
  })
  .default({ blocks: {} });

export const SIGNAL_HANDLE_RE = /^@?.*\.\d{2,}$/;

export const DispatchProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  display_name: z.string().default(''),
  access_role: z.enum(AccessRoles).default('team_member'),
  field_roles: z.array(z.enum(FIELD_ROLE_OPTIONS)).default([]),
  verified_by: z.enum(VerifiedBy).default('self'),
  affiliation: z.string().nullable().optional(),
  availability: z.boolean().nullable().optional(),
  contact_signal: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || SIGNAL_HANDLE_RE.test(v),
      'Enter a Signal username like @name.12 and must end with 2+ digits).',
    )
    // normalize to lowercase and ensure a single leading "@"
    .transform((v) => {
      if (!v) return v;
      const u = v.replace(/^@/, '').toLowerCase();
      return '@' + u;
    }),
  coordination_zone: z.string().nullable().optional(),
  inserted_at: z.string().optional(), // timestamptz as ISO
  coverage_zones: CoverageZonesSchema.nullable().optional(),
  state: z.string().optional(),
  weekly_availability: WeeklyAvailabilitySchema.nullable().optional(),
  self_risk_acknowledged: z.boolean().default(false),
  city: z.string().nullable().optional(),
  operating_counties: z.array(z.string().regex(/^\d{5}$/)).max(50),
  self_status_flags: z.array(z.string().min(1)).optional().default([]),
});

export type DispatchProfile = z.infer<typeof DispatchProfileSchema>;
export type ProfileFormInput = z.input<typeof DispatchProfileSchema>;
export type ProfileFormOutput = z.output<typeof DispatchProfileSchema>;

// packages/types/profile.ts
export interface ProfileAdapter {
  loadProfile(userId: string): Promise<any | null>;
  saveProfile(profile: any): Promise<void>;
  deleteProfile(userId: string): Promise<void>;
}

export type DeleteResult = { ok: boolean; err?: string };

export type WeeklyAvailability = {
  blocks?: Record<string, Block[]>;
};

export type Block = {
  start: string;
  end: string;
};

// const ProfileSchema = DispatchProfileSchema.extend({
//   id: z.string().uuid().optional(),
//   display_name: z.string().min(1, "Display name is required"),
//   affiliation: z.string().nullable().optional(),
//   contact_signal: z.string().nullable().optional(),
//   contact_sms: z.string().nullable().optional(),
//   coordination_zone: z.string().nullable().optional(),
//   city: z.string().nullable().optional(),
//   self_status_flags: z.array(z.string().min(1)).optional().default([]),
// });
