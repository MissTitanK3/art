-- Crew catalog (NPC crew the captain can hire) and per-profile hires
create table if not exists public.crew_catalog (
  id text primary key,
  name text not null,
  role text,
  tier int not null default 1,
  description text,
  bonuses jsonb,
  feats jsonb,
  disadvantages jsonb,
  cost int default 0,
  image_url text
);

create table if not exists public.profile_crew (
  profile_id text not null,
  crew_id text not null references public.crew_catalog(id),
  hired_at timestamptz not null default now(),
  status text not null default 'active', -- active|inactive
  primary key (profile_id, crew_id)
);

alter table if exists public.crew_catalog enable row level security;
alter table if exists public.profile_crew enable row level security;

drop policy if exists crew_catalog_select on public.crew_catalog;
create policy crew_catalog_select on public.crew_catalog for select using (true);

drop policy if exists crew_catalog_write on public.crew_catalog;
create policy crew_catalog_write on public.crew_catalog for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists profile_crew_select on public.profile_crew;
create policy profile_crew_select on public.profile_crew for select using (true);

drop policy if exists profile_crew_write on public.profile_crew;
create policy profile_crew_write on public.profile_crew for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Seed some crew (idempotent)
insert into public.crew_catalog (id, name, role, tier, description, bonuses, feats, disadvantages, cost)
values
  ('mechanic', 'Mechanic', 'Engineering', 1, 'Keeps systems patched; boosts repair efficiency.', '{"repair_bonus":0.1}'::jsonb, '{"steady_hands":true}'::jsonb, '{"slow_in_space":true}'::jsonb, 100),
  ('navigator', 'Navigator', 'Navigation', 1, 'Better routes; reduces fatigue on travel.', '{"fatigue_reduction":0.05}'::jsonb, '{"stargazer":true}'::jsonb, '{"risk_taker":true}'::jsonb, 120),
  ('medic', 'Medic', 'Support', 1, 'Boosts crew morale recovery.', '{"morale_recovery":0.08}'::jsonb, '{"field_medic":true}'::jsonb, '{"low_stamina":true}'::jsonb, 90),
  ('operator', 'Operator', 'Ops', 1, 'Better signal handling; slight ping yield boost.', '{"signal_yield":0.05}'::jsonb, '{"multi_task":true}'::jsonb, '{"fragile_ego":true}'::jsonb, 110)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  tier = excluded.tier,
  description = excluded.description,
  bonuses = excluded.bonuses,
  feats = excluded.feats,
  disadvantages = excluded.disadvantages,
  cost = excluded.cost;
