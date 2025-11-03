"use client";

import * as React from 'react';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase/client';
import { toast } from 'sonner';
import NotificationPrefsForm from '@workspace/ui/components/settings/NotificationPrefsForm';

type PrefsRow = {
  user_id: string;
  global_opt_out: boolean;
  muted_channels: string[];
};

const ALL_CHANNELS = ['system', 'dispatch', 'academy'] as const;

export default function NotificationSettingsDataLayer() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [globalOptOut, setGlobalOptOut] = React.useState(false);
  const [muted, setMuted] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id ?? null;
        if (!uid) {
          if (mounted) setLoading(false);
          return;
        }
        if (mounted) setUserId(uid);
        const { data } = await supabase.from('notification_prefs').select('user_id, global_opt_out, muted_channels').maybeSingle();
        const row: PrefsRow | null = data ? (data as any as PrefsRow) : null;
        if (mounted) {
          setGlobalOptOut(Boolean(row?.global_opt_out));
          const mset: Record<string, boolean> = {};
          const mutedChannels = Array.isArray(row?.muted_channels) ? row!.muted_channels : [];
          (ALL_CHANNELS as readonly string[]).forEach((c) => (mset[c] = mutedChannels.includes(c)));
          setMuted(mset);
        }
      } catch (e) {
        console.warn('[settings] load prefs failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggledMuted = (channel: string) => setMuted((prev) => ({ ...prev, [channel]: !prev[channel] }));

  const savePrefs = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const muted_channels = Object.entries(muted)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const payload = {
        user_id: userId,
        global_opt_out: globalOptOut,
        muted_channels,
        updated_at: new Date().toISOString(),
      } as any;
      const { error } = await supabase.from('notification_prefs').upsert(payload);
      if (error) throw error;
      toast.success('Preferences saved');
    } catch (e: any) {
      toast.error('Failed to save', { description: e?.message ?? String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <NotificationPrefsForm
        loading={loading}
        saving={saving}
        channels={[...ALL_CHANNELS] as string[]}
        globalOptOut={globalOptOut}
        muted={muted}
        onToggleReceive={(receive) => setGlobalOptOut(!receive)}
        onToggleChannel={toggledMuted}
        onSave={savePrefs}
      />
    </section>
  );
}

