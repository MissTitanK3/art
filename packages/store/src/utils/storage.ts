type GlobalWithProcess = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

function resolveBrandName() {
  const env = (globalThis as GlobalWithProcess).process?.env;
  const value = env?.NEXT_PUBLIC_BRAND_NAME;
  return value && value.length > 0 ? value : undefined;
}

const FALLBACK_BRAND = 'ART';
const DEFAULT_BRAND = resolveBrandName() ?? FALLBACK_BRAND;

function sanitizeSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9_\-.:]/g, '_');
}

function brandSegment() {
  return DEFAULT_BRAND ? `:${sanitizeSegment(DEFAULT_BRAND)}` : '';
}

function hostSegments() {
  if (typeof window === 'undefined') {
    return { raw: '', legacy: [] as string[] };
  }
  const host = window.location?.host ?? 'local';
  const raw = `:${host}`;
  const legacySanitized = `:${sanitizeSegment(host)}`;
  const legacy = legacySanitized !== raw ? [legacySanitized] : ([] as string[]);
  return { raw, legacy };
}

export function resolveScopedStorageKey(baseKey: string, override?: string): string {
  const seed = override ?? baseKey;
  let key = seed;
  const brand = brandSegment();
  if (brand && !key.includes(brand)) key += brand;

  const { raw: hostRaw, legacy: legacyHosts } = hostSegments();
  if (hostRaw) {
    for (const legacy of legacyHosts) {
      if (legacy && key.includes(legacy)) {
        key = key.replace(legacy, hostRaw);
      }
    }
    if (!key.includes(hostRaw)) key += hostRaw;
  }
  return key;
}

export function legacyStorageKeyCandidates(baseKey: string, override?: string): string[] {
  const brand = brandSegment();
  const { raw: hostRaw, legacy: legacyHosts } = hostSegments();
  const seeds = new Set<string>();
  const addSeed = (value?: string) => {
    if (!value) return;
    seeds.add(value);
    if (brand) seeds.add(`${value}${brand}`);
  };
  addSeed(baseKey);
  addSeed(override);

  const variants = new Set<string>();
  for (const seed of seeds) {
    variants.add(seed);
    if (hostRaw) variants.add(`${seed}${hostRaw}`);
    for (const legacy of legacyHosts) {
      variants.add(`${seed}${legacy}`);
    }
  }
  return Array.from(variants);
}

export function cleanupLegacyStorageKeys(activeKey: string, legacyKeys: string[]) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  for (const key of legacyKeys) {
    if (!key || key === activeKey) continue;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore cleanup failures (private mode, etc.)
    }
  }
}
