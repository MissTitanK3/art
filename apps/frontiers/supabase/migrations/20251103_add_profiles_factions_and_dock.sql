-- Create table to track profile reputations with factions
create table if not exists public.profiles_factions (
  profile_id text not null,
  faction_id text not null,
  reputation numeric not null default 0,
  inserted_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profiles_factions_pkey primary key (profile_id, faction_id),
  constraint profiles_factions_faction_id_fkey foreign key (faction_id) references factions (id) on delete cascade
) tablespace pg_default;

-- Touch function set_updated_at must exist; if not, create a simple one
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

-- Minimal profiles table (idempotent)
create table if not exists public.profiles (
  id text primary key,
  display_name text,
  region_id text,
  sector_code text,
  dock_lat double precision,
  dock_lng double precision,
  dock_radius_km double precision,
  inserted_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
) tablespace pg_default;

-- Keep profiles.updated_at fresh
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.set_updated_at ();

-- Add FK from profiles_factions.profile_id -> profiles(id) if not present
do $do$
begin
  if not exists (
    select 1
    from information_schema.table_constraints c
    where c.constraint_schema = 'public'
      and c.table_name = 'profiles_factions'
      and c.constraint_name = 'profiles_factions_profile_id_fkey'
  ) then
    -- Backfill minimal profiles for any existing rows to satisfy FK
    insert into public.profiles (id, display_name)
    select distinct pf.profile_id, pf.profile_id
    from public.profiles_factions pf
    where not exists (
      select 1 from public.profiles p where p.id = pf.profile_id
    );

    alter table public.profiles_factions
      add constraint profiles_factions_profile_id_fkey
      foreign key (profile_id) references public.profiles (id) on delete cascade not valid;
  end if;
end
$do$;

-- Attempt to validate the FK now that any missing profiles are backfilled
do $do$
begin
  if exists (
    select 1
    from information_schema.table_constraints c
    where c.constraint_schema = 'public'
      and c.table_name = 'profiles_factions'
      and c.constraint_name = 'profiles_factions_profile_id_fkey'
  ) then
    begin
      alter table public.profiles_factions validate constraint profiles_factions_profile_id_fkey;
    exception when others then
      -- leave as NOT VALID if validation fails; can be fixed/validated later
      null;
    end;
  end if;
end
$do$;

drop trigger if exists trg_profiles_factions_updated on public.profiles_factions;
create trigger trg_profiles_factions_updated
before update on public.profiles_factions
for each row execute function public.set_updated_at ();

-- Add optional dock fields to profiles for storing a home dock location (only if profiles exists)
alter table if exists public.profiles
  add column if not exists dock_lat double precision,
  add column if not exists dock_lng double precision,
  add column if not exists dock_radius_km double precision;
