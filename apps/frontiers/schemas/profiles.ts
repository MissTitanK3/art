// Profiles table shape for Supabase autocompletion
export type Profile = {
  id: string;
  display_name: string;
  region_id: string;
  sector_code?: string;
  // Optional dock location for rest bonuses
  dock_lat?: number | null;
  dock_lng?: number | null;
  dock_radius_km?: number | null;
};
