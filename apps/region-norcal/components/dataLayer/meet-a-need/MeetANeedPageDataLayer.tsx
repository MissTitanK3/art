"use client";

import * as React from 'react';
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

export default function MeetANeedPageDataLayer() {
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
  const [category, setCategory] = React.useState<string>('all');

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
    } catch { /* no-op: ignore bad stored filters */ }

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
      const n = Number(params.size);
      if (!isNaN(n) && n > 0) setPageSize(n);
    }
    if (typeof params.page === 'string') {
      const n = Number(params.page);
      if (!isNaN(n) && n > 0) setPage(n);
    }
  }, [searchParams]);

  React.useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const payload = {
        q: query || undefined,
        category,
        urgency,
        visibility,
        status,
        from: dateRange.from?.toISOString() ?? undefined,
        to: dateRange.to?.toISOString() ?? undefined,
        pageSize,
        page,
      };
      window.localStorage.setItem('meetANeed.filters', JSON.stringify(payload));
    } catch { /* no-op */ }
  }, [query, category, urgency, visibility, status, dateRange.from, dateRange.to, pageSize, page]);

  const categories = React.useMemo(() => NEED_CATEGORIES, []);

  const buildQueryString = React.useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (category !== 'all') params.set('category', category);
    if (urgency !== 'all') params.set('urgency', urgency);
    if (visibility !== 'all') params.set('visibility', visibility);
    if (status !== 'all') params.set('status', status);
    if (dateRange.from) params.set('from', dateRange.from.toISOString());
    if (dateRange.to) params.set('to', dateRange.to.toISOString());
    params.set('size', String(pageSize));
    params.set('page', String(page));
    return params.toString();
  }, [debouncedQuery, category, urgency, visibility, status, dateRange, pageSize, page]);

  React.useEffect(() => {
    const qs = buildQueryString();
    if (qs === lastQueryRef.current) return;
    lastQueryRef.current = qs;
    router.replace(`?${qs}`, { scroll: false });
  }, [buildQueryString, router]);

  const filtered = React.useMemo(() => {
    const q = (debouncedQuery || '').toLowerCase();
    const match = (s?: string) => (s || '').toLowerCase().includes(q);
    const inRange = (d: string) => {
      const t = new Date(d).getTime();
      if (dateRange.from && t < dateRange.from.getTime()) return false;
      if (dateRange.to && t > dateRange.to.getTime()) return false;
      return true;
    };
    return needs.filter((n) => {
      if (category !== 'all' && n.category !== category) return false;
      if (urgency !== 'all' && n.urgency !== urgency) return false;
      if (visibility !== 'all' && !(visibility === 'all' || visibility.startsWith('role:') ? true : true)) return false;
      if (status !== 'all' && n.status !== status) return false;
      if (q) {
        if (!(match(n.description) || match(n.location?.label) || match(n.contact_preference) || match(n.category))) return false;
      }
      if ((dateRange.from || dateRange.to) && !inRange(n.created_at)) return false;
      return true;
    });
  }, [needs, debouncedQuery, category, urgency, visibility, status, dateRange]);

  const totalPages = Math.max(1, Math.ceil(Math.max(1, total || filtered.length) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const pageItems = filtered.slice(startIndex, endIndex);

  const onOfferHelp = React.useCallback(async (id: string) => {
    const client = getSupabaseBrowserClient();
    await client.from('meet_a_need').update({ status: 'matched' }).eq('id', id);
    update(id, { status: 'matched' });
  }, [update]);

  const onUpdateStatus = React.useCallback(async (id: string, status: 'open' | 'matched' | 'fulfilled' | 'closed') => {
    const client = getSupabaseBrowserClient();
    await client.from('meet_a_need').update({ status }).eq('id', id);
    update(id, { status });
  }, [update]);

  const onUpdateNeed = React.useCallback(async (id: string, patch: any) => {
    const client = getSupabaseBrowserClient();
    await client.from('meet_a_need').update(patch).eq('id', id);
    update(id, patch);
  }, [update]);

  const onDeleteNeed = React.useCallback(async (id: string) => {
    const client = getSupabaseBrowserClient();
    await client.from('meet_a_need').delete().eq('id', id);
    remove(id);
  }, [remove]);

  const handleGoTo = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  const renderPaginationNumbers = () => {
    const items: React.ReactNode[] = [];
    const maxToShow = 5;
    let start = Math.max(1, currentPage - Math.floor(maxToShow / 2));
    const end = Math.min(totalPages, start + maxToShow - 1);
    if (end - start + 1 < maxToShow) start = Math.max(1, end - maxToShow + 1);

    if (start > 1) {
      items.push(
        <PaginationItem key="start-1"><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handleGoTo(1); }}>1</PaginationLink></PaginationItem>
      );
      if (start > 2) items.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink href="#" isActive={i === currentPage} onClick={(e) => { e.preventDefault(); handleGoTo(i); }}>{i}</PaginationLink>
        </PaginationItem>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) items.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
      items.push(
        <PaginationItem key={totalPages}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handleGoTo(totalPages); }}>{totalPages}</PaginationLink></PaginationItem>
      );
    }
    return items;
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 items-center">
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
    // Create via server API so notifications can be sent preference-aware
    const resp = await fetch('/api/meet-a-need', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: data.category,
        description: data.description,
        urgency: data.urgency,
        visibility: data.visibility,
        locationLabel: data.locationLabel,
        contact: data.contact,
      }),
    });
    if (!resp.ok) return;
    const json = await resp.json();
    const res = { data: json?.need ?? null, error: null as any };
    if (!res.data) return;

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
