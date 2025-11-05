-- Seasonal Campaigns table for Frontiers Verse
-- Time-boxed narrative events tied to real ART operations

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text,
  region_id text,
  start_at timestamptz,
  end_at timestamptz,
  summary text,
  reward_schema jsonb,
  art_link text,
  created_at timestamptz default now()
);

create index if not exists campaigns_region_idx on public.campaigns (region_id);
create index if not exists campaigns_start_idx on public.campaigns (start_at);
create index if not exists campaigns_end_idx on public.campaigns (end_at);

-- RLS: enable and allow public read; writes via service role or controlled API
alter table if exists public.campaigns enable row level security;

drop policy if exists campaigns_public_read on public.campaigns;
create policy campaigns_public_read on public.campaigns for select using (true);

drop policy if exists campaigns_service_insert on public.campaigns;
create policy campaigns_service_insert on public.campaigns for insert to service_role with check (true);

