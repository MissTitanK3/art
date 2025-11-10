export type CrewCatalog = {
  id: string;
  name: string;
  role?: string | null;
  tier: number;
  description?: string | null;
  bonuses?: Record<string, number> | null;
  feats?: Record<string, boolean> | null;
  disadvantages?: Record<string, boolean> | null;
  cost?: number | null;
  image_url?: string | null;
  allowed_positions?: string[] | null;
  rank?: string | null;
  upkeep?: number | null;
};

export type ProfileCrew = {
  profile_id: string;
  crew_id: string;
  hired_at: string;
  status: "active" | "inactive";
};
