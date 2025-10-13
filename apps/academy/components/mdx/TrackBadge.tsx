// components/ui/TrackBadge.tsx
'use client';

import { cn } from '@/lib/utils';
import { Scale, ShieldCheck, Heart, Zap, Radio, Package, Gavel, Users, Compass, Languages } from 'lucide-react';

// Step 1: Define all variants as a literal array
export const TRACK_VARIANTS = [
  'default',
  'observation-legal',
  'field-safety',
  'community-care',
  'direct-action',
  'tech-comms',
  'logistics',
  'court-support',
  'pod-leadership',
  'movement-strategy',
  'translator',
  'asl',
  'faith-support',
  'survivor-escort',
  'vehicle-specialist',
] as const;

// Step 2: Derive the type from the array
export type TrackVariant = (typeof TRACK_VARIANTS)[number];

interface TrackBadgeProps {
  variant: TrackVariant;
  className?: string;
}

// Step 3: Ensure config is typed to this variant list
const trackConfig: Record<TrackVariant, { label: string; icon: React.ElementType; color: string }> = {
  default: {
    label: 'Core Module (All Tracks)',
    icon: Compass,
    color: 'bg-gray-100 text-gray-700',
  },
  'observation-legal': {
    label: 'Observation & Legal Track',
    icon: Scale,
    color: 'bg-purple-200 text-purple-800',
  },
  'field-safety': {
    label: 'Field Safety & Stabilization Track',
    icon: ShieldCheck,
    color: 'bg-blue-200 text-blue-800',
  },
  'community-care': {
    label: 'Community Care & Emotional Support',
    icon: Heart,
    color: 'bg-pink-200 text-pink-800',
  },
  'direct-action': {
    label: 'Direct Action & Protective Roles',
    icon: Zap,
    color: 'bg-red-200 text-red-800',
  },
  'tech-comms': {
    label: 'Tech & Comms Track',
    icon: Radio,
    color: 'bg-green-200 text-green-800',
  },
  logistics: {
    label: 'Logistics & Mutual Aid Operations',
    icon: Package,
    color: 'bg-yellow-200 text-yellow-800',
  },
  'court-support': {
    label: 'Court & Post-Raid Support',
    icon: Gavel,
    color: 'bg-indigo-200 text-indigo-800',
  },
  'pod-leadership': {
    label: 'Pod Leadership & Organizing',
    icon: Users,
    color: 'bg-orange-200 text-orange-800',
  },
  'movement-strategy': {
    label: 'Movement Strategy & Ethics',
    icon: Compass,
    color: 'bg-gray-200 text-gray-800',
  },
  translator: {
    label: 'Translator (Micro-Badge)',
    icon: Languages,
    color: 'bg-teal-200 text-teal-800',
  },
  asl: {
    label: 'ASL Interpreter (Micro-Badge)',
    icon: Languages,
    color: 'bg-teal-200 text-teal-800',
  },
  'faith-support': {
    label: 'Faith & Cultural Support (Micro-Badge)',
    icon: Heart,
    color: 'bg-pink-200 text-pink-800',
  },
  'survivor-escort': {
    label: 'Survivor Escort (Micro-Badge)',
    icon: ShieldCheck,
    color: 'bg-blue-200 text-blue-800',
  },
  'vehicle-specialist': {
    label: 'Vehicle Specialist (Micro-Badge)',
    icon: Package,
    color: 'bg-yellow-200 text-yellow-800',
  },
};

export function TrackBadge({ variant, className }: TrackBadgeProps) {
  const { label, icon: Icon, color } = trackConfig[variant];

  return (
    <div className="w-full flex justify-center my-4">
      <span
        className={cn(
          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium shadow-sm',
          color,
          className,
        )}>
        <Icon size={14} strokeWidth={2} />
        {label}
      </span>
    </div>
  );
}
