-- Frontiers initial schema for Supabase/Postgres
-- Extensions
create extension if not exists pgcrypto;

-- Factions
create table if not exists public.factions (
  id text primary key,
  name text not null,
  color text,
  description text
);

-- Profiles ↔ Factions (reputation)
create table if not exists public.profiles_factions (
  profile_id text not null,
  faction_id text not null references public.factions(id) on delete cascade,
  reputation numeric not null default 0,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, faction_id)
);

-- Signals discovered in the Verse
create table if not exists public.art_signals (
  id uuid primary key default gen_random_uuid(),
  source_id text,
  source_type text not null,
  region_id text not null,
  sector_code text,
  title text not null,
  summary text default ''::text,
  tags text[] default '{}'::text[],
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  is_discovered boolean default false
);

-- Unique source_id (Postgres UNIQUE allows multiple NULLs)
do $$ begin
  if exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'art_signals_source_id_uniq') then
    execute 'drop index if exists public.art_signals_source_id_uniq';
  end if;
end $$;
alter table public.art_signals
  add constraint art_signals_source_id_uniq unique (source_id);
create index if not exists art_signals_expires_idx on public.art_signals (expires_at);
create index if not exists art_signals_region_idx on public.art_signals (region_id);
create index if not exists art_signals_sector_idx on public.art_signals (sector_code);

-- Resonance propagation effects
create table if not exists public.resonance_effects (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  recipient_id text not null,
  hop int not null,
  strength real not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists resonance_recipient_idx on public.resonance_effects (recipient_id);
create index if not exists resonance_expires_idx on public.resonance_effects (expires_at);

-- Extend resonance pulses with donor metadata for funding linkage
alter table if exists public.resonance_effects
  add column if not exists source_email text,
  add column if not exists amount numeric default 0,
  add column if not exists donation_message_id text,
  add column if not exists region_id text;
create index if not exists resonance_donation_msg_idx on public.resonance_effects (donation_message_id);
create index if not exists resonance_region_idx on public.resonance_effects (region_id);

-- Graph of connections for resonance (crew, pods, etc.)
create table if not exists public.connections (
  source_id text not null,
  recipient_id text not null,
  created_at timestamptz not null default now(),
  primary key (source_id, recipient_id)
);
create index if not exists connections_recipient_idx on public.connections (recipient_id);

-- New connection graph table (UUID-based) for multi-hop social resonance
create table if not exists public.connections_v2 (
  source_id uuid not null,
  target_id uuid not null,
  relation text,
  trust numeric,
  created_at timestamptz not null default now(),
  primary key (source_id, target_id)
);
create index if not exists connections_v2_source_idx on public.connections_v2 (source_id);
create index if not exists connections_v2_target_idx on public.connections_v2 (target_id);
create index if not exists connections_v2_relation_idx on public.connections_v2 (relation);

-- Fleets table to represent affiliations
create table if not exists public.fleets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region_id text,
  leader_id uuid,
  members uuid[] default '{}'::uuid[],
  created_at timestamptz not null default now()
);
create index if not exists fleets_region_idx on public.fleets (region_id);

-- Simple in-app notifications queue
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_profile_idx on public.notifications (profile_id, read_at);

-- Ship state (server-authoritative)
create table if not exists public.ship_states (
  profile_id text primary key,
  ship_condition numeric not null default 1,
  morale numeric not null default 1,
  fatigue numeric not null default 0,
  last_update timestamptz not null default now()
);

-- Public donation ledger (Ko-fi and other sources)
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  profile_email text not null,
  amount numeric not null,
  message_id text unique,
  donor_alias text,
  message text,
  created_at timestamptz not null default now()
);
create index if not exists donations_created_idx on public.donations (created_at desc);

-- Reset/dock RPC: restores ship stats
create or replace function public.reset_state(profile_id text)
returns public.ship_states
language plpgsql
security definer
as $$
declare s public.ship_states;
begin
  update public.ship_states
  set ship_condition = least(ship_condition + 0.10, 1),
      morale        = least(morale + 0.10, 1),
      fatigue       = greatest(fatigue - 0.20, 0),
      last_update   = now()
  where public.ship_states.profile_id = reset_state.profile_id
  returning * into s;

  if not found then
    insert into public.ship_states (profile_id, ship_condition, morale, fatigue, last_update)
    values (reset_state.profile_id, 1, 1, 0, now())
    returning * into s;
  end if;

  return s;
end;
$$;

-- Ship components for loadout and status
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

-- updated_at helper and trigger
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

-- Seasonal campaigns (Seasons)
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

-- Campaign missions and progress
create table if not exists public.campaign_missions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  title text,
  description text,
  required_actions jsonb,
  reward jsonb
);
create index if not exists campaign_missions_campaign_idx on public.campaign_missions (campaign_id);

create table if not exists public.campaign_mission_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  campaign_id uuid not null,
  mission_id uuid not null references public.campaign_missions(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create unique index if not exists mission_progress_unique on public.campaign_mission_progress (profile_id, mission_id);
