-- Positions/Staffing system

-- Catalog of positions (department/role -> specific station name)
create table if not exists public.positions_catalog (
  id text primary key,
  department text not null, -- Engineering, Navigation, Ops, Support, Security, Science, etc.
  name text not null,       -- e.g., Chief Engineer, Mechanic, Pilot
  is_unique boolean not null default false,
  base_bonuses jsonb
);

-- Templates: which positions and how many slots/shifts per ship type
create table if not exists public.ship_position_templates (
  ship_id text not null references public.ship_catalog(id) on delete cascade,
  position_id text not null references public.positions_catalog(id) on delete cascade,
  slots int not null default 1,            -- number of seats for this position
  required boolean not null default false, -- whether at least 1 must be staffed
  shifts int not null default 1,           -- number of shifts (1 = always-on)
  primary key (ship_id, position_id)
);

-- Per-profile staffed seats for their current ship
create table if not exists public.profile_ship_positions (
  profile_id text not null,
  ship_id text not null references public.ship_catalog(id) on delete cascade,
  position_id text not null references public.positions_catalog(id) on delete cascade,
  slot_index int not null default 0,
  shift int not null default 1,
  crew_id text references public.crew_catalog(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (profile_id, ship_id, position_id, slot_index, shift)
);

-- RLS: public read (for now), service role write
alter table if exists public.positions_catalog enable row level security;
alter table if exists public.ship_position_templates enable row level security;
alter table if exists public.profile_ship_positions enable row level security;

-- Positions
drop policy if exists positions_catalog_select on public.positions_catalog;
create policy positions_catalog_select on public.positions_catalog for select using (true);

drop policy if exists positions_catalog_write on public.positions_catalog;
create policy positions_catalog_write on public.positions_catalog for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Templates
drop policy if exists ship_position_templates_select on public.ship_position_templates;
create policy ship_position_templates_select on public.ship_position_templates for select using (true);

drop policy if exists ship_position_templates_write on public.ship_position_templates;
create policy ship_position_templates_write on public.ship_position_templates for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Assignments
drop policy if exists profile_ship_positions_select on public.profile_ship_positions;
create policy profile_ship_positions_select on public.profile_ship_positions for select using (true);

drop policy if exists profile_ship_positions_write on public.profile_ship_positions;
create policy profile_ship_positions_write on public.profile_ship_positions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Seed base positions (idempotent)
insert into public.positions_catalog (id, department, name, is_unique, base_bonuses) values
  ('chief_engineer', 'Engineering', 'Chief Engineer', true, '{"integrity_upkeep":0.05}'::jsonb),
  ('mechanic', 'Engineering', 'Mechanic', false, '{"repair_bonus":0.10}'::jsonb),
  ('pilot', 'Navigation', 'Pilot', true, '{"route_speed":0.05}'::jsonb),
  ('navigator', 'Navigation', 'Navigator', false, '{"fatigue_reduction":0.05}'::jsonb),
  ('comms', 'Ops', 'Comms Officer', false, '{"signal_clarity":0.05}'::jsonb),
  ('sensor_tech', 'Ops', 'Sensor Technician', false, '{"signal_yield":0.05}'::jsonb),
  ('medic', 'Support', 'Medic', false, '{"morale_recovery":0.08}'::jsonb)
on conflict (id) do update set
  department = excluded.department,
  name = excluded.name,
  is_unique = excluded.is_unique,
  base_bonuses = excluded.base_bonuses;

-- Seed templates per ship (idempotent)
-- Skiff Mk I: core minimal crew
insert into public.ship_position_templates (ship_id, position_id, slots, required, shifts) values
  ('skiff_mk1', 'pilot', 1, true, 1),
  ('skiff_mk1', 'mechanic', 1, false, 1),
  ('skiff_mk1', 'comms', 1, false, 1),
  ('skiff_mk1', 'medic', 1, false, 1)
on conflict (ship_id, position_id) do update set
  slots = excluded.slots,
  required = excluded.required,
  shifts = excluded.shifts;

-- Skiff Mk II: adds navigator
insert into public.ship_position_templates (ship_id, position_id, slots, required, shifts) values
  ('skiff_mk2', 'pilot', 1, true, 1),
  ('skiff_mk2', 'navigator', 1, false, 1),
  ('skiff_mk2', 'mechanic', 1, false, 1),
  ('skiff_mk2', 'comms', 1, false, 1),
  ('skiff_mk2', 'medic', 1, false, 1)
on conflict (ship_id, position_id) do update set
  slots = excluded.slots,
  required = excluded.required,
  shifts = excluded.shifts;

-- Courier: better ops & nav
insert into public.ship_position_templates (ship_id, position_id, slots, required, shifts) values
  ('courier', 'pilot', 1, true, 1),
  ('courier', 'navigator', 1, true, 1),
  ('courier', 'sensor_tech', 1, false, 1),
  ('courier', 'mechanic', 1, false, 1),
  ('courier', 'comms', 1, false, 1),
  ('courier', 'medic', 1, false, 1)
on conflict (ship_id, position_id) do update set
  slots = excluded.slots,
  required = excluded.required,
  shifts = excluded.shifts;

-- Frigate: multi-crew with department head
insert into public.ship_position_templates (ship_id, position_id, slots, required, shifts) values
  ('frigate', 'pilot', 1, true, 1),
  ('frigate', 'navigator', 1, true, 1),
  ('frigate', 'chief_engineer', 1, true, 1),
  ('frigate', 'mechanic', 2, false, 1),
  ('frigate', 'sensor_tech', 1, false, 1),
  ('frigate', 'comms', 1, false, 1),
  ('frigate', 'medic', 1, false, 1)
on conflict (ship_id, position_id) do update set
  slots = excluded.slots,
  required = excluded.required,
  shifts = excluded.shifts;
