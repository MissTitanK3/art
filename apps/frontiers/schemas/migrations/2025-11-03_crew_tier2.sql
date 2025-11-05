-- Add Tier 2 crew variants for each existing role
-- Safe-idempotent: uses INSERT ... ON CONFLICT to upsert by id

-- Mechanic T2 (Engineering)
insert into public.crew_catalog (id, name, role, tier, description, bonuses, feats, disadvantages, cost, image_url)
values (
  'mechanic_t2', 'Senior Mechanic', 'Engineering', 2,
  'Veteran engineer; major repair boosts and better ship integrity upkeep.',
  '{"repair_bonus":0.20, "integrity_upkeep":0.05}'::jsonb,
  '{"steady_hands":true, "systems_whisperer":true}'::jsonb,
  '{"slow_in_space":true}'::jsonb,
  220,
  null
)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  tier = excluded.tier,
  description = excluded.description,
  bonuses = excluded.bonuses,
  feats = excluded.feats,
  disadvantages = excluded.disadvantages,
  cost = excluded.cost,
  image_url = excluded.image_url;

-- Navigator T2 (Navigation)
insert into public.crew_catalog (id, name, role, tier, description, bonuses, feats, disadvantages, cost, image_url)
values (
  'navigator_t2', 'Chief Navigator', 'Navigation', 2,
  'Seasoned stargazer; improved route planning and fatigue reduction.',
  '{"fatigue_reduction":0.10, "route_efficiency":0.05}'::jsonb,
  '{"stargazer":true, "gravity_reader":true}'::jsonb,
  '{"risk_taker":true}'::jsonb,
  240,
  null
)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  tier = excluded.tier,
  description = excluded.description,
  bonuses = excluded.bonuses,
  feats = excluded.feats,
  disadvantages = excluded.disadvantages,
  cost = excluded.cost,
  image_url = excluded.image_url;

-- Medic T2 (Support)
insert into public.crew_catalog (id, name, role, tier, description, bonuses, feats, disadvantages, cost, image_url)
values (
  'medic_t2', 'Senior Medic', 'Support', 2,
  'Experienced field medic; faster morale recovery and injury mitigation.',
  '{"morale_recovery":0.15, "injury_mitigation":0.05}'::jsonb,
  '{"field_medic":true, "calming_presence":true}'::jsonb,
  '{"low_stamina":true}'::jsonb,
  210,
  null
)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  tier = excluded.tier,
  description = excluded.description,
  bonuses = excluded.bonuses,
  feats = excluded.feats,
  disadvantages = excluded.disadvantages,
  cost = excluded.cost,
  image_url = excluded.image_url;

-- Operator T2 (Ops)
insert into public.crew_catalog (id, name, role, tier, description, bonuses, feats, disadvantages, cost, image_url)
values (
  'operator_t2', 'Senior Operator', 'Ops', 2,
  'Multi-console specialist; stronger signal handling and ping yield.',
  '{"signal_yield":0.10, "signal_clarity":0.05}'::jsonb,
  '{"multi_task":true, "comms_savant":true}'::jsonb,
  '{"fragile_ego":true}'::jsonb,
  230,
  null
)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  tier = excluded.tier,
  description = excluded.description,
  bonuses = excluded.bonuses,
  feats = excluded.feats,
  disadvantages = excluded.disadvantages,
  cost = excluded.cost,
  image_url = excluded.image_url;
