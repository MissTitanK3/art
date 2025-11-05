export type ShipCatalog = {
  id: string;
  name: string;
  tier: number;
  description: string | null;
  required_days: number;
  base_slots: Record<string, string | null> | null;
  image_url?: string | null;
};

export type ProfileShip = {
  profile_id: string;
  ship_id: string;
  acquired_at: string;
  updated_at: string;
};
