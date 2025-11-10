// context/MapTileContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const TILE_LAYERS = {
  osmStandard: {
    name: "OpenStreetMap Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    mode: "light" as const,
  },
  osmFrance: {
    name: "OSM France",
    url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap France contributors",
    mode: "light" as const,
  },
  osmGermany: {
    name: "OSM Germany",
    url: "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    mode: "light" as const,
  },
  cartoDark: {
    name: "Carto Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CartoDB",
    mode: "dark" as const,
  },
  esriStreet: {
    name: "Esri World Street Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
    mode: "light" as const,
  },
  esriImagery: {
    name: "Esri World Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
    mode: "light" as const,
  },
  esriTopo: {
    name: "Esri World Topo Map",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
    mode: "light" as const,
  },
  opentopomap: {
    name: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap contributors",
    mode: "light" as const,
  },
} as const;

type TileKey = keyof typeof TILE_LAYERS;
type Tile = (typeof TILE_LAYERS)[TileKey];

const MapTileContext = createContext<{
  tileKey: TileKey;
  setTileKey: (key: TileKey) => void;
  tile: Tile;
}>({
  tileKey: "cartoDark",
  setTileKey: () => {},
  tile: TILE_LAYERS.cartoDark,
});

export const MapTileProvider = ({ children }: { children: ReactNode }) => {
  const [tileKey, setTileKey] = useState<TileKey>(
    (typeof window !== "undefined" &&
      (localStorage.getItem("mapTile") as TileKey)) ||
      "cartoDark",
  );

  const tile = TILE_LAYERS[tileKey];

  const updateTileKey = (key: TileKey) => {
    setTileKey(key);
    localStorage.setItem("mapTile", key);
  };

  return (
    <MapTileContext.Provider
      value={{ tileKey, setTileKey: updateTileKey, tile }}
    >
      {children}
    </MapTileContext.Provider>
  );
};

export const useMapTile = () => useContext(MapTileContext);
export const MAP_TILE_OPTIONS = TILE_LAYERS;
