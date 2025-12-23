const DB_NAME = 'region-responder-offline';
const DB_VERSION = 1;

export type OfflineStoreName = 'route-index' | 'region-response-sessions' | 'intake-drafts';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase | null>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('route-index')) {
        db.createObjectStore('route-index', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('region-response-sessions')) {
        db.createObjectStore('region-response-sessions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('intake-drafts')) {
        db.createObjectStore('intake-drafts', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    console.error('[indexeddb] open failed', error);
    return null;
  });

  return dbPromise ?? Promise.resolve(null);
}

async function withStore<T>(
  storeName: OfflineStoreName,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => void | T | Promise<T>,
): Promise<T | null> {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let opDone = false;
    let txComplete = false;
    let resolved = false;
    let opResult: T | null = null;

    const tryResolve = () => {
      if (resolved) return;
      if (opDone && txComplete) {
        resolved = true;
        resolve(opResult);
      }
    };

    tx.oncomplete = () => {
      txComplete = true;
      tryResolve();
    };
    tx.onerror = () => {
      if (resolved) return;
      resolved = true;
      reject(tx.error);
    };

    try {
      const result = run(store);
      if (result instanceof Promise) {
        result
          .then((value) => {
            opResult = (value ?? null) as T | null;
            opDone = true;
            tryResolve();
          })
          .catch((error) => {
            if (resolved) return;
            resolved = true;
            reject(error);
          });
      } else {
        opResult = (result ?? null) as T | null;
        opDone = true;
        tryResolve();
      }
    } catch (error) {
      if (resolved) return;
      resolved = true;
      reject(error);
    }
  }).catch((error) => {
    console.error(`[indexeddb] transaction failed for ${storeName}`, error);
    return null;
  });
}

export async function putRecord<T extends { id: string }>(storeName: OfflineStoreName, value: T) {
  await withStore(storeName, 'readwrite', (store) => {
    store.put(value);
  });
}

export async function getRecord<T>(storeName: OfflineStoreName, key: IDBValidKey) {
  const result = await withStore<T | null>(
    storeName,
    'readonly',
    (store) =>
      new Promise<T | null>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
      }),
  );
  return result ?? null;
}

export async function deleteRecord(storeName: OfflineStoreName, key: IDBValidKey) {
  await withStore(storeName, 'readwrite', (store) => {
    store.delete(key);
  });
}

export async function getAllRecords<T>(storeName: OfflineStoreName) {
  const result = await withStore<T[]>(
    storeName,
    'readonly',
    (store) =>
      new Promise<T[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      }),
  );
  return result ?? [];
}

export async function clearStore(storeName: OfflineStoreName) {
  await withStore(storeName, 'readwrite', (store) => {
    store.clear();
  });
}

export function supportsIndexedDb() {
  return typeof indexedDB !== 'undefined';
}
