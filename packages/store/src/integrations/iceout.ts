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

// Iceout sends category_enum integers. These labels are taken directly from their API
// and mapped onto our Confirmed Watch agency options.
const CATEGORY_TO_AGENCY: Record<
  number,
  { agency: string; label: string }
> = {
  1: { agency: "ICE", label: "ICE presence" },
  2: { agency: "Police", label: "Police" },
  3: { agency: "Sheriff", label: "Sheriff" },
  4: { agency: "Border Patrol", label: "Border Patrol" },
  5: { agency: "Detention Facility", label: "Detention Facility" },
  6: { agency: "Military", label: "Military" },
};

function normalizeIceoutReport(report: IceoutApiReport): NormalizedIceoutReport | null {
  if (!report?.location?.coordinates) return null;
  const [lng, lat] = report.location.coordinates;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const timestamp = report.incident_time ?? report.created_at ?? null;
  if (!timestamp) return null;

  const categoryInfo =
    typeof report.category_enum === "number"
      ? CATEGORY_TO_AGENCY[report.category_enum] ?? null
      : null;
  const agency = categoryInfo?.agency ?? "Other";

  // Keep raw enum hints alongside our mapped agency for easier auditing/debugging.
  const hints: string[] = [];
  if (categoryInfo && typeof report.category_enum === "number") {
    hints.push(`iceout_category_enum:${report.category_enum} (${categoryInfo.label})`);
  } else if (typeof report.category_enum === "number") {
    hints.push(`iceout_category_enum:${report.category_enum}`);
  }
  if (typeof report.status === "number") {
    hints.push(`iceout_status:${report.status}`);
  }

  return {
    external_id: `iceout-${report.id}`,
    timestamp,
    agency_type: [agency],
    agency_other: hints.join(" | "),
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
