// Resonance effects table shape for Supabase autocompletion
export type ResonanceEffect = {
  id: string;
  source_id: string;
  recipient_id: string;
  hop: number;
  strength: number;
  expires_at: string | null; // ISO timestamp or null
};
