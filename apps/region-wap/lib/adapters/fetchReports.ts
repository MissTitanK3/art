import { WizardReport } from '@workspace/store/types/watch.ts';

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

  const cutoff = since ?? null;

  // 1. Try localStorage cache (keyed by cutoff)
  const cacheKey = cutoff ? `${CACHE_KEY}:${cutoff}` : `${CACHE_KEY}:all`;
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
  params.set('includeTests', String(includeTests));
  if (cutoff) params.set('since', cutoff);

  let res: Response;
  try {
    res = await fetch(`/api/watch/reports?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (e: any) {
    const message = e?.message || 'Network error';
    throw new Error(`Failed to fetch reports: ${message}`);
  }

  if (!res.ok) {
    const status = `${res.status} ${res.statusText}`.trim();
    const body = await res.json().catch(() => null);
    const detail = body?.error ? `: ${body.error}` : '';
    throw new Error(`Failed to fetch reports: ${status}${detail}`);
  }

  const payload = await res.json();
  const reports: WizardReport[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.reports)
      ? payload.reports
      : [];

  // 4. Save to cache
  if (typeof window !== 'undefined') {
    const entry: CacheEntry = { timestamp: Date.now(), data: reports };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  }

  return reports;
}
