-- Additional heads for Security and Science
insert into public.positions_catalog (id, department, name, is_unique, base_bonuses) values
  ('security_chief', 'Security', 'Security Chief', true, '{"integrity_upkeep":0.03}'::jsonb),
  ('chief_science_officer', 'Science', 'Chief Science Officer', true, '{"signal_yield":0.03, "signal_clarity":0.02}'::jsonb)
on conflict (id) do update set
  department = excluded.department,
  name = excluded.name,
  is_unique = excluded.is_unique,
  base_bonuses = excluded.base_bonuses;

-- Update Frigate with heads
insert into public.ship_position_templates (ship_id, position_id, slots, required, shifts) values
  ('frigate', 'security_chief', 1, false, 1),
  ('frigate', 'chief_science_officer', 1, false, 1)
on conflict (ship_id, position_id) do update set
  slots = excluded.slots,
  required = excluded.required,
  shifts = excluded.shifts;
