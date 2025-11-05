import { notificationsStore } from '@workspace/store/useNotificationsStore';
import { NOTIFICATION_CHANNELS, type NotificationChannel } from '@workspace/store/types/notifications';
import { toast } from 'sonner';

export type NotifyOpts = {
  id?: string;
  title: string;
  body?: string;
  level?: 'info' | 'success' | 'warning' | 'error';
  channel?: NotificationChannel | string;
  link?: string;
  sticky?: boolean;
  ttlMs?: number;
  icon?: string;
};

export function notify(opts: NotifyOpts) {
  // Narrow channel to a known, centralized union to satisfy store typings
  const channel: NotificationChannel | undefined =
    opts.channel && (NOTIFICATION_CHANNELS as readonly string[]).includes(opts.channel as string)
      ? (opts.channel as NotificationChannel)
      : undefined;

  const id = notificationsStore.getState().add({
    id: opts.id,
    title: opts.title,
    body: opts.body,
    level: opts.level ?? 'info',
    channel,
    link: opts.link,
    sticky: opts.sticky,
    ttlMs: opts.ttlMs,
    icon: opts.icon,
  });
  // Visual toast via Sonner (already used in apps)
  if (typeof window !== 'undefined') {
    const method =
      opts.level === 'success'
        ? toast.success
        : opts.level === 'warning'
          ? ((toast as any).warning ?? toast)
          : opts.level === 'error'
            ? toast.error
            : toast; // info/default
    method(opts.title, { description: opts.body });
  }
  void maybeBrowserNotify({ id, title: opts.title, body: opts.body, link: opts.link, icon: opts.icon });
  return id;
}

export async function maybeBrowserNotify(opts: {
  id: string;
  title: string;
  body?: string;
  link?: string;
  icon?: string;
}) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (document.visibilityState === 'visible') return; // prefer in-app toast when focused
  if (!('Notification' in window)) return;

  const perm: NotificationPermission =
    (Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission) ??
    'default';

  if (perm !== 'granted') return;

  const n = new Notification(opts.title, {
    body: opts.body ?? '',
    tag: opts.id,
    icon: opts.icon ?? '/favicon.ico',
  });
  n.onclick = () => {
    window.focus();
    if (opts.link) location.href = opts.link;
    n.close();
  };
}
