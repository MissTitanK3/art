export const ICEOUT_ENDPOINT = "https://iceout.org/api/reports/";

export const DEFAULT_ICEOUT_TOKEN =
  "d89cb7bea075320a77ebe60fd9f827b8104b5eba88aa2ccc4824c0e3eb7dd11d";

export type IceoutApiReport = {
  id: number;
  approved?: boolean;
  location?: {
    type: string;
    coordinates?: [number, number];
  };
  location_description?: string | null;
  category_enum?: number | null;
  small_thumbnail?: string | null;
  incident_time?: string | null;
  created_at?: string | null;
  status?: number | null;
};

export type NormalizedIceoutReport = {
  external_id: string;
  timestamp: string;
  agency_type: string[];
  agency_other: string;
  location: { lat: number; lng: number };
  media_url: string | null;
  officer_moving: boolean | null;
  officer_direction: string | null;
  lights_on: boolean | null;
  sirens_on: boolean | null;
  submitted_by: null;
  test: boolean | null;
  external_source: "iceout";
};

const CATEGORY_TO_AGENCY: Record<number, string> = {
  1: "ICE",
  2: "Police",
  3: "Sheriff",
  4: "Border Patrol",
  5: "Detention Facility",
  6: "Military",
};

function normalizeIceoutReport(report: IceoutApiReport): NormalizedIceoutReport | null {
  if (!report?.location?.coordinates) return null;
  const [lng, lat] = report.location.coordinates;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const timestamp = report.incident_time ?? report.created_at ?? null;
  if (!timestamp) return null;

  const agency =
    (report.category_enum && CATEGORY_TO_AGENCY[report.category_enum]) || "Other";

  return {
    external_id: `iceout-${report.id}`,
    timestamp,
    agency_type: [agency],
    agency_other: "",
    location: { lat, lng },
    media_url: report.small_thumbnail ?? null,
    officer_moving: null,
    officer_direction: null,
    lights_on: null,
    sirens_on: null,
    submitted_by: null,
    test: null,
    external_source: "iceout",
  };
}

type FetchParams = {
  sinceIso: string;
  token: string;
  endpoint?: string;
};

export async function fetchIceoutReports({
  sinceIso,
  token,
  endpoint = ICEOUT_ENDPOINT,
}: FetchParams): Promise<NormalizedIceoutReport[]> {
  const url = new URL(endpoint);
  url.searchParams.set("archived", "False");
  url.searchParams.set("incident_time__gte", sinceIso);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Token ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Iceout fetch failed with status ${res.status}`);
  }

  const payload = (await res.json()) as IceoutApiReport[];
  return (
    payload
      ?.filter((item) => item && item.approved !== false)
      .map(normalizeIceoutReport)
      .filter((item): item is NormalizedIceoutReport => !!item) ?? []
  );
}
