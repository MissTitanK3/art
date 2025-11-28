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

-- Ship catalog reference data with tradeoffs (idempotent)
insert into public.ship_catalog (
  id,
  name,
  tier,
  role,
  mass_class,
  description,
  required_days,
  crew_requirements,
  upkeep_cost,
  fuel_efficiency,
  power_capacity,
  rarity,
  faction_tags,
  base_slots,
  optional_modifiers,
  morale_influence,
  sector_bonus,
  depreciation_rate,
  image_url
) values
  ('swiftling_scout','Swiftling Scout',1,'scout','light','Fast recon craft. Cheap to maintain but fragile.',3,1,1,0.9,2,'common',ARRAY['neutral']::text[],'{"engine":"basic_thruster","sensor":"scout_radar","weapon":null,"utility":null}'::jsonb,'{"speed_bonus":0.1}'::jsonb,0.0,'{"frontier":0.05}'::jsonb,0.6,null),
  ('bulwark_hauler','Bulwark Hauler',1,'hauler','medium','Low-tech cargo vessel with tiny crew.',4,2,1,0.85,2,'common',ARRAY['neutral']::text[],'{"engine":"hauler_drive","cargo":"small_hold","sensor":null,"weapon":null}'::jsonb,'{"cargo_bonus":0.2}'::jsonb,-0.05,'{"colony":0.05}'::jsonb,0.65,null),
  ('ember_sparrow','Ember Sparrow',2,'combat','light','Escort fighter. High morale impact but low endurance.',7,3,2,0.7,3,'uncommon',ARRAY['frontier_militia']::text[],'{"engine":"combat_thruster_mk1","weapon_primary":"light_cannon","utility":"countermeasures"}'::jsonb,'{"morale_bonus":0.1}'::jsonb,0.1,'{"frontier":0.1}'::jsonb,0.55,null),
  ('deepwatch_miner','Deepwatch Miner',2,'miner','heavy','Mining ship with low speed and high power drain.',8,4,3,0.5,4,'uncommon',ARRAY['terraformers_union']::text[],'{"engine":"industrial_drive","mining":"laser_drill","cargo":"ore_bay","utility":"geo_scanner"}'::jsonb,'{"cargo_bonus":0.15}'::jsonb,-0.1,'{"industrial":0.15}'::jsonb,0.5,null),
  ('skywarden_patrol','Skywarden Patrol',3,'patrol','medium','Interception unit. Good sensors, moderate arms.',12,5,4,0.65,5,'rare',ARRAY['planetary_guard']::text[],'{"engine":"intercept_drive","weapon_primary":"rapid_fire_turret","sensor":"long_range_array","utility":"armor_booster"}'::jsonb,'{"speed_bonus":0.05}'::jsonb,0.05,'{"homeworld":0.1}'::jsonb,0.45,null),
  ('tempest_liner','Tempest Liner',3,'carrier','heavy','Crew carrier. Good for expeditions but costly.',10,10,6,0.6,4,'rare',ARRAY['civil_fleet']::text[],'{"engine":"efficient_drive_mk2","cargo":"passenger_cabins","utility":"shield_array"}'::jsonb,'{"morale_bonus":0.2}'::jsonb,0.15,'{"civ":0.1}'::jsonb,0.4,null),
  ('razorwind_frigate','Razorwind Frigate',4,'combat','medium','Frontline warship with big upgrades available.',18,12,8,0.55,6,'rare',ARRAY['frontier_militia']::text[],'{"engine":"war_core_mk1","weapon_primary":"dual_cannons","weapon_secondary":"missile_bay","shield":"deflector_mk1"}'::jsonb,'{}'::jsonb,0.1,'{"frontier":0.15}'::jsonb,0.35,null),
  ('atlas_colossus','Atlas Colossus',4,'hauler','heavy','Logistics giant. Massive capacity, sluggish mobility.',20,15,7,0.45,5,'rare',ARRAY['neutral']::text[],'{"engine":"mass_lifter_drive","cargo":"mega_hold","utility":"nav_assist_ai"}'::jsonb,'{"cargo_bonus":0.4}'::jsonb,-0.15,'{"industrial":0.1}'::jsonb,0.3,null),
  ('voidseer_recon','Voidseer Recon',5,'scout','light','Elite stealth probe carrier. Hates combat.',28,6,10,0.9,5,'elite',ARRAY['shadow_comms']::text[],'{"engine":"silent_vector_mk2","sensor":"quantum_probe","utility":"cloaking_module"}'::jsonb,'{"stealth_bonus":0.3}'::jsonb,0.0,'{"stealth_sector":0.15}'::jsonb,0.25,null),
  ('sovereign_battleship','Sovereign Battleship',6,'flagship','superheavy','Massive artillery platform with morale presence.',40,30,15,0.4,8,'legendary',ARRAY['imperial_navy']::text[],'{"engine":"war_core_mk3","weapon_primary":"siege_cannon","weapon_secondary":"tactical_missiles","shield":"aegis_plate","utility":"command_bridge"}'::jsonb,'{"morale_bonus":0.3}'::jsonb,0.25,'{"throne_sector":0.2}'::jsonb,0.15,null),
  -- Tier 0 starter hull (failsafe)
  ('copper_sparrow','Copper Sparrow',0,'scout','light','Barebones shuttle used as a fallback starter.',0,1,0,0.9,1,'common',ARRAY['neutral']::text[],'{"engine":"basic_thruster","sensor":"scout_radar"}'::jsonb,'{}'::jsonb,0.0,'{}'::jsonb,0.9,null),
  -- New variants to widen early and mid-tier options
  ('gossamer_kite','Gossamer Kite',1,'scout','light','Starter-friendly skiff tuned for range over power.',2,1,1,0.95,1,'common',ARRAY['neutral']::text[],'{"engine":"basic_thruster","sensor":"scout_radar","utility":null}'::jsonb,'{"stealth_bonus":0.05}'::jsonb,0.05,'{"frontier":0.03}'::jsonb,0.7,null),
  ('wayfarer_courier','Wayfarer Courier',2,'hauler','light','Agile courier that trades cargo for morale stability.',6,3,2,0.82,3,'uncommon',ARRAY['guild']::text[],'{"engine":"efficient_drive_mk1","cargo":"courier_pod","sensor":"nav_array"}'::jsonb,'{"speed_bonus":0.08}'::jsonb,0.08,'{"civ":0.08}'::jsonb,0.55,null),
  ('ironclad_bastion','Ironclad Bastion',5,'patrol','heavy','Shield-focused patrol hull; slow but hard to shake.',30,18,11,0.48,7,'elite',ARRAY['planetary_guard']::text[],'{"engine":"armored_drive","weapon_primary":"flak_turret","shield":"bulwark_plating","utility":"targeting_computer"}'::jsonb,'{}'::jsonb,0.12,'{"homeworld":0.18}'::jsonb,0.22,null),
  ('aurora_hospice','Aurora Hospice',3,'carrier','medium','Field hospital carrier that boosts crew spirit.',14,8,5,0.62,4,'rare',ARRAY['civil_fleet']::text[],'{"engine":"efficient_drive_mk2","cargo":"medbay_suite","utility":"shield_array"}'::jsonb,'{"morale_bonus":0.25}'::jsonb,0.2,'{"civ":0.12}'::jsonb,0.38,null)
on conflict (id) do update set
  name = excluded.name,
  tier = excluded.tier,
  role = excluded.role,
  mass_class = excluded.mass_class,
  description = excluded.description,
  required_days = excluded.required_days,
  crew_requirements = excluded.crew_requirements,
  upkeep_cost = excluded.upkeep_cost,
  fuel_efficiency = excluded.fuel_efficiency,
  power_capacity = excluded.power_capacity,
  rarity = excluded.rarity,
  faction_tags = excluded.faction_tags,
  base_slots = excluded.base_slots,
  optional_modifiers = excluded.optional_modifiers,
  morale_influence = excluded.morale_influence,
  sector_bonus = excluded.sector_bonus,
  depreciation_rate = excluded.depreciation_rate,
  image_url = excluded.image_url;

-- Starter ship for demo user
insert into public.profile_ships (profile_id, ship_id)
values ('user-demo', 'gossamer_kite')
on conflict (profile_id) do update set ship_id = excluded.ship_id, updated_at = now();
