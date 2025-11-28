import { ShipCatalog } from "@/schemas/ships";

export const getHullAsset = (ship: ShipCatalog): string => {
  const { mass_class, role } = ship;

  // Explicit mapping for known assets
  // Based on file list:
  // heavy_battleship_hull.png
  // heavy_cargo_haul.png
  // heavy_miner_hull.png
  // light_combat_haul.png
  // light_scout_hull.png
  // medium_fighter_hull.png
  // medium_hauler_hull.png
  // superheavy_carrier_hull.png
  // superheavy_flag_hull.png

  if (mass_class === "heavy") {
    if (role === "miner") return "/assets/hulls/heavy_miner_hull.png";
    if (role === "hauler") return "/assets/hulls/heavy_cargo_haul.png";
    if (role === "combat" || role === "flagship") return "/assets/hulls/heavy_battleship_hull.png";
  }

  if (mass_class === "light") {
    if (role === "scout") return "/assets/hulls/light_scout_hull.png";
    if (role === "combat") return "/assets/hulls/light_combat_haul.png"; // Assuming 'haul' is a typo or specific name
  }

  if (mass_class === "medium") {
    if (role === "hauler") return "/assets/hulls/medium_hauler_hull.png";
    if (role === "combat" || role === "patrol") return "/assets/hulls/medium_fighter_hull.png";
  }

  if (mass_class === "superheavy") {
    if (role === "carrier") return "/assets/hulls/superheavy_carrier_hull.png";
    if (role === "flagship") return "/assets/hulls/superheavy_flag_hull.png";
  }

  // Fallback to a default if no specific match found
  // For now, return a placeholder or the most generic one
  return "/assets/hulls/medium_fighter_hull.png";
};

export const getSlotAsset = (slotType: string, slotValue: string | null): string | null => {
  if (!slotValue) return null;

  // Map slot values to filenames
  // beam_lance.png
  // dual_cannons.png
  // missle_bay.png
  // railgun.png
  // rapid_fire_turret.png
  // siege_cannon.png
  // tactical_missles.png

  const assetMap: Record<string, string> = {
    "beam_lance": "beam_lance.png",
    "dual_cannons": "dual_cannons.png",
    "missile_bay": "missle_bay.png", // Handle typo in filename
    "railgun": "railgun.png",
    "rapid_fire_turret": "rapid_fire_turret.png",
    "siege_cannon": "siege_cannon.png",
    "tactical_missiles": "tactical_missles.png", // Handle typo in filename
    "light_cannon": "dual_cannons.png", // Fallback/Mapping
    "heavy_cannon": "siege_cannon.png", // Fallback/Mapping
  };

  if (assetMap[slotValue]) {
    return `/assets/weapons/${assetMap[slotValue]}`;
  }

  return null;
};

export const getFactionColor = (factionTags: string[]): string => {
  if (factionTags.includes("frontier_militia")) return "#ff4400"; // Orange/Red
  if (factionTags.includes("terraformers_union")) return "#ffee00"; // Yellow
  if (factionTags.includes("planetary_guard")) return "#0088ff"; // Blue
  if (factionTags.includes("civil_fleet")) return "#00ff88"; // Green
  if (factionTags.includes("shadow_comms")) return "#aa00ff"; // Purple
  if (factionTags.includes("imperial_navy")) return "#ff0000"; // Red
  return "#ffffff"; // White default
};
