-- Frontiers Migration: Ship Components schema
-- Date: 2025-11-03

-- Ensure pgcrypto exists for UUID generation (idempotent)
create extension if not exists pgcrypto;

-- 1) Ship components table
create table if not exists public.ship_components (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  slot text not null,
  kind text not null,
  level integer not null default 1,
  integrity numeric not null default 1,
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ship_components_slot_check check (
    slot in ('hull','engine','comms','aux','scanner','weapon')
  ),
  constraint ship_components_level_check check (level >= 1),
  constraint ship_components_integrity_check check (integrity >= 0 and integrity <= 1),
  constraint ship_components_unique_slot_per_profile unique (profile_id, slot)
);

create index if not exists ship_components_profile_idx on public.ship_components (profile_id);
create index if not exists ship_components_slot_idx on public.ship_components (slot);

-- 2) updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.ship_components;
create trigger set_updated_at
before update on public.ship_components
for each row execute function public.set_updated_at();

-- 3) RLS and policies
alter table if exists public.ship_components enable row level security;

-- Read: allow public select to display components in-app
drop policy if exists ship_components_select on public.ship_components;
create policy ship_components_select on public.ship_components
  for select
  using (true);

-- Writes: restricted to service role (server/RPC)
drop policy if exists ship_components_insert on public.ship_components;
create policy ship_components_insert on public.ship_components
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists ship_components_update on public.ship_components;
create policy ship_components_update on public.ship_components
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists ship_components_delete on public.ship_components;
create policy ship_components_delete on public.ship_components
  for delete
  using (auth.role() = 'service_role');
