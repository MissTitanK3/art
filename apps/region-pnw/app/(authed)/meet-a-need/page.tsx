"use client";

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MeetANeedHydrator, { useMeetANeedQueryMeta } from '@/components/dataLayer/meet-a-need/MeetANeedHydrator';
import { useMeetANeedStoreProvider } from '@/providers/MeetANeedStoreProvider';
import type { NeedUrgency, NeedVisibility } from '@workspace/store/types/meet-a-need';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase/client';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Calendar } from '@workspace/ui/components/calendar';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@workspace/ui/components/pagination';
import { AccessRoles, roleLabel } from '@workspace/store/types/roles.ts';
import NeedsList from '@workspace/ui/components/client/meet-a-need/NeedsList';
import { NEED_CATEGORIES, humanizeNeedCategory } from '@workspace/ui/lib/constants/meet-a-need';
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const { total } = useMeetANeedQueryMeta();

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  React.useEffect(() => {
    const h = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(h);
  }, [query]);
  const [urgency, setUrgency] = React.useState<string>('all');
  const [visibility, setVisibility] = React.useState<string>('all');
  const [status, setStatus] = React.useState<string>('all');
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({});
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(1);
  const lastQueryRef = React.useRef<string | null>(null);
  // Category filter state needs to be declared before it's referenced in buildQueryString
  const [category, setCategory] = React.useState<string>('all');

  // initialize from URL and localStorage
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('meetANeed.filters');
      if (raw) {
        const saved = JSON.parse(raw);
        if (typeof saved?.q === 'string') setQuery(saved.q);
        if (typeof saved?.category === 'string') setCategory(saved.category);
        if (typeof saved?.urgency === 'string') setUrgency(saved.urgency);
        if (typeof saved?.visibility === 'string') setVisibility(saved.visibility);
        if (typeof saved?.status === 'string') setStatus(saved.status);
        if (saved?.from) setDateRange((r) => ({ ...r, from: new Date(saved.from) }));
        if (saved?.to) setDateRange((r) => ({ ...r, to: new Date(saved.to) }));
        if (typeof saved?.pageSize === 'number') setPageSize(saved.pageSize);
        if (typeof saved?.page === 'number') setPage(saved.page);
      }
    } catch {
      /* ignore: best-effort restore from localStorage */
    }

    const params = Object.fromEntries((searchParams ?? new URLSearchParams()).entries());
    if (typeof params.q === 'string') setQuery(params.q);
    if (typeof params.category === 'string') setCategory(params.category);
    if (typeof params.urgency === 'string') setUrgency(params.urgency);
    if (typeof params.visibility === 'string') setVisibility(params.visibility);
    if (typeof params.status === 'string') setStatus(params.status);
    if (typeof params.from === 'string') {
      const d = new Date(params.from);
      if (!isNaN(d as any)) setDateRange((r) => ({ ...r, from: d }));
    }
    if (typeof params.to === 'string') {
      const d = new Date(params.to);
      if (!isNaN(d as any)) setDateRange((r) => ({ ...r, to: d }));
    }
    if (typeof params.size === 'string') {
      const n = Number(params.size); if (!Number.isNaN(n) && n > 0) setPageSize(n);
    }
    if (typeof params.page === 'string') {
      const n = Number(params.page); if (!Number.isNaN(n) && n > 0) setPage(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildQueryString = React.useCallback(() => {
    const p = new URLSearchParams();
    const q = debouncedQuery.trim(); if (q) p.set('q', q);
    if (category !== 'all') p.set('category', category);
    if (urgency !== 'all') p.set('urgency', urgency);
    if (visibility !== 'all') p.set('visibility', visibility);
    if (status !== 'all') p.set('status', status);
    if (dateRange.from) p.set('from', dateRange.from.toISOString().slice(0, 10));
    if (dateRange.to) p.set('to', dateRange.to.toISOString().slice(0, 10));
    p.set('size', String(pageSize));
    p.set('page', String(page));
    return p.toString();
  }, [debouncedQuery, category, urgency, visibility, status, dateRange, pageSize, page]);

  const currentCanonicalQueryString = React.useCallback(() => {
    const src = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    ['_rsc', '__nextDataReq', 'next-router-state-tree', 'next-url'].forEach((k) => src.delete(k));
    const order = ['q', 'category', 'urgency', 'visibility', 'status', 'from', 'to', 'size', 'page'] as const;
    const p = new URLSearchParams();
    for (const key of order) { const v = src.get(key); if (v && v.length > 0) p.set(key, v); }
    return p.toString();
  }, []);

  // sync URL and persist
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const qs = buildQueryString();
    const current = currentCanonicalQueryString();
    if (qs !== lastQueryRef.current) {
      lastQueryRef.current = qs;
      if (qs !== current) router.replace(`${window.location.pathname}?${qs}`);
    }
    try {
      window.localStorage.setItem(
        'meetANeed.filters',
        JSON.stringify({
          q: query,
          category,
          urgency,
          visibility,
          status,
          from: dateRange.from ? dateRange.from.toISOString() : undefined,
          to: dateRange.to ? dateRange.to.toISOString() : undefined,
          pageSize,
          page,
        })
      );
    } catch {
      /* ignore: best-effort persist to localStorage */
    }
  }, [buildQueryString, currentCanonicalQueryString, router, query, category, urgency, visibility, status, dateRange, pageSize, page]);

  const categories = React.useMemo(() => NEED_CATEGORIES, []);


  React.useEffect(() => { setPage(1); }, [debouncedQuery, urgency, visibility, status, category, dateRange, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = needs; // server-paginated via Hydrator


  const handleGoTo = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));
  const renderPaginationNumbers = () => {
    const items: React.ReactNode[] = [];
    const windowSize = 1;
    const add = (p: number) => items.push(
      <PaginationItem key={p}><PaginationLink isActive={p === currentPage} href="#" onClick={(e) => { e.preventDefault(); handleGoTo(p); }}>{p}</PaginationLink></PaginationItem>
    );
    if (totalPages <= 7) { for (let p = 1; p <= totalPages; p++) add(p); return items; }
    add(1);
    if (currentPage - windowSize > 2) items.push(<PaginationItem key="s"><PaginationEllipsis /></PaginationItem>);
    const s = Math.max(2, currentPage - windowSize), e = Math.min(totalPages - 1, currentPage + windowSize);
    for (let p = s; p <= e; p++) add(p);
    if (currentPage + windowSize < totalPages - 1) items.push(<PaginationItem key="e"><PaginationEllipsis /></PaginationItem>);
    add(totalPages);
    return items;
  };

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
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex w-full flex-wrap items-stretch gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search needs (category, description, location, contact)"
            className="w-full sm:max-w-md"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (<SelectItem key={c} value={c}>{humanizeNeedCategory(c)}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Urgency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgencies</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Min Role" /></SelectTrigger>
            <SelectContent className="max-h-64 overflow-auto">
              <SelectItem value="all">All Roles</SelectItem>
              {AccessRoles.map((r) => (
                <SelectItem key={r} value={`role:${r}`}>{roleLabel(r)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[220px] justify-start text-left font-normal">
                {dateRange.from || dateRange.to ? `${dateRange.from ? dateRange.from.toLocaleDateString() : '…'} – ${dateRange.to ? dateRange.to.toLocaleDateString() : '…'}` : 'Date range'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[80] max-w-[calc(100vw-2rem)]" align="start">
              <div className="p-3">
                <div className="flex items-center gap-2 pb-3">
                  <Button size="sm" variant="ghost" onClick={() => { const now = new Date(); const from = new Date(now.getTime() - 24 * 60 * 60 * 1000); setDateRange({ from, to: now }); }}>Last 24h</Button>
                  <Button size="sm" variant="ghost" onClick={() => { const now = new Date(); const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); setDateRange({ from, to: now }); }}>Last 7 days</Button>
                  <Button size="sm" variant="ghost" onClick={() => { const now = new Date(); const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); setDateRange({ from, to: now }); }}>Last 30 days</Button>
                </div>
                <Calendar mode="range" selected={{ from: dateRange.from, to: dateRange.to } as any} onSelect={(r: any) => setDateRange({ from: r?.from, to: r?.to })} numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2} />
                <div className="flex justify-end gap-2 p-2 pt-3">
                  <Button variant="ghost" size="sm" onClick={() => setDateRange({})}>Clear</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {(query || category !== 'all' || urgency !== 'all' || visibility !== 'all' || status !== 'all' || dateRange.from || dateRange.to) && (
            <Button variant="ghost" onClick={() => { setQuery(''); setCategory('all'); setUrgency('all'); setVisibility('all'); setStatus('all'); setDateRange({}); }}>Clear</Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline">{total > 0 ? `Showing ${startIndex + 1}–${endIndex} of ${total}` : 'No results'}</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v) || pageSize)}>
            <SelectTrigger className="w-full sm:w-[120px]"><SelectValue placeholder="Page size" /></SelectTrigger>
            <SelectContent>
              {[10, 20, 30].map((n) => (<SelectItem key={n} value={String(n)}>{n} / page</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <NeedsList
        needs={pageItems}
        onOfferHelp={onOfferHelp}
        onUpdateStatus={onUpdateStatus}
        onUpdateNeed={onUpdateNeed}
        onDeleteNeed={onDeleteNeed}
        canManageStatus
        canManageNeed
      />

      {totalPages > 1 ? (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handleGoTo(currentPage - 1); }} />
            </PaginationItem>
            {renderPaginationNumbers()}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handleGoTo(currentPage + 1); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </>
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
