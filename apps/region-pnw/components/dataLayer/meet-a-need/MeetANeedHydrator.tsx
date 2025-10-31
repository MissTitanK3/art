"use client";

import * as React from 'react';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase/client';
import type { MeetANeed } from '@workspace/store/types/meet-a-need';
import { useMeetANeedStoreProvider } from '@/providers/MeetANeedStoreProvider';

function mapRow(row: any): MeetANeed {
  return {
    id: String(row?.id ?? crypto.randomUUID()),
    created_by: row?.created_by ?? null,
    category: String(row?.category ?? 'other'),
    description: String(row?.description ?? ''),
    urgency: (row?.urgency as any) ?? 'normal',
    visibility: (row?.visibility as any) ?? 'region',
    location: row?.location && typeof row.location === 'object' ? row.location : undefined,
    contact_preference: typeof row?.contact_preference === 'string' ? row.contact_preference : undefined,
    status: (row?.status as any) ?? 'open',
    responders: Array.isArray(row?.responders) ? row.responders : [],
    assigned_to: Array.isArray(row?.assigned_to) ? row.assigned_to : undefined,
    fulfilled_at: row?.fulfilled_at ?? null,
    created_at: String(row?.created_at ?? new Date().toISOString()),
  } satisfies MeetANeed;
}

export default function MeetANeedHydrator() {
  const setAll = useMeetANeedStoreProvider((s) => s.setAll);
  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const client = getSupabaseBrowserClient();
        const res = await client.from('meet_a_need').select('*').order('created_at', { ascending: false });
        if (!cancelled && !res.error && Array.isArray(res.data)) {
          const needs = res.data.map(mapRow);
          setAll(needs);
        }
      } catch (e) {
        console.warn('[MeetANeedHydrator] failed to hydrate', e);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [setAll]);
  return null;
}

