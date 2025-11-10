"use client";

// Lightweight in-memory cache for GET /api/ships/current with a 60s TTL by default
type CacheEntry = { ts: number; json: any };
const currentShipCache = new Map<string, CacheEntry>();

function buildUrl(profileId: string) {
  // Avoid propagating unrelated search params like ?tab=
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const u = new URL("/api/ships/current", base || "http://localhost");
  u.searchParams.set("profile_id", profileId);
  return u.toString();
}

export async function fetchCurrentShipCached(
  profileId: string,
  ttlMs = 60_000,
): Promise<any> {
  if (!profileId) return null;
  const now = Date.now();
  const entry = currentShipCache.get(profileId);
  if (entry && now - entry.ts < ttlMs) {
    return entry.json;
  }
  const url = buildUrl(profileId);
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Failed to load current ship");
  currentShipCache.set(profileId, { ts: now, json });
  return json;
}

export function invalidateCurrentShipCache(profileId: string) {
  if (profileId) currentShipCache.delete(profileId);
}
