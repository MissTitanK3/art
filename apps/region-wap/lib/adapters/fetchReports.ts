import { WizardReport } from '@workspace/store/types/watch.ts';

// Keep cache extremely short so dispatch can see fresh reports
// const CACHE_TTL = 1000 * 60 * 2; // 2 minutes
const CACHE_TTL = 0; // No caching
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

  const params = new URLSearchParams();
  params.set('includeTests', String(includeTests));
  if (cutoff) params.set('since', cutoff);
  params.set('_ts', Date.now().toString());

  let res: Response;
  try {
    res = await fetch(`/api/watch/reports?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
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

  if (typeof window !== 'undefined') {
    const entry: CacheEntry = { timestamp: Date.now(), data: reports };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  }

  return reports;
}
