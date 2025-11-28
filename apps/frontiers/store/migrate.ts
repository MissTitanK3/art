"use client";

// Provide a safe default migrate that fills in any missing keys with defaults
// when versions change. This prevents hydration errors when bumping versions
// without a custom migration path.
export function migrateWithDefaults<T extends Record<string, any>>(defaults: T) {
  return (persisted?: unknown) => ({ ...defaults, ...(persisted as any) }) as T;
}
