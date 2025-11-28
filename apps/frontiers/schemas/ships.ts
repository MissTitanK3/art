export type ShipCatalog = {
  id: string;
  name: string;
  tier: number;
  role:
    | "scout"
    | "hauler"
    | "combat"
    | "miner"
    | "patrol"
    | "carrier"
    | "flagship";
  mass_class: "light" | "medium" | "heavy" | "superheavy";
  description: string | null;
  required_days: number;
  crew_requirements: number;
  upkeep_cost: number; // per day
  fuel_efficiency: number; // higher = longer range, lower supply usage
  power_capacity: number; // max upgrade load
  rarity: "common" | "uncommon" | "rare" | "elite" | "legendary";
  faction_tags: string[];
  base_slots: Record<string, string | null> | null;
  optional_modifiers:
    | {
        speed_bonus?: number;
        cargo_bonus?: number;
        stealth_bonus?: number;
        morale_bonus?: number;
      }
    | null;
  morale_influence: number; // positive = inspiring, negative = draining
  sector_bonus: Record<string, number>; // region -> % boost
  depreciation_rate: number; // 0–1, % of value lost if sold or downgraded
  image_url?: string | null;
};

export type ProfileShip = {
  profile_id: string;
  ship_id: string;
  acquired_at: string;
  updated_at: string;
};

export const SHIP_CATALOG: ShipCatalog[] = [
  {
    id: "swiftling_scout",
    name: "Swiftling Scout",
    tier: 1,
    role: "scout",
    mass_class: "light",
    description: "Fast recon craft. Cheap to maintain but fragile.",
    required_days: 3,
    crew_requirements: 1,
    upkeep_cost: 1,
    fuel_efficiency: 0.9,
    power_capacity: 2,
    rarity: "common",
    faction_tags: ["neutral"],
    base_slots: {
      engine: "basic_thruster",
      sensor: "scout_radar",
      weapon: null,
      utility: null,
    },
    optional_modifiers: { speed_bonus: 0.1 },
    morale_influence: 0.0,
    sector_bonus: { frontier: 0.05 },
    depreciation_rate: 0.6,
    image_url: null,
  },
  {
    id: "bulwark_hauler",
    name: "Bulwark Hauler",
    tier: 1,
    role: "hauler",
    mass_class: "medium",
    description: "Low-tech cargo vessel with tiny crew.",
    required_days: 4,
    crew_requirements: 2,
    upkeep_cost: 1,
    fuel_efficiency: 0.85,
    power_capacity: 2,
    rarity: "common",
    faction_tags: ["neutral"],
    base_slots: {
      engine: "hauler_drive",
      cargo: "small_hold",
      sensor: null,
      weapon: null,
    },
    optional_modifiers: { cargo_bonus: 0.2 },
    morale_influence: -0.05,
    sector_bonus: { colony: 0.05 },
    depreciation_rate: 0.65,
    image_url: null,
  },
  {
    id: "ember_sparrow",
    name: "Ember Sparrow",
    tier: 2,
    role: "combat",
    mass_class: "light",
    description: "Escort fighter. High morale impact but low endurance.",
    required_days: 7,
    crew_requirements: 3,
    upkeep_cost: 2,
    fuel_efficiency: 0.7,
    power_capacity: 3,
    rarity: "uncommon",
    faction_tags: ["frontier_militia"],
    base_slots: {
      engine: "combat_thruster_mk1",
      weapon_primary: "light_cannon",
      utility: "countermeasures",
    },
    optional_modifiers: { morale_bonus: 0.1 },
    morale_influence: 0.1,
    sector_bonus: { frontier: 0.1 },
    depreciation_rate: 0.55,
    image_url: null,
  },
  {
    id: "deepwatch_miner",
    name: "Deepwatch Miner",
    tier: 2,
    role: "miner",
    mass_class: "heavy",
    description: "Mining ship with low speed and high power drain.",
    required_days: 8,
    crew_requirements: 4,
    upkeep_cost: 3,
    fuel_efficiency: 0.5,
    power_capacity: 4,
    rarity: "uncommon",
    faction_tags: ["terraformers_union"],
    base_slots: {
      engine: "industrial_drive",
      mining: "laser_drill",
      cargo: "ore_bay",
      utility: "geo_scanner",
    },
    optional_modifiers: { cargo_bonus: 0.15 },
    morale_influence: -0.1,
    sector_bonus: { industrial: 0.15 },
    depreciation_rate: 0.5,
    image_url: null,
  },
  {
    id: "skywarden_patrol",
    name: "Skywarden Patrol",
    tier: 3,
    role: "patrol",
    mass_class: "medium",
    description: "Interception unit. Good sensors, moderate arms.",
    required_days: 12,
    crew_requirements: 5,
    upkeep_cost: 4,
    fuel_efficiency: 0.65,
    power_capacity: 5,
    rarity: "rare",
    faction_tags: ["planetary_guard"],
    base_slots: {
      engine: "intercept_drive",
      weapon_primary: "rapid_fire_turret",
      sensor: "long_range_array",
      utility: "armor_booster",
    },
    optional_modifiers: { speed_bonus: 0.05 },
    morale_influence: 0.05,
    sector_bonus: { homeworld: 0.1 },
    depreciation_rate: 0.45,
    image_url: null,
  },
  {
    id: "tempest_liner",
    name: "Tempest Liner",
    tier: 3,
    role: "carrier",
    mass_class: "heavy",
    description: "Crew carrier. Good for expeditions but costly.",
    required_days: 10,
    crew_requirements: 10,
    upkeep_cost: 6,
    fuel_efficiency: 0.6,
    power_capacity: 4,
    rarity: "rare",
    faction_tags: ["civil_fleet"],
    base_slots: {
      engine: "efficient_drive_mk2",
      cargo: "passenger_cabins",
      utility: "shield_array",
    },
    optional_modifiers: { morale_bonus: 0.2 },
    morale_influence: 0.15,
    sector_bonus: { civ: 0.1 },
    depreciation_rate: 0.4,
    image_url: null,
  },
  {
    id: "razorwind_frigate",
    name: "Razorwind Frigate",
    tier: 4,
    role: "combat",
    mass_class: "medium",
    description: "Frontline warship with big upgrades available.",
    required_days: 18,
    crew_requirements: 12,
    upkeep_cost: 8,
    fuel_efficiency: 0.55,
    power_capacity: 6,
    rarity: "rare",
    faction_tags: ["frontier_militia"],
    base_slots: {
      engine: "war_core_mk1",
      weapon_primary: "dual_cannons",
      weapon_secondary: "missile_bay",
      shield: "deflector_mk1",
    },
    optional_modifiers: {},
    morale_influence: 0.1,
    sector_bonus: { frontier: 0.15 },
    depreciation_rate: 0.35,
    image_url: null,
  },
  {
    id: "atlas_colossus",
    name: "Atlas Colossus",
    tier: 4,
    role: "hauler",
    mass_class: "heavy",
    description: "Logistics giant. Massive capacity, sluggish mobility.",
    required_days: 20,
    crew_requirements: 15,
    upkeep_cost: 7,
    fuel_efficiency: 0.45,
    power_capacity: 5,
    rarity: "rare",
    faction_tags: ["neutral"],
    base_slots: {
      engine: "mass_lifter_drive",
      cargo: "mega_hold",
      utility: "nav_assist_ai",
    },
    optional_modifiers: { cargo_bonus: 0.4 },
    morale_influence: -0.15,
    sector_bonus: { industrial: 0.1 },
    depreciation_rate: 0.3,
    image_url: null,
  },
  {
    id: "voidseer_recon",
    name: "Voidseer Recon",
    tier: 5,
    role: "scout",
    mass_class: "light",
    description: "Elite stealth probe carrier. Hates combat.",
    required_days: 28,
    crew_requirements: 6,
    upkeep_cost: 10,
    fuel_efficiency: 0.9,
    power_capacity: 5,
    rarity: "elite",
    faction_tags: ["shadow_comms"],
    base_slots: {
      engine: "silent_vector_mk2",
      sensor: "quantum_probe",
      utility: "cloaking_module",
    },
    optional_modifiers: { stealth_bonus: 0.3 },
    morale_influence: 0.0,
    sector_bonus: { stealth_sector: 0.15 },
    depreciation_rate: 0.25,
    image_url: null,
  },
  {
    id: "sovereign_battleship",
    name: "Sovereign Battleship",
    tier: 6,
    role: "flagship",
    mass_class: "superheavy",
    description: "Massive artillery platform with morale presence.",
    required_days: 40,
    crew_requirements: 30,
    upkeep_cost: 15,
    fuel_efficiency: 0.4,
    power_capacity: 8,
    rarity: "legendary",
    faction_tags: ["imperial_navy"],
    base_slots: {
      engine: "war_core_mk3",
      weapon_primary: "siege_cannon",
      weapon_secondary: "tactical_missiles",
      shield: "aegis_plate",
      utility: "command_bridge",
    },
    optional_modifiers: { morale_bonus: 0.3 },
    morale_influence: 0.25,
    sector_bonus: { throne_sector: 0.2 },
    depreciation_rate: 0.15,
    image_url: null,
  },
];
