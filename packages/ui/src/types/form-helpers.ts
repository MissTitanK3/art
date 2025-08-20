// packages/ui/src/types/form-helpers.ts

import { z, ZodObject, ZodTypeAny, ZodEffects, ZodFirstPartyTypeKind } from 'zod';
import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';

/**
 * Example usage:
 *
 * ```ts
 * 1. Import the helpers
 * import { formSchema, nullToEmptyString, nullToFalse } from "@workspace/ui/types/form-helpers"
 *
 * 2. Create your form-specific schema
 * const { schema, defaults, useForm, fields, input, output } = formSchema(
 *   z.object({
 *     name: nullToEmptyString().describe("Pod Name"),
 *     is_active: nullToFalse().describe("Is Active"),
 *     access_role: z.enum(["admin", "member", "guest"]).describe("Access Role"),
 *   })
 * )
 *
 * 3. Setup RHF with auto defaults + types
 * const form = useForm()
 * ```
 */

/**
 * 🔍 Tip: If your output shape includes objects that must be flattened before submitting to APIs
 * (e.g. `coverage_zones: { id, label }[]` → `string[]`), transform in your `onSubmit` like:
 *
 * ```ts
 * const onSubmit: SubmitHandler<ProfileOutput> = (values) => {
 *   const flattened = {
 *     ...values,
 *     coverage_zones: values.coverage_zones?.map(z => z.id) ?? [],
 *   };
 *   mutate(flattened);
 * };
 * ```
 */

/** Normalize nullable string into "" */
export const nullToEmptyString = () =>
  z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? '');

/** Normalize nullable boolean into false */
export const nullToFalse = () =>
  z
    .boolean()
    .nullable()
    .optional()
    .transform((v) => v ?? false);

/** Normalize nullable arrays into [] */
export const nullToEmptyArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .array(schema as unknown as T)
    .nullable()
    .optional()
    .transform((v) => v ?? []);

/** Normalize nullable objects into { blocks: {} } (example for weekly availability) */
export const nullToEmptyBlocks = () =>
  z
    .object({
      blocks: z
        .record(
          z.array(
            z.object({
              start: z.string().regex(/^\d{2}:\d{2}$/),
              end: z.string().regex(/^\d{2}:\d{2}$/),
            }),
          ),
        )
        .default({}),
    })
    .nullable()
    .optional()
    .transform((v) => v ?? { blocks: {} });

/** Extract defaults recursively from any Zod schema (for RHF) */
function getDefaults<T extends ZodTypeAny>(schema: T): any {
  if (schema instanceof ZodEffects) {
    return getDefaults(schema._def.schema);
  }

  if (schema instanceof ZodObject) {
    const obj: Record<string, any> = {};
    for (const key in schema.shape) {
      const val = getDefaults(schema.shape[key]);
      if (val !== undefined) obj[key] = val;
    }
    return obj;
  }

  try {
    return schema.parse(undefined);
  } catch {
    return undefined;
  }
}

/** Dynamic UI descriptor for a field */
export type FormFieldConfig = {
  name: string;
  type: string;
  label?: string;
  required: boolean;
  enumValues?: string[];
};

/** Extract FormFieldConfig[] from a ZodObject for dynamic UI builders */
function extractFieldConfigs<T extends ZodObject<any>>(schema: T): FormFieldConfig[] {
  const fields: FormFieldConfig[] = [];

  for (const key in schema.shape) {
    const def = schema.shape[key]._def;
    const type = def.typeName as ZodFirstPartyTypeKind;

    const field: FormFieldConfig = {
      name: key,
      label: def.description,
      type,
      required: !('optional' in def || 'nullable' in def),
    };

    if (type === 'ZodEnum') {
      field.enumValues = def.values;
    }

    fields.push(field);
  }

  return fields;
}

/**
 * Main form schema helper to derive:
 * - Recursive default values for RHF
 * - RHF-safe useForm() instance with correct types
 * - Field metadata for dynamic UI renderers
 */
export function formSchema<T extends ZodObject<any>>(schema: T) {
  const defaults = getDefaults(schema);
  const config = extractFieldConfigs(schema);

  return {
    schema,
    defaults,
    fields: config,
    input: null! as z.input<typeof schema>,
    output: null! as z.output<typeof schema>,
    useForm: (
      options?: UseFormProps<z.input<typeof schema>, any, z.output<typeof schema>>,
    ): UseFormReturn<z.input<typeof schema>, any, z.output<typeof schema>> => {
      return useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
        mode: 'onChange',
        defaultValues: defaults,
        ...options,
      });
    },
  };
}
