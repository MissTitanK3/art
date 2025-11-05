export type ShipComponent = {
  id: string;
  profile_id: string;
  slot: 'hull' | 'engine' | 'comms' | 'aux' | 'scanner' | 'weapon';
  kind: string;
  level: number;
  integrity: number; // 0..1
  installed_at: string;
  updated_at: string;
};
