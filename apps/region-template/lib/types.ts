// lib/types.ts
export type Id = string;

export type Volunteer = {
  id: Id;
  handle: string;
  langs: string[];
  skills: string[];
  status: 'active' | 'inactive' | 'suspended';
};

export type Pod = { id: Id; name: string; area?: string };

export type Shift = {
  id: Id;
  podId: Id;
  startsAt: string;
  endsAt: string;
  tz: string;
  notes?: string;
};

export type Dispatch = {
  id: Id;
  podId: Id;
  type: 'observation' | 'support';
  status: 'open' | 'assigned' | 'closed';
  openedAt: string;
  closedAt?: string;
  summary?: string;
};

export type MutableDispatchPatch = Partial<Omit<Dispatch, 'id' | 'openedAt'>>;
