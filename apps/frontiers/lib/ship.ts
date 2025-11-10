import { supabase } from "@/lib/supabaseClient";
import type { ShipState } from "@/schemas/ship";

export async function fetchShipState(profileId: string) {
  // maybeSingle avoids 406 when the row doesn't exist yet
  const { data, error } = await supabase
    .from("ship_states")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return (data as ShipState) || null;
}

export async function resetShipState(profileId: string) {
  // Expects a Postgres function reset_state(profile_id uuid/text)
  const { data, error } = await supabase.rpc("reset_state", {
    profile_id: profileId,
  });
  if (error) throw error;
  return data as ShipState | null;
}
