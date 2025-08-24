// store/trust.ts (zustand)
import { create } from 'zustand';
import { TrustDraft, TrustEntry, TrustPatch } from './trust';

function isoNow() {
  return new Date().toISOString();
}
// stub hash — replace with real hash if/when needed
function fakeHash(input: string) {
  return `hash:${btoa(input)}`;
}

type TrustState = {
  trustList: TrustEntry[];

  addTrust: (draft: TrustDraft) => void;
  updateTrust: (subjectId: string, patch: TrustPatch) => void;
  toggleTrustByIndex: (idx: number) => void;
};

export const useTrustStore = create<TrustState>((set, get) => ({
  trustList: [],

  addTrust: (draft) => {
    // enforce required fields are present
    const entry: TrustEntry = {
      subjectId: draft.subjectId!,
      signerId: draft.signerId!,
      signer_role: draft.signer_role!,
      signer_rot: draft.signer_rot!,
      status: draft.status!,
      signed_at: isoNow(),
      signed_entry_hash: fakeHash(
        `${draft.subjectId}|${draft.signerId}|${draft.signer_role}|${draft.signer_rot}|${draft.status}`,
      ),
    };
    set((s) => ({ trustList: [entry, ...s.trustList] }));
  },

  updateTrust: (subjectId, patch) => {
    set((s) => {
      const i = s.trustList.findIndex((e) => e.subjectId === subjectId);
      if (i === -1) return s;

      const current = s.trustList[i];

      const next: TrustEntry = {
        ...current,
        ...patch,
        // enforce still required
        subjectId: current?.subjectId || '',
        signerId: current?.signerId || '',
        signer_role: current?.signer_role || 'pod_leader',
        signer_rot: current?.signer_rot || '',
        signed_at: current?.signed_at || '',
        signed_entry_hash: current?.signed_entry_hash || '',
        status: patch?.status ? current?.status! : 'inactive',
      };
      const copy = s.trustList.slice();
      copy[i] = next;
      return { trustList: copy };
    });
  },

  toggleTrustByIndex: (idx) => {
    set((s) => {
      const entry = s.trustList[idx];
      if (!entry) return s;
      const next: TrustEntry = {
        ...entry,
        status: entry.status === 'active' ? 'inactive' : 'active',
      };
      const copy = s.trustList.slice();
      copy[idx] = next;
      return { trustList: copy };
    });
  },
}));
