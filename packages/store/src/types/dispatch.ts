export interface DispatchAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // blob:// URL for temporary display
}

export interface DispatchUpdate {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  attachments?: DispatchAttachment[];
}

export interface LogisticsItem {
  id: string;
  category: 'transport' | 'supply' | 'comms' | 'rally_point' | 'other';
  description: string;
  quantity?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  responsibleParty?: { type: 'user'; userId: string } | { type: 'anon'; name: string };
  warehouse?: { name?: string; location?: string; contact?: string };
  accountabilityNotes?: string;
  updatedAt: string;
}

export type DispatchStatus =
  | 'preplanning'
  | 'unconfirmed'
  | 'confirmed'
  | 'mobilizing'
  | 'in_progress'
  | 'debriefing'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'archived';

export type DispatchType =
  | 'rapid_response'
  | 'planned_event'
  | 'training'
  | 'community_aid'
  | 'technical_aid'
  | 'other';
