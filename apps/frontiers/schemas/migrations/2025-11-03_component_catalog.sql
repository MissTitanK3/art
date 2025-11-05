-- Frontiers Migration: Component Catalog (effects + costs)
-- Date: 2025-11-03

create extension if not exists pgcrypto;

-- Ensure generic updated_at trigger function exists (idempotent)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) Component catalog table
create table if not exists public.component_catalog (
  id text primary key,
  slot text not null,
  name text not null,
  description text,
  tier int not null default 1,
  base jsonb,
  per_level jsonb,
  upgrade_cost_base int not null default 0,
  upgrade_cost_growth int not null default 0,
  replace_cost int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint component_catalog_slot_check check (
    slot in ('hull','engine','comms','aux','scanner','weapon')
  )
);

create index if not exists component_catalog_slot_idx on public.component_catalog (slot);
create index if not exists component_catalog_tier_idx on public.component_catalog (tier);

drop trigger if exists set_updated_at on public.component_catalog;
create trigger set_updated_at
before update on public.component_catalog
for each row execute function public.set_updated_at();

-- 2) RLS and policies
alter table if exists public.component_catalog enable row level security;

-- Read: allow public select
drop policy if exists component_catalog_select on public.component_catalog;
create policy component_catalog_select on public.component_catalog
  for select
  using (true);

-- Writes: service role only
drop policy if exists component_catalog_insert on public.component_catalog;
create policy component_catalog_insert on public.component_catalog
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists component_catalog_update on public.component_catalog;
create policy component_catalog_update on public.component_catalog
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists component_catalog_delete on public.component_catalog;
create policy component_catalog_delete on public.component_catalog
  for delete
  using (auth.role() = 'service_role');

-- 3) Seed data (upsert)
insert into public.component_catalog (id, slot, name, description, tier, base, per_level, upgrade_cost_base, upgrade_cost_growth, replace_cost)
values
  -- Hull
  ('plating_mk1','hull','Hull Plating Mk I','Standard alloy plating.',1,'{"integrity_upkeep":0.01}','{"integrity_upkeep":0.005}',40,10,60),
  ('plating_mk2','hull','Hull Plating Mk II','Improved reinforcement and impact resistance.',2,'{"integrity_upkeep":0.02,"repair_bonus":0.005}','{"integrity_upkeep":0.0075}',60,15,80),
  ('adaptive_armor','hull','Adaptive Armor','Smart materials that adapt to incoming damage.',3,'{"integrity_upkeep":0.03,"repair_bonus":0.01}','{"integrity_upkeep":0.01}',80,20,120),

  -- Engine
  ('ion_drive','engine','Ion Drive','Reliable sublight propulsion.',1,'{"route_efficiency":0.01}','{"route_efficiency":0.005}',40,10,60),
  ('fusion_burn','engine','Fusion Burn','High-thrust fusion-stage engines.',2,'{"route_efficiency":0.02,"fatigue_reduction":0.005}','{"route_efficiency":0.0075}',60,15,90),
  ('warp_coils','engine','Warp Coils','Faster-than-light capable coils.',3,'{"route_efficiency":0.03,"fatigue_reduction":0.01}','{"route_efficiency":0.01}',90,20,140),

  -- Comms
  ('broadband_array','comms','Broadband Array','Wide-spectrum communications array.',1,'{"signal_yield":0.01}','{"signal_yield":0.005}',35,10,50),
  ('encrypted_relay','comms','Encrypted Relay','Secure relay with improved clarity.',2,'{"signal_yield":0.015,"signal_clarity":0.01}','{"signal_yield":0.006}',55,12,75),
  ('quantum_link','comms','Quantum Link','Near-instant quantum entanglement link.',3,'{"signal_yield":0.02,"signal_clarity":0.02}','{"signal_yield":0.008}',80,20,120),

  -- Aux
  ('power_coupler','aux','Power Coupler','Stabilized power routing.',1,'{"repair_bonus":0.005}','{"repair_bonus":0.003}',30,8,45),
  ('battery_bank','aux','Battery Bank','Extra reserve power storage.',2,'{"repair_bonus":0.0075,"route_efficiency":0.005}','{"repair_bonus":0.0035}',45,10,65),
  ('field_amplifier','aux','Field Amplifier','Enhances subsystem effectiveness.',3,'{"repair_bonus":0.01,"signal_clarity":0.01}','{"repair_bonus":0.004}',65,15,95),

  -- Scanner
  ('pulse_scanner','scanner','Pulse Scanner','Short-range active scanning.',1,'{"signal_clarity":0.01}','{"signal_clarity":0.005}',35,8,50),
  ('spectral_scanner','scanner','Spectral Scanner','Spectral analysis for richer signals.',2,'{"signal_clarity":0.015,"signal_yield":0.005}','{"signal_clarity":0.006}',55,12,80),
  ('deep_scan','scanner','Deep Scan Array','High-precision long-range scans.',3,'{"signal_clarity":0.02,"signal_yield":0.01}','{"signal_clarity":0.008}',75,18,120),

  -- Weapon (placeholders for now)
  ('railgun','weapon','Railgun','Kinetic mass driver.',1,'{}','{}',40,10,70),
  ('beam_lance','weapon','Beam Lance','High-energy beam projector.',2,'{}','{}',60,15,90),
  ('missile_bay','weapon','Missile Bay','Guided munitions platform.',2,'{}','{}',60,15,90)
on conflict (id) do update set
  slot = excluded.slot,
  name = excluded.name,
  description = excluded.description,
  tier = excluded.tier,
  base = excluded.base,
  per_level = excluded.per_level,
  upgrade_cost_base = excluded.upgrade_cost_base,
  upgrade_cost_growth = excluded.upgrade_cost_growth,
  replace_cost = excluded.replace_cost,
  updated_at = now();
