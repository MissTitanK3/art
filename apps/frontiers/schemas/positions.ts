export type PositionTemplate = {
  position_id: string;
  slots: number;
  required: boolean;
  shifts: number;
  positions_catalog?: { id?: string; name?: string | null } | null;
};

export type Assignment = {
  position_id: string;
  slot_index: number;
  shift: number;
  crew_id: string | null;
};
