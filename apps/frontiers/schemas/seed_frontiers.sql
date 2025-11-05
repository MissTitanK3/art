-- Seed three factions
insert into public.factions (id, name, color, description) values
  ('coalition', 'Coalition', '#7c3aed', 'Admin Pods — coordination and relief.'),
  ('syndicate', 'Syndicate', '#06b6d4', 'Independent Pods — rapid response.'),
  ('guild', 'Guild', '#fb923c', 'Training & Knowledge keepers.')
on conflict (id) do update set name = excluded.name, color = excluded.color, description = excluded.description;

-- Seed five fake signals (expires in ~7 days)
-- ensure idempotency without relying on a unique index on source_id
delete from public.art_signals where source_id in ('seed-1','seed-2','seed-3','seed-4','seed-5');

with cfg as (
  select now() as now, (now() + interval '7 days') as exp
)
insert into public.art_signals (source_id, source_type, region_id, sector_code, title, summary, tags, created_at, expires_at, is_discovered)
select * from (
  values
    ('seed-1','dispatch','region-pnw','EOS-9','Hilltop Relief','Supplies staged at hilltop.', ARRAY['beacon']::text[], (select now from cfg), (select exp from cfg), false),
    ('seed-2','session','region-pnw','EOS-9','OPSEC 101','Intro to secure coordination.', ARRAY['cache']::text[], (select now from cfg) - interval '1 hour', (select exp from cfg), false),
    ('seed-3','class','region-pnw','EOS-9','First Aid Basics','Skillshare on scene safety.', ARRAY['assembly']::text[], (select now from cfg) - interval '2 hours', (select exp from cfg), false),
    ('seed-4','dispatch','region-template','EOS-0','Harbor Beacon','Test beacon near docks.', ARRAY['beacon']::text[], (select now from cfg) - interval '3 hours', (select exp from cfg), false),
    ('seed-5','session','region-template','EOS-0','Cache: Radio Checklists','Reference cache for comms.', ARRAY['cache']::text[], (select now from cfg) - interval '30 minutes', (select exp from cfg), false)
) as t(source_id, source_type, region_id, sector_code, title, summary, tags, created_at, expires_at, is_discovered);

-- Demo identities and ship state for testing
-- A demo player profile_id with initial ship stats
insert into public.ship_states (profile_id, ship_condition, morale, fatigue, last_update)
values
  ('user-demo', 0.95, 0.90, 0.10, now())
on conflict (profile_id) do update set
  ship_condition = excluded.ship_condition,
  morale = excluded.morale,
  fatigue = excluded.fatigue,
  last_update = excluded.last_update;

-- Give the demo player a starting reputation with the Coalition
insert into public.profiles_factions (profile_id, faction_id, reputation)
values
  ('user-demo', 'coalition', 25)
on conflict (profile_id, faction_id) do update set reputation = excluded.reputation, updated_at = now();

-- Seed a small connections graph for resonance propagation
-- Treat these ids as generic actors (crew, pods, allies)
insert into public.connections (source_id, recipient_id) values
  ('user-demo','crew-1'),
  ('user-demo','crew-2'),
  ('crew-1','pod-alpha'),
  ('crew-2','ally-1'),
  ('ally-1','ally-2'),
  ('pod-alpha','ally-2')
on conflict do nothing;

-- Optional: initial resonance echoes (empty by default)
-- insert into public.resonance_effects (source_id, recipient_id, hop, strength, expires_at)
-- values ('user-demo','crew-1',1,0.75, now() + interval '24 hours');
