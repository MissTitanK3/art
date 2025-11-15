type LocationInfo = {
  city: string | null;
  county: string | null;
  state: string | null;
  stateCode: string | null;
};

const locationCache = new Map<string, Promise<LocationInfo>>();

function normalizeCoord(lat: number, lng: number, precision = 2) {
  return `${lat.toFixed(precision)},${lng.toFixed(precision)}`;
}

function storageKey(key: string) {
  return `location:${key}`;
}

function readFromStorage(key: string): LocationInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocationInfo>;
    return {
      city: parsed.city ?? null,
      county: parsed.county ?? null,
      state: parsed.state ?? null,
      stateCode: parsed.stateCode ?? null,
    };
  } catch {
    return null;
  }
}

function writeToStorage(key: string, value: LocationInfo) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // ignore write failures
  }
}

export async function resolveLocationInfo(lat: number, lng: number): Promise<LocationInfo> {
  const key = normalizeCoord(lat, lng);

  if (locationCache.has(key)) {
    return locationCache.get(key)!;
  }

  const stored = readFromStorage(key);
  if (stored) {
    locationCache.set(key, Promise.resolve(stored));
    return stored;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (!res.ok) {
        return { city: null, county: null, state: null, stateCode: null };
      }

      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || null;

      const county =
        data.address?.county ||
        data.address?.municipality ||
        data.address?.city_district ||
        data.address?.state_district ||
        null;

      const state = data.address?.state ?? null;
      const stateCode =
        data.address?.state_code ?? (typeof data.address?.state === 'string' ? data.address.state : null);

      const info: LocationInfo = {
        city,
        county,
        state,
        stateCode: typeof stateCode === 'string' ? stateCode : null,
      };

      writeToStorage(key, info);
      return info;
    } catch (err) {
      console.error('reverse geocode failed', err);
      return { city: null, county: null, state: null, stateCode: null };
    }
  })();

  locationCache.set(key, promise);

  const result = await promise;
  locationCache.set(key, Promise.resolve(result));
  return result;
}
