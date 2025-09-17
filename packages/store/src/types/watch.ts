export interface WizardReport {
  id: number;
  timestamp: string;
  agency_type: string[] | null;
  agency_other: string | null;
  location: Record<string, any> | null;
  media_url: string | null;
  officer_moving: boolean | null;
  officer_direction: string | null;
  lights_on: boolean | null;
  sirens_on: boolean | null;
  submitted_by: string | null;
  test: boolean | null;
}
