"use client"

import { createJSONStorage, PersistStorage } from 'zustand/middleware'

function openDB(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'))
      return
    }
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function withStore<T>(db: IDBDatabase, storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => T) {
  const tx = db.transaction(storeName, mode)
  const store = tx.objectStore(storeName)
  return fn(store)
}

export function createIndexedDBStorage(dbName = 'frontiers-zustand', storeName = 'kv') {
  return createJSONStorage(() => ({
    getItem: async (name: string) => {
      const db = await openDB(dbName, storeName)
      return new Promise<string | null>((resolve, reject) => {
        const request = withStore(db, storeName, 'readonly', (store) => store.get(name)) as IDBRequest
        request.onsuccess = () => resolve((request.result as string) ?? null)
        request.onerror = () => reject(request.error)
      })
    },
    setItem: async (name: string, value: string) => {
      const db = await openDB(dbName, storeName)
      return new Promise<void>((resolve, reject) => {
        const request = withStore(db, storeName, 'readwrite', (store) => store.put(value, name)) as IDBRequest
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    },
    removeItem: async (name: string) => {
      const db = await openDB(dbName, storeName)
      return new Promise<void>((resolve, reject) => {
        const request = withStore(db, storeName, 'readwrite', (store) => store.delete(name)) as IDBRequest
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    },
  }))
}
