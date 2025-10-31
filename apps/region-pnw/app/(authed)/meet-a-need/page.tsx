"use client";

import * as React from 'react';
import Link from 'next/link';
import MeetANeedHydrator from '@/components/dataLayer/meet-a-need/MeetANeedHydrator';
import { useMeetANeedStoreProvider } from '@/providers/MeetANeedStoreProvider';
import type { NeedUrgency, NeedVisibility } from '@workspace/store/types/meet-a-need';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase/client';
import { Button } from '@workspace/ui/components/button';
import NeedsList from '@workspace/ui/components/client/meet-a-need/NeedsList';
import SubmitNeedDrawer from '@workspace/ui/components/client/meet-a-need/SubmitNeedDrawer';

export default function MeetANeedPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto" suppressHydrationWarning>
      <MeetANeedHydrator />
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Meet-A-Need</h1>
        <div className="flex items-center gap-2">
          <SubmitNeedDrawerWrapper />
        </div>
      </header>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <NeedsListWrapper />
        </div>
      </div>
    </div>
  );
}

function NeedsListWrapper() {
  const needs = useMeetANeedStoreProvider((s) => s.needs);
  const update = useMeetANeedStoreProvider((s) => s.updateNeed);
  const remove = useMeetANeedStoreProvider((s) => s.removeNeed);

  const onOfferHelp = React.useCallback(async (needId: string, payload: { resource_type: 'time' | 'transport' | 'supplies' | 'funding' | 'other'; notes?: string }) => {
    const client = getSupabaseBrowserClient();
    const user = (await client.auth.getUser()).data.user;
    const profRes = await client.from('profiles').select('id').eq('user_id', user?.id ?? '').single();
    const profile_id = profRes.data?.id;
    if (!profile_id) return;

    const element = { profile_id, resource_type: payload.resource_type, notes: payload.notes, created_at: new Date().toISOString() };
    // Allow multiple offers by the same profile: simply append/prepend without deduplication
    const current = await client.from('meet_a_need').select('responders').eq('id', needId).single();
    const responders = Array.isArray(current.data?.responders) ? current.data.responders : [];
    const next = [element, ...responders];
    const upd = await client.from('meet_a_need').update({ responders: next }).eq('id', needId).select('responders').single();
    if (!upd.error && upd.data) {
      update(needId, { responders: upd.data.responders ?? next });
    }
  }, [update]);

  const onUpdateStatus = React.useCallback(async (needId: string, status: 'open' | 'matched' | 'fulfilled' | 'closed') => {
    const client = getSupabaseBrowserClient();
    const upd = await client.from('meet_a_need').update({ status }).eq('id', needId).select('*').single();
    if (!upd.error && upd.data) {
      update(needId, { status: upd.data.status });
    }
  }, [update]);

  const onUpdateNeed = React.useCallback(async (
    needId: string,
    patch: Partial<{ category: string; description: string; urgency: NeedUrgency; visibility: NeedVisibility; contact_preference: string; location: any }> & { locationLabel?: string }
  ) => {
    const client = getSupabaseBrowserClient();
    // Preserve existing location media when changing label
    const current = needs.find((n) => n.id === needId);
    const next: any = {};
    if (patch.category !== undefined) next.category = patch.category;
    if (patch.description !== undefined) next.description = patch.description;
    if (patch.urgency !== undefined) next.urgency = patch.urgency;
    if (patch.visibility !== undefined) next.visibility = patch.visibility;
    if (patch.contact_preference !== undefined) next.contact_preference = patch.contact_preference;
    if (patch.locationLabel !== undefined) {
      const media = (current?.location as any)?.media;
      next.location = patch.locationLabel ? { label: patch.locationLabel, ...(media ? { media } : {}) } : (media ? { media } : null);
    }
    if (patch.location !== undefined && patch.locationLabel === undefined) {
      next.location = patch.location;
    }
    const upd = await client.from('meet_a_need').update(next).eq('id', needId).select('*').single();
    if (!upd.error && upd.data) {
      update(needId, {
        category: upd.data.category,
        description: upd.data.description,
        urgency: upd.data.urgency,
        visibility: upd.data.visibility,
        contact_preference: upd.data.contact_preference ?? undefined,
        location: upd.data.location ?? undefined,
      });
    }
  }, [needs, update]);

  const onDeleteNeed = React.useCallback(async (needId: string) => {
    const client = getSupabaseBrowserClient();
    const del = await client.from('meet_a_need').delete().eq('id', needId);
    if (!del.error) {
      remove(needId);
    }
  }, [remove]);

  return (
    <NeedsList
      needs={needs}
      onOfferHelp={onOfferHelp}
      onUpdateStatus={onUpdateStatus}
      onUpdateNeed={onUpdateNeed}
      onDeleteNeed={onDeleteNeed}
      canManageStatus
      canManageNeed
    />
  );
}

function SubmitNeedDrawerWrapper() {
  const [open, setOpen] = React.useState(false);
  const addNeed = useMeetANeedStoreProvider((s) => s.addNeed);

  const handleSubmit = React.useCallback(async (data: {
    category: string;
    description: string;
    urgency: NeedUrgency;
    visibility: NeedVisibility;
    locationLabel?: string;
    contact?: string;
    files: File[];
  }) => {
    const client = getSupabaseBrowserClient();
    const profileRes = await client.from('profiles').select('id').eq('user_id', (await client.auth.getUser()).data.user?.id ?? '').single();
    const created_by = profileRes.data?.id ?? null;

    const insert = {
      created_by,
      category: data.category,
      description: data.description,
      urgency: data.urgency,
      visibility: data.visibility,
      location: data.locationLabel ? { label: data.locationLabel } : null,
      contact_preference: data.contact || null,
    } as any;
    const res = await client.from('meet_a_need').insert(insert).select('*').single();
    if (res.error || !res.data) return;

    // Upload optional photos
    if (data.files?.length) {
      const bucket = client.storage.from('media');
      const needId = String(res.data.id);
      const uploads = await Promise.all(
        data.files.map(async (file) => {
          try {
            const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
            const filename = `${crypto.randomUUID()}.${ext}`;
            const path = `needs/${needId}/${filename}`;
            const { error: upErr } = await bucket.upload(path, file, { upsert: false, cacheControl: '3600' });
            if (upErr) return null;
            const { data } = bucket.getPublicUrl(path);
            return data.publicUrl ?? null;
          } catch {
            return null;
          }
        })
      );
      const mediaUrls = uploads.filter((u): u is string => typeof u === 'string');
      if (mediaUrls.length > 0) {
        const nextLocation = {
          ...(res.data.location ?? {}),
          ...(data.locationLabel ? { label: data.locationLabel } : {}),
          media: mediaUrls,
        } as any;
        const upd = await client.from('meet_a_need').update({ location: nextLocation }).eq('id', needId).select('*').single();
        if (!upd.error && upd.data) {
          res.data.location = upd.data.location;
        }
      }
    }

    addNeed({
      id: String(res.data.id),
      created_by: res.data.created_by ?? null,
      category: res.data.category,
      description: res.data.description,
      urgency: res.data.urgency,
      visibility: res.data.visibility,
      location: res.data.location ?? undefined,
      contact_preference: res.data.contact_preference ?? undefined,
      status: res.data.status,
      responders: Array.isArray(res.data.responders) ? res.data.responders : [],
      assigned_to: res.data.assigned_to ?? undefined,
      fulfilled_at: res.data.fulfilled_at ?? null,
      created_at: res.data.created_at,
    });
  }, [addNeed]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Submit a Need</Button>
      <SubmitNeedDrawer open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </>
  );
}
