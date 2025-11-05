import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function roundCoord(value: string, places = 4): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const p = Math.pow(10, places);
  return Math.round(n * p) / p;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latRaw = searchParams.get('lat');
  const lngRaw = searchParams.get('lng');

  if (!latRaw || !lngRaw) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const lat = roundCoord(latRaw, 4);
  const lng = roundCoord(lngRaw, 4);
  if (lat === null || lng === null) {
    return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400, headers: { 'cache-control': 'no-store' } });
  }

  const contact = process.env.REVERSE_GEOCODE_CONTACT || process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
  const userAgent = contact ? `AlwaysReadyTools/1.0 (+${contact})` : 'AlwaysReadyTools/1.0';

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': userAgent, // required by OSM usage policy
      Accept: 'application/json',
    },
    // best-effort caching at the fetch layer is not guaranteed; rely on response headers below
    cache: 'no-store',
  });

  if (res.status === 429) {
    const retry = res.headers.get('retry-after') ?? undefined;
    return NextResponse.json(
      { error: 'RATE_LIMITED' },
      { status: 429, headers: { 'cache-control': 'no-store', ...(retry ? { 'retry-after': retry } : {}) } },
    );
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502, headers: { 'cache-control': 'no-store' } });
  }

  const data = await res.json();
  // Publicly cache for 1 hour on CDN, allow stale-while-revalidate for a day
  return NextResponse.json(data, {
    headers: {
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      vary: 'Accept',
    },
  });
}
