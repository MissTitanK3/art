export type ShipState = {
  profile_id: string
  ship_condition: number // 0.0–1.0 or 0–100 depending on backend; frontend scales to 1–100
  morale: number // 0.0–1.0 or 0–100
  fatigue: number // 0.0–1.0
  last_update: string
}

