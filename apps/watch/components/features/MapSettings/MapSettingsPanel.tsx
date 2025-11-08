'use client';

import TileLayerDropdown from '@/components/map/TileLayerDropdown';
import { useMapTile } from '@/lib/MapTileContext';

export default function MapSettingsPanel({ onSelected }: { onSelected?: () => void }) {
  const { tile } = useMapTile();
  return (
    <div className="space-y-4">
      <div className="text-white/80 text-sm">Current basemap: <span className="font-semibold text-white">{tile.name}</span></div>
      <TileLayerDropdown onSelected={onSelected} />
      <p className="text-xs text-white/60">Attribution: {tile.attribution}</p>
    </div>
  );
}
