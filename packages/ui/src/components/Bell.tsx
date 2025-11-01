"use client";

import { useEffect, useMemo } from 'react';
import { useNotificationsStore, notificationsStore } from '@workspace/store/useNotificationsStore';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { BellDot, BellDotIcon, BellIcon } from 'lucide-react';

export function Bell({
  popoverSide,
  popoverAlign,
}: {
  popoverSide?: 'top' | 'right' | 'bottom' | 'left';
  popoverAlign?: 'start' | 'center' | 'end';
}) {
  const items = useNotificationsStore((s) => s.items);
  const unread = useMemo(() => items.filter((i) => !i.readAt).length, [items]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button aria-label="Notifications" className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100">

          {unread > 0 ? (
            <BellDotIcon className="w-5 h-5 text-red-600" />
          ) : <BellIcon className="w-5 h-5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={popoverSide}
        align={popoverAlign}
        className="w-[min(24rem,calc(100vw-1rem))] max-h-[min(24rem,calc(100vh-5rem))] overflow-auto p-0 z-[98999]"
      >
        <Panel />
      </PopoverContent>
    </Popover>
  );
}

function Panel() {
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const remove = useNotificationsStore((s) => s.remove);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  useEffect(() => {
    // sweep expired on open
    notificationsStore.getState().sweep();
  }, []);

  if (!items.length) {
    return <div className="p-3 text-sm text-gray-500">No notifications</div>;
  }

  return (
    <div className="divide-y">
      <div className="flex justify-between items-center p-2">
        <strong>Notifications</strong>
        <button className="text-xs underline" onClick={markAllRead}>
          Mark all read
        </button>
      </div>
      {items.map((n) => (
        <div key={n.id} className="p-3 hover:bg-gray-900">
          <div className="flex justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium truncate">
                {n.link ? (
                  <a href={n.link} className="hover:underline" title={n.title}>
                    {n.title}
                  </a>
                ) : (
                  n.title
                )}
              </div>
              {n.body && <div className="text-sm text-gray-600 whitespace-pre-wrap">{n.body}</div>}
              <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                {n.channel ?? 'system'} • {n.level}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {!n.readAt && (
                <button className="text-xs underline" onClick={() => markRead(n.id)}>
                  Mark read
                </button>
              )}
              <button className="text-xs text-red-600 underline" onClick={() => remove(n.id)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
