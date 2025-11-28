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

-- Profiles (user-facing profiles keyed by auth.user id)
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

-- Connection graph (UUID-based) for multi-hop social resonance
create table if not exists public.connections (
  source_id uuid not null,
  target_id uuid not null,
  relation text,
  trust numeric,
  created_at timestamptz not null default now(),
  primary key (source_id, target_id)
);
create index if not exists connections_source_idx on public.connections (source_id);
create index if not exists connections_target_idx on public.connections (target_id);
create index if not exists connections_relation_idx on public.connections (relation);

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

-- Ship catalog (reference data)
create table if not exists public.ship_catalog (
  id text primary key,
  name text not null,
  tier integer not null default 1,
  description text,
  role text not null,
  mass_class text not null,
  required_days integer not null default 0,
  crew_requirements integer not null default 0,
  upkeep_cost numeric not null default 0,
  fuel_efficiency numeric not null default 0,
  power_capacity integer not null default 0,
  rarity text not null default 'common',
  faction_tags text[] not null default '{}'::text[],
  base_slots jsonb default '{}'::jsonb, -- slot -> component id (optional)
  optional_modifiers jsonb,
  morale_influence numeric not null default 0,
  sector_bonus jsonb not null default '{}'::jsonb,
  depreciation_rate numeric not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  constraint ship_catalog_role_check check (
    role in ('scout','hauler','combat','miner','patrol','carrier','flagship')
  ),
  constraint ship_catalog_mass_class_check check (
    mass_class in ('light','medium','heavy','superheavy')
  ),
  constraint ship_catalog_rarity_check check (
    rarity in ('common','uncommon','rare','elite','legendary')
  ),
  constraint ship_catalog_depreciation_check check (
    depreciation_rate >= 0 and depreciation_rate <= 1
  )
);
create index if not exists ship_catalog_tier_idx on public.ship_catalog (tier);

-- Profile -> active ship selection
create table if not exists public.profile_ships (
  profile_id text primary key,
  ship_id text not null references public.ship_catalog(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

-- Component catalog (reference data)
create table if not exists public.component_catalog (
  id text primary key,
  slot text not null,
  name text not null,
  description text,
  tier integer not null default 1,
  base jsonb,
  per_level jsonb,
  upgrade_cost_base numeric,
  upgrade_cost_growth numeric,
  replace_cost numeric,
  created_at timestamptz not null default now(),
  constraint component_catalog_slot_check check (
    slot in ('hull','engine','comms','aux','scanner','weapon')
  )
);
create index if not exists component_catalog_slot_idx on public.component_catalog (slot);
create index if not exists component_catalog_tier_idx on public.component_catalog (tier);

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

-- Positions catalog (reference data)
create table if not exists public.positions_catalog (
  id text primary key,
  name text not null,
  department text,
  base_bonuses jsonb default '{}'::jsonb
);

-- Ship staffing templates per ship
create table if not exists public.ship_position_templates (
  ship_id text not null references public.ship_catalog(id) on delete cascade,
  position_id text not null references public.positions_catalog(id) on delete cascade,
  slots integer not null default 1,
  required boolean not null default false,
  shifts integer not null default 1,
  primary key (ship_id, position_id)
);

-- Crew catalog and hiring
create table if not exists public.crew_catalog (
  id text primary key,
  name text not null,
  role text,
  tier integer not null default 1,
  allowed_positions text[] default '{}'::text[],
  bonuses jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists crew_catalog_role_idx on public.crew_catalog (role);
create index if not exists crew_catalog_tier_idx on public.crew_catalog (tier);

create table if not exists public.profile_crew (
  profile_id text not null,
  crew_id text not null references public.crew_catalog(id) on delete cascade,
  hired_at timestamptz not null default now(),
  status text not null default 'active',
  primary key (profile_id, crew_id)
);
create index if not exists profile_crew_status_idx on public.profile_crew (status);

-- Ship position assignments for a profile's ship
create table if not exists public.profile_ship_positions (
  profile_id text not null,
  ship_id text not null references public.ship_catalog(id) on delete cascade,
  position_id text not null references public.positions_catalog(id) on delete cascade,
  slot_index integer not null default 0,
  shift integer not null default 1,
  crew_id text references public.crew_catalog(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (profile_id, ship_id, position_id, slot_index, shift)
);
create index if not exists profile_ship_positions_profile_idx on public.profile_ship_positions (profile_id);
create index if not exists profile_ship_positions_ship_idx on public.profile_ship_positions (ship_id);

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
