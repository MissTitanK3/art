export const AGENCY_OPTIONS: string[] = [
  'ICE',
  'Police',
  'State Police',
  'Sheriff',
  'Border Patrol',
  'Immigration Court',
  'Detention Facility',
  'Unmarked',
  'Military',
];

export const AGENCY_GRADIENTS: Record<string, Record<number, string>> = {
  ICE: {
    0.2: 'rgba(0, 255, 255, 0.2)',
    0.4: '#00ffff',
    0.8: '#ffffff',
  },
  Police: {
    0.2: 'rgba(0, 255, 0, 0.2)',
    0.4: '#00ff00',
    0.8: '#ffffff',
  },
  'State Police': {
    0.2: 'rgba(0, 255, 0, 0.2)',
    0.4: '#00ff00',
    0.8: '#ffffff',
  },
  Sheriff: {
    0.2: 'rgba(255, 255, 0, 0.2)',
    0.4: '#ffff00',
    0.8: '#ffffff',
  },
  'Border Patrol': {
    0.2: 'rgba(255, 102, 0, 0.2)',
    0.4: '#ff6600',
    0.8: '#ffffff',
  },
  'Immigration Court': {
    0.2: 'rgba(255, 0, 255, 0.2)',
    0.4: '#ff00ff',
    0.8: '#ffffff',
  },
  'Detention Facility': {
    0.2: 'rgba(255, 0, 0, 0.2)',
    0.4: '#ff0000',
    0.8: '#ffffff',
  },
  Unmarked: {
    0.2: 'rgba(180, 180, 180, 0.2)',
    0.4: '#dddddd',
    0.8: '#ffffff',
  },
  Military: {
    0.2: 'rgba(255, 165, 0, 0.2)',
    0.4: '#ffa500',
    0.8: '#ffffff',
  },
  other: {
    0.2: 'rgba(128, 128, 128, 0.2)',
    0.4: '#888888',
    0.8: '#ffffff',
  },
};

export const agencyColors: Record<string, string> = {
  ICE: 'bg-cyan-700',
  Police: 'bg-green-700',
  'State Police': 'bg-green-700',
  Sheriff: 'bg-yellow-700',
  'Border Patrol': 'bg-orange-700',
  'Immigration Court': 'bg-pink-600',
  'Detention Facility': 'bg-red-700',
  Unmarked: 'bg-gray-700',
  Military: 'bg-amber-700',
  Other: 'bg-slate-600',
};

export const AGENCY_GRADIENTS_LIGHT: Record<string, Record<number, string>> = {
  ICE: {
    0.2: '#66c2c2', // medium teal
    0.4: '#008080', // solid teal
    0.8: '#001a1a', // almost black teal
  },
  Police: {
    0.2: '#66b266', // medium green
    0.4: '#006600', // solid green
    0.8: '#001a00', // deep forest
  },
  Sheriff: {
    0.2: '#d9b300', // mustard
    0.4: '#806600', // brown-yellow
    0.8: '#1a1500', // dark brown
  },
  'Border Patrol': {
    0.2: '#ff9933', // bright orange
    0.4: '#cc5200', // burnt orange
    0.8: '#1a0d00', // deep brown
  },
  'Immigration Court': {
    0.2: '#cc66cc', // medium magenta
    0.4: '#660066', // purple
    0.8: '#1a001a', // near-black purple
  },
  'Detention Facility': {
    0.2: '#e06666', // medium red
    0.4: '#800000', // blood red
    0.8: '#1a0000', // near-black red
  },
  Unmarked: {
    0.2: '#999999', // gray
    0.4: '#4d4d4d', // dark gray
    0.8: '#0d0d0d', // black
  },
  Military: {
    0.2: '#e6b366', // tan
    0.4: '#804d00', // dark amber
    0.8: '#1a0d00', // deep brown
  },
  other: {
    0.2: '#808080', // medium gray
    0.4: '#333333', // dark gray
    0.8: '#000000', // pure black
  },
};

export const AGENCY_GRADIENTS_DARK: Record<string, Record<number, string>> = {
  ICE: { 0.2: 'rgba(0, 255, 255, 0.2)', 0.4: '#00ffff', 0.8: '#000000' },
  Police: { 0.2: 'rgba(0, 255, 0, 0.2)', 0.4: '#00ff00', 0.8: '#000000' },
  'State Police': { 0.2: 'rgba(0, 255, 0, 0.2)', 0.4: '#00ff00', 0.8: '#000000' },
  Sheriff: { 0.2: 'rgba(255, 255, 0, 0.2)', 0.4: '#ffff00', 0.8: '#000000' },
  'Border Patrol': { 0.2: 'rgba(255, 102, 0, 0.2)', 0.4: '#ff6600', 0.8: '#000000' },
  'Immigration Court': { 0.2: 'rgba(255, 0, 255, 0.2)', 0.4: '#ff00ff', 0.8: '#000000' },
  'Detention Facility': { 0.2: 'rgba(255, 0, 0, 0.2)', 0.4: '#ff0000', 0.8: '#000000' },
  Unmarked: { 0.2: 'rgba(180, 180, 180, 0.2)', 0.4: '#dddddd', 0.8: '#000000' },
  Military: { 0.2: 'rgba(255, 165, 0, 0.2)', 0.4: '#ffa500', 0.8: '#000000' },
  other: { 0.2: 'rgba(128, 128, 128, 0.2)', 0.4: '#888888', 0.8: '#000000' },
};
