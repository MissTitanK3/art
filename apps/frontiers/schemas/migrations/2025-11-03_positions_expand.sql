-- Expand positions: department heads and new departments (Security, Science)

-- Heads
insert into public.positions_catalog (id, department, name, is_unique, base_bonuses) values
  ('navigator_in_chief', 'Navigation', 'Navigator-in-Chief', true, '{"route_efficiency":0.05, "fatigue_reduction":0.02}'::jsonb),
  ('comms_lead', 'Ops', 'Comms Lead', true, '{"signal_clarity":0.05}'::jsonb),
  ('chief_medical_officer', 'Support', 'Chief Medical Officer', true, '{"morale_recovery":0.05}'::jsonb)
on conflict (id) do update set
  department = excluded.department,
  name = excluded.name,
  is_unique = excluded.is_unique,
  base_bonuses = excluded.base_bonuses;

-- New departments
insert into public.positions_catalog (id, department, name, is_unique, base_bonuses) values
  ('security_officer', 'Security', 'Security Officer', false, '{"integrity_upkeep":0.02}'::jsonb),
  ('marine', 'Security', 'Marine', false, '{}'::jsonb),
  ('scientist', 'Science', 'Scientist', false, '{"signal_yield":0.02}'::jsonb),
  ('researcher', 'Science', 'Researcher', false, '{"signal_clarity":0.02}'::jsonb)
on conflict (id) do update set
  department = excluded.department,
  name = excluded.name,
  is_unique = excluded.is_unique,
  base_bonuses = excluded.base_bonuses;

-- Update Frigate template to include heads and new departments
insert into public.ship_position_templates (ship_id, position_id, slots, required, shifts) values
  ('frigate', 'navigator_in_chief', 1, false, 1),
  ('frigate', 'comms_lead', 1, false, 1),
  ('frigate', 'chief_medical_officer', 1, false, 1),
  ('frigate', 'security_officer', 1, false, 1),
  ('frigate', 'marine', 2, false, 1),
  ('frigate', 'scientist', 1, false, 1),
  ('frigate', 'researcher', 1, false, 1)
on conflict (ship_id, position_id) do update set
  slots = excluded.slots,
  required = excluded.required,
  shifts = excluded.shifts;
