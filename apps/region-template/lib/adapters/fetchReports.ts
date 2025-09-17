import { WizardReport } from '@workspace/store/types/watch.ts';

const SUPABASE_URL = 'https://cwvmnkfcqijgflotqpid.supabase.co';
const WIZARD_ENDPOINT = `${SUPABASE_URL}/rest/v1/wizard`;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WIZZARD ?? '';

// 7 days in ms
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7;
const CACHE_KEY = 'wizardReports';

interface CacheEntry {
  timestamp: number;
  data: WizardReport[];
}

export async function fetchReports(options?: {
  since?: string; // ISO timestamp filter
  includeTests?: boolean;
  forceRefresh?: boolean;
}): Promise<WizardReport[]> {
  const { since, includeTests = false, forceRefresh = false } = options || {};

  // If since not provided, default to 7 days ago
  const cutoff = since ?? new Date(Date.now() - CACHE_TTL).toISOString();

  // 1. Try localStorage cache (keyed by cutoff)
  const cacheKey = `${CACHE_KEY}:${cutoff}`;
  if (!forceRefresh && typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed: CacheEntry = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          return parsed.data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  // 2. Build query
  const params = new URLSearchParams();
  params.set('order', 'timestamp.desc');
  if (!includeTests) params.set('test', 'eq.false');
  if (cutoff) params.set('timestamp', `gte.${cutoff}`);

  // 3. Fetch from Supabase
  const res = await fetch(`${WIZARD_ENDPOINT}?${params.toString()}`, {
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch reports: ${res.statusText}`);
  }

  const data: WizardReport[] = await res.json();

  // 4. Save to cache
  if (typeof window !== 'undefined') {
    const entry: CacheEntry = { timestamp: Date.now(), data };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  }

  return data;
}
