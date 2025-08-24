// packages/types/trust.ts
export interface TrustAdapter {
  listEntries(): Promise<any[]>;
  addEntry(entry: any): Promise<void>;
  removeEntry(id: string): Promise<void>;
}

export type TrustStatus = 'active' | 'inactive';
export type TrustRole = 'regional_admin' | 'pod_leader' | 'trainer';

export type TrustEntry = {
  subjectId: string; // required
  signerId: string; // required
  signer_role: TrustRole; // required
  signer_rot: string; // required (e.g., ROT fingerprint)
  signed_at: string; // ISO string
  signed_entry_hash: string; // hash of signed content
  status: TrustStatus; // 'active' | 'inactive'
};

// Data coming from forms before we finalize it:
export type TrustDraft = {
  subjectId: string;
  signerId: string;
  signer_role: TrustRole;
  signer_rot: string;
  status: TrustStatus;
};

// For partial updates:
export type TrustPatch = Partial<TrustEntry>;
