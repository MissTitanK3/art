'use client';

type PushSubscriptionPayload = ReturnType<PushSubscription['toJSON']>;

function base64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = globalThis.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    typeof Notification !== 'undefined'
  );
}

async function getRegistration() {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function getExistingSubscription() {
  const registration = await getRegistration();
  if (!registration) return null;
  try {
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

async function persistSubscription(sub: PushSubscription) {
  const payload: PushSubscriptionPayload | null = typeof sub.toJSON === 'function' ? sub.toJSON() : null;
  if (!payload) return;
  const res = await fetch('/api/save-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to save subscription');
  }
}

export async function enablePushNotifications() {
  if (!isPushSupported()) return null;

  const currentPermission = Notification.permission;
  const perm =
    currentPermission === 'granted' ? currentPermission : await Notification.requestPermission();
  if (perm !== 'granted') {
    throw new Error('Notification permission was not granted');
  }

  const registration = await getRegistration();
  if (!registration) {
    throw new Error('Service worker is not ready');
  }

  let subscription = await registration.pushManager.getSubscription();
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!subscription) {
    if (!vapidKey) {
      throw new Error('Missing VAPID public key');
    }
    const serverKey = base64ToUint8Array(vapidKey);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: serverKey,
    });
  }

  await persistSubscription(subscription);
  return subscription;
}

export async function disablePushNotifications() {
  if (!isPushSupported()) return;
  const registration = await getRegistration();
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  try {
    await fetch('/api/save-subscription', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    });
  } catch {
    // Swallow network errors; subscription already removed locally
  }
}
