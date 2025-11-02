export type NeedUrgency = 'low' | 'normal' | 'urgent';
import type { AccessRole } from './roles.ts';
// Visibility is scoped to authenticated users within a region.
// Support legacy values plus role-based minimum access gates.
export type NeedVisibility = 'public' | 'region' | 'pod' | `role:${AccessRole}`;
export type NeedStatus = 'open' | 'matched' | 'fulfilled' | 'closed';

export interface NeedLocation {
  type?: 'online' | 'in-person' | 'approx_area';
  label?: string;
  lat?: number;
  lng?: number;
  [key: string]: any;
}

export interface NeedResponder {
  profile_id: string;
  resource_type: 'time' | 'transport' | 'supplies' | 'funding' | 'other';
  notes?: string;
  created_at: string;
}

export interface MeetANeed {
  id: string;
  created_by?: string | null;
  category: string;
  description: string;
  urgency: NeedUrgency;
  visibility: NeedVisibility;
  location?: NeedLocation;
  contact_preference?: string;
  status: NeedStatus;
  responders: NeedResponder[];
  assigned_to?: string[];
  fulfilled_at?: string | null;
  created_at: string;
}
