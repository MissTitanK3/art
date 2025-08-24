'use client';

import * as React from 'react';
import * as L from 'lucide-react';

export const navIconMap = {
  radio: L.Radio,
  'map-pin': L.MapPin,
  'graduation-cap': L.GraduationCap,
  shield: L.Shield,
  settings: L.Settings,
  book: L.Book,
  link: L.Link2,
  home: L.HomeIcon,
  new: L.PlusCircle,
  // add more as needed
} as const;

export type NavIconId = keyof typeof navIconMap;

export type LucideIcon = React.ForwardRefExoticComponent<
  React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
>;
