export type ReportFormData = {
  agency_type: string[];
  agency_other: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  media_url: File | null;
  officer_moving: boolean | null;
  officer_direction:
    | "North"
    | "NorthEast"
    | "East"
    | "SouthEast"
    | "South"
    | "SouthWest"
    | "West"
    | "NorthWest"
    | null;
  lights_on: boolean | null;
  sirens_on: boolean | null;
  test: boolean | null;
};

export type Report = {
  id: string;
  agency_type: string[];
  agency_other: string;
  location: {
    lat: number;
    lng: number;
  };
  media_url: string | null;
  timestamp: string;
  officer_moving: boolean | null;
  officer_direction:
    | "North"
    | "NorthEast"
    | "East"
    | "SouthEast"
    | "South"
    | "SouthWest"
    | "West"
    | "NorthWest"
    | null;
  lights_on: boolean | null;
  sirens_on: boolean | null;
  submitted_by: string | null;
  test: boolean | null;
};

export type QueuedReport = ReportFormData & {
  id: string; // UUID
  timestamp: string; // ISO string
  synced?: boolean;
  media_url?: string | null;
};
