export interface CountyProps {
  GEO_ID: string;
  STATE: string;
  COUNTY: string;
  NAME: string;
  LSAD: string;
  CENSUSAREA: number;
}

export type PublicReport = {
  id: string;
  lat: number;
  lng: number;
  time: string; // ISO
  category?: 'sighting' | 'checkpoint' | 'activity';
  confidence?: 'low' | 'med' | 'high';
};

export interface SelectedCounty {
  GEO_ID: string; // e.g. "0500000US01029"
  NAME: string; // human name
  STATE: string; // 2-digit FIPS state string (e.g. "01")
  ZONE: number[]; // optional grid cells marked as partial coverage
}
