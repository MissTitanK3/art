"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase/client";
import { notify } from "@workspace/ui/lib/notify";
import { useAuth } from "@/hooks/useAuth";
import { notificationsStore } from "@workspace/store/useNotificationsStore";

export function NotificationsRealtime() {
  const { session } = useAuth();

  useEffect(() => {
    // Use the same browser client as AuthProvider to ensure auth cookies/session are attached
    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      return; // env not configured yet
    }

    // Option A: broadcast channel for ephemeral system notices
    const broadcast = supabase.channel("broadcast:system");
    broadcast.on("broadcast", { event: "notify" }, (payload) => {
      const {
        title,
        body,
        level,
        channel: ch,
        link,
      } = (payload?.payload ?? {}) as any;
      if (!title) return;
      notify({ title, body, level, channel: ch, link, ttlMs: 1000 * 60 * 60 });
    });
    broadcast.subscribe();

    // Option B: durable notifications via Postgres changes
    const userId = session?.user?.id;
    let dbSub: ReturnType<typeof supabase.channel> | null = null;
    if (userId) {
      // Initial load of any existing notifications for this user
      (async () => {
        const { data } = await supabase
          .from("user_notifications")
          .select(
            "notification_id, title, body, level, channel, link, sticky, expires_at, read_at, dismissed_at"
          )
          .eq("user_id", userId)
          .order("notification_id", { ascending: false });
        const existing = notificationsStore.getState().items;
        for (const row of data ?? []) {
          const id = row.notification_id as any as string;
          if (existing.find((i) => i.id === id)) continue;
          // Skip dismissed items
          if ((row as any).dismissed_at) continue;
          const ttlMs = row.expires_at
            ? new Date(row.expires_at as any).getTime() - Date.now()
            : undefined;
          const newId = notify({
            id,
            title: (row as any).title ?? "Notification",
            body: (row as any).body ?? undefined,
            level: ((row as any).level as any) ?? "info",
            channel: ((row as any).channel as any) ?? "system",
            link: (row as any).link ?? undefined,
            sticky: Boolean((row as any).sticky),
            ttlMs: ttlMs && ttlMs > 0 ? ttlMs : undefined,
          });
          if ((row as any).read_at) {
            notificationsStore.getState().markRead(newId);
          }
        }
      })();

      dbSub = supabase
        .channel("db:notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notification_recipients",
            filter: `user_id=eq.${userId}`,
          },
          async (msg) => {
            const row = (msg as any).new as { notification_id: string };
            if (!row?.notification_id) return;
            const already = notificationsStore
              .getState()
              .items.find((i) => i.id === row.notification_id);
            if (already) return;
            const { data } = await supabase
              .from("notifications")
              .select(
                "id, title, body, level, channel, link, sticky, expires_at"
              )
              .eq("id", row.notification_id)
              .single();
            if (!data) return;
            const ttlMs = data.expires_at
              ? new Date(data.expires_at as any).getTime() - Date.now()
              : undefined;
            notify({
              id: data.id,
              title: data.title ?? "Notification",
              body: data.body ?? undefined,
              level: (data.level as any) ?? "info",
              channel: (data.channel as any) ?? "system",
              link: data.link ?? undefined,
              sticky: Boolean(data.sticky),
              ttlMs: ttlMs && ttlMs > 0 ? ttlMs : undefined,
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notification_recipients",
            filter: `user_id=eq.${userId}`,
          },
          (msg) => {
            const row = (msg as any).new as {
              notification_id: string;
              read_at?: string | null;
              dismissed_at?: string | null;
            };
            if (!row?.notification_id) return;
            if (row.dismissed_at) {
              notificationsStore.getState().remove(row.notification_id);
              return;
            }
            if (row.read_at) {
              notificationsStore.getState().markRead(row.notification_id);
            }
          }
        )
        .subscribe();
    }

    // Observe local store to sync read/dismiss back to server (best-effort)
    const unsubscribeStore = notificationsStore.subscribe((state, prev) => {
      try {
        const prevMap = new Map((prev?.items ?? []).map((i: any) => [i.id, i]));
        const currentIds = new Set(state.items.map((i) => i.id));

        // Detect removals (dismiss)
        for (const [id] of prevMap) {
          if (!currentIds.has(id)) {
            // Fire-and-forget; RLS will no-op if not applicable
            void supabase
              .rpc("dismiss_notification", { p_notification_id: id as any })
              .then(({ data, error }) => {
                if (error)
                  console.warn("dismiss_notification failed", error.message);
                else if (!data)
                  console.warn("dismiss_notification no-op for", id);
              });
          }
        }

        // Detect read transitions
        for (const item of state.items) {
          const was = prevMap.get(item.id);
          if (was && !was.readAt && item.readAt) {
            void supabase
              .rpc("mark_notification_read", {
                p_notification_id: item.id as any,
              })
              .then(({ data, error }) => {
                if (error)
                  console.warn("mark_notification_read failed", error.message);
                else if (!data)
                  console.warn("mark_notification_read no-op for", item.id);
              });
          }
        }
      } catch {}
    });

    return () => {
      supabase.removeChannel(broadcast);
      if (dbSub) supabase.removeChannel(dbSub);
      unsubscribeStore?.();
    };
  }, [session?.user?.id]);

  return null;
}
