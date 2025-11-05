export type TileProvider = {
  id: string;
  label: string;
  url: string;
  attribution: string;
  maxNativeZoom?: number;
};

const mapTilerKey = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_MAPTILER_KEY : undefined;

export const TILE_PROVIDERS: TileProvider[] = [
  {
    id: 'osm',
    label: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
  },
  ...(mapTilerKey
    ? [
        {
          id: 'maptiler-streets',
          label: 'MapTiler Streets',
          url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapTilerKey}`,
          attribution:
            '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; OpenStreetMap contributors',
          maxNativeZoom: 20,
        } as TileProvider,
      ]
    : []),
  {
    id: 'osm-direct',
    label: 'OSM (Direct)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
  },
  {
    id: 'osm-hot',
    label: 'OSM Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution:
      'Tiles courtesy of <a href="https://www.openstreetmap.fr/">OpenStreetMap France</a> &mdash; &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
  },
  {
    id: 'osm-fr',
    label: 'OSM France',
    url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    attribution:
      'Tiles courtesy of <a href="https://www.openstreetmap.fr/">OpenStreetMap France</a> &mdash; &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxNativeZoom: 19,
  },
  {
    id: 'carto-positron',
    label: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 19,
  },
  {
    id: 'carto-dark-matter',
    label: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 19,
  },
  {
    id: 'carto-voyager',
    label: 'Carto Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 19,
  },
  {
    id: 'opentopomap',
    label: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://viewfinderpanoramas.org">SRTM</a>',
    maxNativeZoom: 17,
  },
  {
    id: 'usgs-topo',
    label: 'USGS Topo',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles courtesy of the <a href="https://www.usgs.gov/">USGS</a>',
    maxNativeZoom: 16,
  },
];

export const DEFAULT_TILE_PROVIDER = TILE_PROVIDERS[0]!;
export const TILE_PROVIDER_STORAGE_KEY = 'frontiers-map-tile-provider';
