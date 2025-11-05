-- Ship catalog and per-profile selection
create table if not exists public.ship_catalog (
  id text primary key,
  name text not null,
  tier int not null default 1,
  description text,
  required_days int not null default 0,
  base_slots jsonb,
  image_url text
);

create table if not exists public.profile_ships (
  profile_id text primary key,
  ship_id text not null references public.ship_catalog(id),
  acquired_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profile_ships;
create trigger set_updated_at
before update on public.profile_ships
for each row execute function public.set_updated_at();

-- RLS: public read, service role writes
alter table if exists public.ship_catalog enable row level security;
alter table if exists public.profile_ships enable row level security;

drop policy if exists ship_catalog_select on public.ship_catalog;
create policy ship_catalog_select on public.ship_catalog for select using (true);

drop policy if exists ship_catalog_write on public.ship_catalog;
create policy ship_catalog_write on public.ship_catalog for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists profile_ships_select on public.profile_ships;
create policy profile_ships_select on public.profile_ships for select using (true);

drop policy if exists profile_ships_write on public.profile_ships;
create policy profile_ships_write on public.profile_ships for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Seed a minimal catalog (idempotent)
insert into public.ship_catalog (id, name, tier, description, required_days, base_slots)
values
  ('skiff_mk1', 'Skiff Mk I', 1, 'Bare-bones starter craft. Reliable, not fast.', 0, '{"hull":"light","engine":"basic","comms":"short","aux":null}'::jsonb),
  ('skiff_mk2', 'Skiff Mk II', 2, 'Reinforced hull and better drive.', 3, '{"hull":"reinforced","engine":"improved","comms":"short","aux":"battery"}'::jsonb),
  ('courier', 'Courier', 3, 'Fast courier rated for longer runs.', 10, '{"hull":"light","engine":"high-torque","comms":"medium","aux":"battery"}'::jsonb),
  ('frigate', 'Frigate', 4, 'Multi-crew capable ship for deep ops.', 30, '{"hull":"armored","engine":"dual","comms":"long","aux":"stabilizer"}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  description = excluded.description,
  required_days = excluded.required_days,
  base_slots = excluded.base_slots;
