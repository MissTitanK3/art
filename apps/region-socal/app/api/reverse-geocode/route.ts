import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const PRECISION = 3;
const CACHE_TTL_MS = 1000 * 60 * 60; // keep in sync with s-maxage header
const MAX_CACHE_ENTRIES = 2048;

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

type CountyBounds = {
  south: number;
  north: number;
  west: number;
  east: number;
};

type CountyCacheEntry = CacheEntry & {
  bounds?: CountyBounds;
};

interface ReverseGeocodeGlobals {
  __artReverseGeocodeCache?: Map<string, CacheEntry>;
  __artReverseCountyCache?: Map<string, CountyCacheEntry>;
  __artReverseGeocodeInFlight?: Map<string, Promise<unknown>>;
}

const globalBucket = globalThis as typeof globalThis & ReverseGeocodeGlobals;

const coordCache = globalBucket.__artReverseGeocodeCache ?? new Map<string, CacheEntry>();
if (!globalBucket.__artReverseGeocodeCache) {
  globalBucket.__artReverseGeocodeCache = coordCache;
}

const countyCache = globalBucket.__artReverseCountyCache ?? new Map<string, CountyCacheEntry>();
if (!globalBucket.__artReverseCountyCache) {
  globalBucket.__artReverseCountyCache = countyCache;
}

const inFlight = globalBucket.__artReverseGeocodeInFlight ?? new Map<string, Promise<unknown>>();
if (!globalBucket.__artReverseGeocodeInFlight) {
  globalBucket.__artReverseGeocodeInFlight = inFlight;
}

class RateLimitError extends Error {
  retryAfter?: string;

  constructor(retryAfter?: string) {
    super('RATE_LIMITED');
    this.retryAfter = retryAfter;
  }
}

class UpstreamError extends Error {
  constructor() {
    super('Upstream error');
  }
}

function roundCoord(value: string, places = PRECISION): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const p = Math.pow(10, places);
  return Math.round(n * p) / p;
}

function makeCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(PRECISION)}:${lng.toFixed(PRECISION)}`;
}

function pruneCoordCache() {
  if (coordCache.size <= MAX_CACHE_ENTRIES) return;
  const iterator = coordCache.keys();
  while (coordCache.size > MAX_CACHE_ENTRIES) {
    const next = iterator.next();
    if (next.done) break;
    coordCache.delete(next.value);
  }
}

function pruneCountyCache() {
  if (countyCache.size <= MAX_CACHE_ENTRIES) return;
  const iterator = countyCache.keys();
  while (countyCache.size > MAX_CACHE_ENTRIES) {
    const next = iterator.next();
    if (next.done) break;
    countyCache.delete(next.value);
  }
}

async function fetchFromUpstream(lat: number, lng: number, userAgent: string) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': userAgent, // required by OSM usage policy
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (res.status === 429) {
    throw new RateLimitError(res.headers.get('retry-after') ?? undefined);
  }

  if (!res.ok) {
    throw new UpstreamError();
  }

  return res.json();
}

function parseBoundingBox(raw: unknown): CountyBounds | undefined {
  if (!Array.isArray(raw) || raw.length !== 4) return undefined;
  const [southRaw, northRaw, westRaw, eastRaw] = raw;
  const south = Number(southRaw);
  const north = Number(northRaw);
  const west = Number(westRaw);
  const east = Number(eastRaw);
  if ([south, north, west, east].some((v) => !Number.isFinite(v))) {
    return undefined;
  }

  return { south, north, west, east };
}

function deriveCountyKey(data: any): string | null {
  if (!data || typeof data !== 'object') return null;
  const address = (data as any).address;
  if (!address) return null;

  const countyLike =
    address.county ??
    address.municipality ??
    address.city_district ??
    address.state_district ??
    address.town ??
    address.city;
  const stateLike = address.state ?? address.region ?? address.province;
  const countryLike = address.country ?? address.country_code;

  const parts = [countyLike, stateLike, countryLike].filter(Boolean);
  if (parts.length === 0) return null;

  return parts.join('|');
}

function findCountyMatch(lat: number, lng: number) {
  const now = Date.now();
  for (const [key, entry] of countyCache) {
    if (entry.expiresAt <= now) {
      countyCache.delete(key);
      continue;
    }

    const bounds = entry.bounds;
    if (!bounds) continue;

    if (lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east) {
      return entry;
    }
  }

  return undefined;
}

async function resolveReverseGeocode(lat: number, lng: number, userAgent: string) {
  const cacheKey = makeCacheKey(lat, lng);
  const now = Date.now();
  const cached = coordCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return { data: cached.data, cacheHit: true };
  }

  if (cached) {
    coordCache.delete(cacheKey);
  }

  const countyMatch = findCountyMatch(lat, lng);
  if (countyMatch) {
    coordCache.set(cacheKey, { data: countyMatch.data, expiresAt: countyMatch.expiresAt });
    return { data: countyMatch.data, cacheHit: true };
  }

  let pending = inFlight.get(cacheKey);
  if (!pending) {
    pending = (async () => {
      const data = await fetchFromUpstream(lat, lng, userAgent);
      const expiresAt = Date.now() + CACHE_TTL_MS;
      coordCache.set(cacheKey, { data, expiresAt });
      pruneCoordCache();

      const countyKey = deriveCountyKey(data);
      if (countyKey) {
        const bounds = parseBoundingBox((data as any)?.boundingbox);
        countyCache.set(countyKey, { data, expiresAt, bounds });
        pruneCountyCache();
      }

      return data;
    })();
    inFlight.set(cacheKey, pending);
  }

  try {
    const data = await pending;
    return { data, cacheHit: false };
  } finally {
    inFlight.delete(cacheKey);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latRaw = searchParams.get('lat');
  const lngRaw = searchParams.get('lng');

  if (!latRaw || !lngRaw) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const lat = roundCoord(latRaw, PRECISION);
  const lng = roundCoord(lngRaw, PRECISION);
  if (lat === null || lng === null) {
    return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const contact = process.env.REVERSE_GEOCODE_CONTACT || process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
  const userAgent = contact ? `AlwaysReadyTools/1.0 (+${contact})` : 'AlwaysReadyTools/1.0';

  try {
    const { data, cacheHit } = await resolveReverseGeocode(lat, lng, userAgent);

    return NextResponse.json(data, {
      headers: {
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        vary: 'Accept',
        'x-art-reverse-cache': cacheHit ? 'HIT' : 'MISS',
      },
    });
  } catch (err: unknown) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'RATE_LIMITED' },
        {
          status: 429,
          headers: {
            'cache-control': 'no-store',
            ...(err.retryAfter ? { 'retry-after': err.retryAfter } : {}),
          },
        },
      );
    }

    if (err instanceof UpstreamError) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502, headers: { 'cache-control': 'no-store' } });
    }

    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}
