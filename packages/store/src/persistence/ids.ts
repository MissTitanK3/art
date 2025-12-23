import type { RouteKind } from './routeIndex';

function randomFragment() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRouteId(kind: RouteKind) {
  const base = randomFragment();
  return `${kind}-${base}`;
}

// Backward-compatible alias; prefer createRouteId going forward.
export const createDeterministicId = createRouteId;

export function timestampId(prefix: string) {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(
    now.getMinutes(),
  )}`;
  return `${prefix}-${stamp}`;
}
