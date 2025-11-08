'use client';

import { MAP_TILE_OPTIONS, useMapTile } from '@/lib/MapTileContext';

export default function TileLayerDropdown({ onSelected }: { onSelected?: () => void } = {}) {
  const { tileKey, setTileKey } = useMapTile();

  return (
    <div className="flex flex-col items-start w-full max-w-sm">
      <label htmlFor="tileSelector" className="text-sm font-semibold text-white mb-1">
        🗺️ Basemap
      </label>

      <div className="relative w-full">
        <select
          id="tileSelector"
          value={tileKey}
          onChange={(e) => {
            setTileKey(e.target.value as keyof typeof MAP_TILE_OPTIONS);
            onSelected?.();
          }}
          className="appearance-none w-full px-4 py-2 pr-10 text-white text-sm font-medium rounded-lg  bg-white/10 backdrop-blur-md border border-white/20 shadow transition  hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50">
          {Object.entries(MAP_TILE_OPTIONS).map(([key, layer]) => (
            <option
              key={key}
              value={key}
              className="bg-[#1e1e1e] text-white/90" // softened from bright white/black
            >
              {layer.name}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
