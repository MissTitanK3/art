"use client";

import * as React from 'react';
import { FormSectionCard } from '@workspace/ui/components/form-section-card';
import { Switch } from '@workspace/ui/components/switch';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase/client';
import { toast } from 'sonner';

type PrefsRow = {
  user_id: string;
  global_opt_out: boolean;
  muted_channels: string[];
};

const ALL_CHANNELS = ['system', 'dispatch', 'academy'] as const;

export default function SettingsPage() {
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
          ALL_CHANNELS.forEach((c) => (mset[c] = mutedChannels.includes(c)));
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

  const toggledMuted = (channel: string) => {
    setMuted((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

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

      <FormSectionCard
        title="Notifications"
        description="Choose which notifications you want to receive. You can mute specific channels or opt out entirely."
        onSave={savePrefs}
        sectionName="Preferences"
        saveButtonProps={{ disabled: saving || loading }}
        contentClassName="grid gap-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Receive Notifications</div>
            <div className="text-sm text-muted-foreground">Disable to opt out globally</div>
          </div>
          <Switch checked={!globalOptOut} onCheckedChange={(v) => setGlobalOptOut(!v)} disabled={loading} />
        </div>

        <div className="grid gap-3">
          <div className="text-sm font-medium">Mute Channels</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_CHANNELS.map((c) => (
              <label key={c} className="flex items-center gap-2">
                <Checkbox checked={Boolean(muted[c])} onCheckedChange={() => toggledMuted(c)} disabled={loading || globalOptOut} />
                <span className="capitalize">{c}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">Muted channels will be hidden and will not trigger alerts.</div>
        </div>

        <div className="grid gap-3">
          <Label>Tip</Label>
          <p className="text-sm text-muted-foreground">Critical alerts are sent on the System channel. To stop all notifications, toggle off “Receive Notifications”.</p>
        </div>
      </FormSectionCard>
    </section>
  );
}
