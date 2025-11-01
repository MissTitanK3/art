-- Bug Reports table and RLS policies
-- Date: 2025-10-31

create extension if not exists pgcrypto;

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by text, -- auth uid
  title text not null,
  area text not null default 'general',
  steps text,
  expected text,
  actual text,
  status text not null default 'open', -- open, triage, in_progress, resolved, closed
  priority text, -- low, medium, high, critical
  metadata jsonb
);

create index if not exists idx_bug_reports_created_at on public.bug_reports (created_at desc);
create index if not exists idx_bug_reports_created_by on public.bug_reports (created_by);
create index if not exists idx_bug_reports_status on public.bug_reports (status);

alter table public.bug_reports enable row level security;

-- Allow any authenticated user to submit a bug report
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bug_reports' and policyname = 'insert_bug_report_authenticated'
  ) then
    create policy insert_bug_report_authenticated on public.bug_reports
      for insert
      to authenticated
      with check (true);
  end if;
end $$;

-- Creators can read their own bug reports
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bug_reports' and policyname = 'read_own_bug_reports'
  ) then
    create policy read_own_bug_reports on public.bug_reports
      for select using (created_by = auth.uid()::text);
  end if;
end $$;

-- Admin roles can read/update/delete all bug reports
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'bug_reports' and policyname = 'admins_manage_bug_reports'
  ) then
    create policy admins_manage_bug_reports on public.bug_reports
      for all using (
        exists (
          select 1 from public.profiles p
          where p.user_id = (auth.uid())::text
            and p.access_role = any (array['dispatcher_admin','admin','regional_admin','national_admin'])
        )
      ) with check (
        exists (
          select 1 from public.profiles p
          where p.user_id = (auth.uid())::text
            and p.access_role = any (array['dispatcher_admin','admin','regional_admin','national_admin'])
        )
      );
  end if;
end $$;

