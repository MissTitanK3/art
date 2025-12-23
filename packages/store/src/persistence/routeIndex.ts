import { deleteRecord, getAllRecords, getRecord, putRecord } from './indexedDb';
import { resolveScopedStorageKey } from '../utils/storage';

export type RouteKind = 'intake' | 'region-response';

export type RouteIndexEntry = {
  id: string;
  kind: RouteKind;
  createdAt: number;
  updatedAt: number;
  version: number;
  schemaVersion?: number;
  label?: string;
  tombstone?: boolean;
};

const ROUTE_INDEX_SCHEMA_VERSION = 1;
const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ROUTE_INDEX_STORAGE_KEY = resolveScopedStorageKey('route-index-v1');

type IndexMap = Record<string, RouteIndexEntry>;

const normalizeEntry = (entry: RouteIndexEntry): RouteIndexEntry => ({
  ...entry,
  schemaVersion: entry.schemaVersion ?? ROUTE_INDEX_SCHEMA_VERSION,
});

function normalizeIndexMap(map: IndexMap): IndexMap {
  const normalized: IndexMap = {};
  for (const [id, entry] of Object.entries(map)) {
    if (!entry) continue;
    normalized[id] = normalizeEntry(entry);
  }
  return normalized;
}

function pruneTombstones(map: IndexMap): { kept: IndexMap; prunedIds: string[] } {
  const now = Date.now();
  const kept: IndexMap = {};
  const prunedIds: string[] = [];

  for (const entry of Object.values(map)) {
    const normalized = normalizeEntry(entry);
    const isExpiredTombstone = normalized.tombstone && now - normalized.updatedAt > TOMBSTONE_TTL_MS;
    if (isExpiredTombstone) {
      prunedIds.push(normalized.id);
      continue;
    }
    kept[normalized.id] = normalized;
  }

  return { kept, prunedIds };
}

function readLocalIndex(): IndexMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ROUTE_INDEX_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as IndexMap;
    return parsed && typeof parsed === 'object' ? normalizeIndexMap(parsed) : {};
  } catch {
    return {};
  }
}

function writeLocalIndex(map: IndexMap) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ROUTE_INDEX_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore write failures (private mode, quota, etc.)
  }
}

function mergeEntry(current: RouteIndexEntry | undefined, next: RouteIndexEntry) {
  if (!current) return next;
  if (next.updatedAt >= current.updatedAt) return next;
  return current;
}

export async function upsertRouteIndexEntry(entry: RouteIndexEntry) {
  const normalized = normalizeEntry(entry);
  const map = readLocalIndex();
  map[normalized.id] = mergeEntry(map[normalized.id], normalized);
  writeLocalIndex(map);
  await putRecord('route-index', normalized);
}

export async function markRouteIndexTombstone(id: string, kind: RouteKind) {
  const existing = (await getRouteIndexEntry(id)) ?? {
    id,
    kind,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    schemaVersion: ROUTE_INDEX_SCHEMA_VERSION,
  };
  const tombstone: RouteIndexEntry = normalizeEntry({ ...existing, tombstone: true, updatedAt: Date.now() });
  const map = readLocalIndex();
  map[id] = tombstone;
  writeLocalIndex(map);
  await putRecord('route-index', tombstone);
}

export async function getRouteIndexEntry(id: string) {
  const local = readLocalIndex()[id];
  if (local) return normalizeEntry(local);
  const fromDb = await getRecord<RouteIndexEntry>('route-index', id);
  if (!fromDb) return null;
  const normalized = normalizeEntry(fromDb);
  const map = readLocalIndex();
  map[id] = normalized;
  writeLocalIndex(map);
  return normalized;
}

export async function listRouteIndexEntries(kind?: RouteKind) {
  const localMap = readLocalIndex();
  const localEntries = Object.values(localMap);
  const dbEntries = await getAllRecords<RouteIndexEntry>('route-index');

  const merged: IndexMap = {};
  for (const entry of [...localEntries, ...dbEntries.map(normalizeEntry)]) {
    merged[entry.id] = mergeEntry(merged[entry.id], entry);
  }

  const { kept, prunedIds } = pruneTombstones(merged);
  if (prunedIds.length) {
    const nextLocal = { ...localMap };
    for (const id of prunedIds) {
      delete nextLocal[id];
    }
    writeLocalIndex(nextLocal);
    await Promise.all(prunedIds.map((id) => deleteRecord('route-index', id)));
  }

  const list = Object.values(kept).filter((entry) => !entry.tombstone);
  const filtered = kind ? list.filter((entry) => entry.kind === kind) : list;
  return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteRouteIndexEntry(id: string) {
  const map = readLocalIndex();
  delete map[id];
  writeLocalIndex(map);
  await deleteRecord('route-index', id);
}
