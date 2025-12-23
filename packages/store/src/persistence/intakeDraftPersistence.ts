import type { IntakeDraft } from '../useIntakeDraftStore';
import { deleteRecord, getRecord, putRecord } from './indexedDb';
import { markRouteIndexTombstone, upsertRouteIndexEntry, type RouteIndexEntry } from './routeIndex';

const INTAKE_VERSION = 1;

export type IntakeDraftRecord = {
  id: string;
  draft: IntakeDraft;
  version: number;
  updatedAt: number;
};

export async function saveIntakeDraft(id: string, draft: IntakeDraft) {
  const updatedAt = draft.lastUpdatedAt ? new Date(draft.lastUpdatedAt).getTime() : Date.now();
  const record: IntakeDraftRecord = {
    id,
    draft,
    version: INTAKE_VERSION,
    updatedAt,
  };
  await putRecord('intake-drafts', record);

  const indexEntry: RouteIndexEntry = {
    id,
    kind: 'intake',
    createdAt: draft.lastUpdatedAt ? new Date(draft.lastUpdatedAt).getTime() : updatedAt,
    updatedAt,
    version: INTAKE_VERSION,
    label: draft.caseRef || id,
  };
  await upsertRouteIndexEntry(indexEntry);

  return record;
}

export async function loadIntakeDraft(id: string) {
  const record = await getRecord<IntakeDraftRecord>('intake-drafts', id);
  return record ?? null;
}

export async function removeIntakeDraft(id: string) {
  await deleteRecord('intake-drafts', id);
  await markRouteIndexTombstone(id, 'intake');
}
