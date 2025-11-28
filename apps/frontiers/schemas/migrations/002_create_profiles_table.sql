-- Create profiles table to fix PostgREST 404s on /profiles

begin;

create table if not exists public.profiles (
  id text primary key,
  display_name text,
  region_id text,
  sector_code text,
  dock_lat numeric,
  dock_lng numeric,
  dock_radius_km numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_region_idx on public.profiles (region_id);
create index if not exists profiles_sector_idx on public.profiles (sector_code);

-- Enable RLS (policies defined in init_frontiers_rls.sql)
alter table if exists public.profiles enable row level security;

-- Basic policies to keep PostgREST happy even if the global RLS seed hasn't run
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  using (true);

drop policy if exists profiles_owner_write on public.profiles;
create policy profiles_owner_write on public.profiles
  for all
  using (auth.uid()::text = id or auth.role() = 'service_role')
  with check (auth.uid()::text = id or auth.role() = 'service_role');

commit;
