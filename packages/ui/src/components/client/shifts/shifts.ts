// shifts.ts
import { z } from 'zod';

export type Shift = {
  id: string;
  podId: string;
  tz: string;
  label: string;
  start: string; // ISO
  end: string;
  location: string;
  headcount: number;
  dispatchLink?: string;
};

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
