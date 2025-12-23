import type { RegionResponseSession } from '../useRegionResponseStore';
import { deleteRecord, getRecord, putRecord } from './indexedDb';
import { markRouteIndexTombstone, upsertRouteIndexEntry, type RouteIndexEntry } from './routeIndex';

const REGION_RESPONSE_VERSION = 1;

export type RegionResponseRecord = RegionResponseSession & {
  version: number;
  updatedAt: number;
};

export async function saveRegionResponseSession(session: RegionResponseSession) {
  const record: RegionResponseRecord = {
    ...session,
    version: REGION_RESPONSE_VERSION,
    updatedAt: Date.now(),
  };
  await putRecord('region-response-sessions', record);

  const indexEntry: RouteIndexEntry = {
    id: session.id,
    kind: 'region-response',
    createdAt: new Date(session.startedAt).getTime(),
    updatedAt: record.updatedAt,
    version: REGION_RESPONSE_VERSION,
    label: session.responseRef,
  };
  await upsertRouteIndexEntry(indexEntry);

  return record;
}

export async function loadRegionResponseSession(id: string) {
  const record = await getRecord<RegionResponseRecord>('region-response-sessions', id);
  return record ?? null;
}

export async function removeRegionResponseSession(id: string) {
  await deleteRecord('region-response-sessions', id);
  await markRouteIndexTombstone(id, 'region-response');
}
