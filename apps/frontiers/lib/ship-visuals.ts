export type Point = { top: number; left: number; rotation?: number; layer?: 'bottom' | 'top'; width?: number };

export interface HullVisualConfig {
  engine_positions: Point[]; // Array of engine positions
  weapon_mounts: {
    primary?: Point;
    secondary?: Point;
  };
}

// Default config if none is found
export const DEFAULT_VISUAL_CONFIG: HullVisualConfig = {
  engine_positions: [{ top: 80, left: 50 }],
  weapon_mounts: {
    primary: { top: 40, left: 50 },
  },
};

// Map hull asset paths to their visual configuration
// Coordinates are in percentages relative to the container
export const HULL_VISUALS: Record<string, HullVisualConfig> = {
  "/assets/hulls/light_scout_hull.png": {
    engine_positions: [{ top: 70, left: 25, rotation: 40, layer: 'top', width: 20 }, { top: 76, left: 36, rotation: 40, layer: 'top', width: 20 }],
    weapon_mounts: { primary: { top: 30, left: 50 } },
  },
  "/assets/hulls/light_combat_haul.png": {
    engine_positions: [{ top: 42, left: 43, rotation: 180, layer: 'bottom', width: 20 }, { top: 42, left: 57, rotation: 180, layer: 'bottom', width: 20 }],
    weapon_mounts: { primary: { top: 35, left: 50 } },
  },
  "/assets/hulls/medium_fighter_hull.png": {
    engine_positions: [{ top: 71, left: 35, rotation: 34, layer: 'bottom', width: 50 }, { top: 71, left: 35, rotation: 34, layer: 'bottom', width: 30 }, { top: 71, left: 35, rotation: 34, layer: 'bottom', width: 20 }],
    weapon_mounts: { primary: { top: 45, left: 50 } },
  },
  "/assets/hulls/medium_hauler_hull.png": {
    engine_positions: [{ top: 88, left: 50 }],
    weapon_mounts: { primary: { top: 20, left: 50 } },
  },
  "/assets/hulls/heavy_battleship_hull.png": {
    engine_positions: [{ top: 80, left: 40 }, { top: 80, left: 60 }], // Example dual engine
    weapon_mounts: { primary: { top: 50, left: 50 } },
  },
  "/assets/hulls/heavy_cargo_haul.png": {
    engine_positions: [{ top: 92, left: 50 }],
    weapon_mounts: { primary: { top: 25, left: 50 } },
  },
  "/assets/hulls/heavy_miner_hull.png": {
    engine_positions: [{ top: 85, left: 50 }],
    weapon_mounts: { primary: { top: 40, left: 50 } },
  },
  "/assets/hulls/superheavy_carrier_hull.png": {
    engine_positions: [{ top: 85, left: 40 }, { top: 85, left: 60 }],
    weapon_mounts: { primary: { top: 30, left: 50 } },
  },
  "/assets/hulls/superheavy_flag_hull.png": {
    engine_positions: [{ top: 55, left: 37 }, { top: 75, left: 50 }, { top: 50, left: 63 }], // Triple engine
    weapon_mounts: { primary: { top: 40, left: 50 } },
  },
};

export const getHullVisuals = (hullSrc: string): HullVisualConfig => {
  return HULL_VISUALS[hullSrc] || DEFAULT_VISUAL_CONFIG;
};
