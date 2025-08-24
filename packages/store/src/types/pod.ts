import z from 'zod';
import { Profile } from '../profileStore.ts';
import { NormalizedLanguage } from './language.ts';
import { FieldRole } from './roles.ts';

// packages/types/pod.ts
export interface PodAdapter {
  listPods(): Promise<any[]>;
  createPod(pod: any): Promise<void>;
  updatePod(pod: any): Promise<void>;
  deletePod(id: string): Promise<void>;
}

export type Channel = {
  type: 'Signal' | 'Matrix' | 'LoRa';
  link?: string;
};

export type Pod = {
  id: string;
  slug: string;
  name: string;
  area: string;
  channels: Channel[];
  team: RosterEntry[]; // tie roster entries directly
};

export type RosterEntry = {
  id: string;
  volunteer: Profile;
  role: 'lead' | 'member' | 'trainee';
  status: 'active' | 'inactive' | 'suspended';
  langs: NormalizedLanguage[];
  fieldRoles: FieldRole[];
  skills: string[];
  certs: NormalizedCertification[];
  notes?: string;
  handle: string;
  joinedAt: string;
  lastShiftAt?: string;
};

export type DispatchEvent = {
  id: string;
  podId: string;
  type: 'patrol' | 'support' | 'monitoring' | string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  summary?: string;
  assignments: Assignment[];
};

export type Assignment = {
  id: string;
  dispatchId: string;
  volunteerId: string;
  role: string;
  state: 'pending' | 'confirmed' | 'completed';
  notes?: string;
};

export type Shift = {
  id: string;
  podId: string;
  start: string; // ISO
  end: string; // ISO
  tz: string; // IANA
  headcount: number;
  location: string;
  label?: string;
  dispatchLink?: string;
  notes?: string;
};

export const channels = ['Signal', 'Matrix', 'LoRa'] as const;
export type ChannelConst = (typeof channels)[number];

export function slugify(input: string) {
  let base = input
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (!base.startsWith('pod-')) {
    base = `pod-${base}`;
  }
  return base;
}

const isoLocal = z
  .string()
  .min(1, 'Required')
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Use date & time');

export const shiftSchema = z
  .object({
    id: z.string(),
    podId: z.string(),
    // default() => output is always string; input may be undefined
    tz: z.string().default(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
    label: z.string().min(2, 'Provide a short label').max(80),
    start: isoLocal,
    end: isoLocal,
    location: z.string().min(2, 'Where is this shift?'),
    headcount: z.coerce.number().int().min(1, 'At least 1 person'),
    // optional OR empty-string => undefined
    dispatchLink: z
      .string()
      .url('Must be a valid URL')
      .optional()
      .or(z.literal('').transform(() => undefined)),
  })
  .refine((v) => new Date(v.end) > new Date(v.start), {
    message: 'End must be after start',
    path: ['end'],
  });

// Useful RHF v8 types
export type ShiftFormInput = z.input<typeof shiftSchema>; // BEFORE transforms/defaults
export type ShiftFormOutput = z.output<typeof shiftSchema>; // AFTER transforms/defaults

export interface ShiftAdapter {
  listShifts(): Promise<any[]>;
  createShift(shift: any): Promise<void>;
  updateShift(shift: any): Promise<void>;
  deleteShift(id: string): Promise<void>;
}

export type BaseShiftIntentionFields = {
  label: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  location: string;
  headcount: number;
};

// --- Form schema for editing only ---
export const languageSchema = z.object({
  tag: z.string().min(2, 'Language code required'), // e.g. "en", "es"
  display_name: z.string().min(1, 'Display name required'), // e.g. "English"
  proficiency: z.enum(['native', 'fluent', 'conversational', 'basic', 'nonverbal']).optional(),
});

export type LanguageFormInput = z.input<typeof languageSchema>;
export type LanguageFormOutput = z.output<typeof languageSchema>;

export const certificationSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  level: z.enum(['incomplete', 'in_progress', 'completed', 'expired', 'mentor']).optional(),
});

export const rosterEntrySchema = z.object({
  id: z.string(),
  role: z.enum(['lead', 'member', 'trainee']),
  status: z.enum(['active', 'inactive', 'suspended']),
  langs: z.array(languageSchema).optional(),
  skills: z.string().optional(), // keep skills simple for now
  certs: z.array(certificationSchema).optional(),
  notes: z.string().max(200).optional(),
});

export type RosterEntryFormInput = z.input<typeof rosterEntrySchema>;
export type RosterEntryFormOutput = z.output<typeof rosterEntrySchema>;

export type CertificationLevel = 'incomplete' | 'in_progress' | 'completed' | 'expired' | 'mentor';

export interface NormalizedCertification {
  id: string; // e.g. "dispatch-level1"
  display_name: string; // e.g. "Dispatch Level 1"
  level?: CertificationLevel;
}
