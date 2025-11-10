import { WizardReport } from "@workspace/store/types/watch.ts";

// Prefer env-configured endpoint so regions can override without code changes
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL_WIZZARD ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";
const WIZARD_ENDPOINT = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1/wizard` : "";
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_WIZZARD ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// 7 days in ms
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7;
const CACHE_KEY = "wizardReports";

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
  if (!forceRefresh && typeof window !== "undefined") {
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
  params.set("order", "timestamp.desc");
  if (!includeTests) params.set("test", "eq.false");
  if (cutoff) params.set("timestamp", `gte.${cutoff}`);

  // 3. Fetch from Supabase
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL_WIZZARD and/or NEXT_PUBLIC_SUPABASE_ANON_KEY_WIZZARD. See apps/region-template/.env.local.example",
    );
  }

  let res: Response;
  try {
    res = await fetch(`${WIZARD_ENDPOINT}?${params.toString()}`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        Accept: "application/json",
      },
    });
  } catch (e: any) {
    const message = e?.message || "Network error";
    throw new Error(`Failed to fetch reports: ${message}`);
  }

  if (!res.ok) {
    const status = `${res.status} ${res.statusText}`.trim();
    throw new Error(`Failed to fetch reports: ${status}`);
  }

  const data: WizardReport[] = await res.json();

  // 4. Save to cache
  if (typeof window !== "undefined") {
    const entry: CacheEntry = { timestamp: Date.now(), data };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  }

  return data;
}
