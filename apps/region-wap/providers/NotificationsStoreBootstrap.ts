'use client';

// Set a region-scoped storage key for the shared notifications store before any consumers import it.
// This prevents cross-region bleed when apps share an origin.
if (typeof globalThis !== 'undefined') {
  // Only set if not already defined to keep idempotence in Fast Refresh/Hot Reload
  if (!(globalThis as any).__ART_NOTIFICATIONS_STORAGE_KEY) {
    (globalThis as any).__ART_NOTIFICATIONS_STORAGE_KEY = 'notifications-store:region-wap';
  }
}
