-- Enable Row Level Security
alter table if exists public.art_signals enable row level security;
alter table if exists public.resonance_effects enable row level security;
alter table if exists public.connections enable row level security;
alter table if exists public.ship_states enable row level security;
alter table if exists public.profiles_factions enable row level security;
alter table if exists public.donations enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.fleets enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.campaigns enable row level security;
alter table if exists public.campaign_missions enable row level security;
alter table if exists public.campaign_mission_progress enable row level security;
alter table if exists public.ship_components enable row level security;
alter table if exists public.ship_catalog enable row level security;
alter table if exists public.profile_ships enable row level security;
alter table if exists public.component_catalog enable row level security;
alter table if exists public.positions_catalog enable row level security;
alter table if exists public.ship_position_templates enable row level security;
alter table if exists public.profile_ship_positions enable row level security;
alter table if exists public.crew_catalog enable row level security;
alter table if exists public.profile_crew enable row level security;

-- art_signals: public can read non-expired signals; writes restricted to service role
drop policy if exists art_signals_public_read on public.art_signals;
create policy art_signals_public_read on public.art_signals
  for select
  using (expires_at is null or expires_at >= now());

drop policy if exists art_signals_ingest on public.art_signals;
create policy art_signals_ingest on public.art_signals
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists art_signals_update on public.art_signals;
create policy art_signals_update on public.art_signals
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists art_signals_delete on public.art_signals;
create policy art_signals_delete on public.art_signals
  for delete
  using (auth.role() = 'service_role');

-- resonance_effects: only service role inserts; recipients may read their own if desired
drop policy if exists resonance_insert on public.resonance_effects;
create policy resonance_insert on public.resonance_effects
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists resonance_select on public.resonance_effects;
create policy resonance_select on public.resonance_effects
  for select
  using (true);
-- If you want to restrict to a user mapping, replace the USING clause accordingly.

-- connections (UUID graph): service role manages the graph
drop policy if exists connections_rw on public.connections;
create policy connections_rw on public.connections
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ship_states: clients may read; writes via cron/RPC (service_role)
drop policy if exists ship_states_read on public.ship_states;
create policy ship_states_read on public.ship_states
  for select
  using (true);

drop policy if exists ship_states_write on public.ship_states;
create policy ship_states_write on public.ship_states
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- profiles_factions: managed server-side; allow select if needed
drop policy if exists profiles_factions_rw on public.profiles_factions;
create policy profiles_factions_rw on public.profiles_factions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- profiles: readable by clients; writes by service role
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  using (true);

-- Allow owners to insert/update their own profile
drop policy if exists profiles_owner_write on public.profiles;
create policy profiles_owner_write on public.profiles
  for all
  using (auth.uid()::text = id or auth.role() = 'service_role')
  with check (auth.uid()::text = id or auth.role() = 'service_role');

-- donations: public read (ledger), inserts by service role only
drop policy if exists donations_insert on public.donations;
create policy donations_insert on public.donations
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists donations_select on public.donations;
create policy donations_select on public.donations
  for select
  using (true);

-- notifications: public select; inserts by service role only
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select
  using (true);

-- ship_components: public read; writes restricted to service role
drop policy if exists ship_components_select on public.ship_components;
create policy ship_components_select on public.ship_components
  for select
  using (true);

drop policy if exists ship_components_insert on public.ship_components;
create policy ship_components_insert on public.ship_components
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists ship_components_update on public.ship_components;
create policy ship_components_update on public.ship_components
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists ship_components_delete on public.ship_components;
create policy ship_components_delete on public.ship_components
  for delete
  using (auth.role() = 'service_role');

-- fleets: allow public read to display affiliations; writes via service role
drop policy if exists fleets_insert on public.fleets;
create policy fleets_insert on public.fleets
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists fleets_update on public.fleets;
create policy fleets_update on public.fleets
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists fleets_delete on public.fleets;
create policy fleets_delete on public.fleets
  for delete
  using (auth.role() = 'service_role');

drop policy if exists fleets_select on public.fleets;
create policy fleets_select on public.fleets
  for select
  using (true);

-- campaigns: public read; inserts restricted to service role
drop policy if exists campaigns_public_read on public.campaigns;
create policy campaigns_public_read on public.campaigns
  for select
  using (true);

drop policy if exists campaigns_service_insert on public.campaigns;
create policy campaigns_service_insert on public.campaigns
  for insert
  with check (auth.role() = 'service_role');

-- campaign_missions: public read
drop policy if exists campaign_missions_public_read on public.campaign_missions;
create policy campaign_missions_public_read on public.campaign_missions
  for select
  using (true);

-- campaign_mission_progress: writes via service role only
drop policy if exists mission_progress_insert on public.campaign_mission_progress;
create policy mission_progress_insert on public.campaign_mission_progress
  for insert to service_role
  with check (true);

drop policy if exists mission_progress_update on public.campaign_mission_progress;
create policy mission_progress_update on public.campaign_mission_progress
  for update to service_role
  using (true)
  with check (true);

-- ship_catalog: public read; writes by service role
drop policy if exists ship_catalog_select on public.ship_catalog;
create policy ship_catalog_select on public.ship_catalog
  for select
  using (true);

drop policy if exists ship_catalog_write on public.ship_catalog;
create policy ship_catalog_write on public.ship_catalog
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- component_catalog: public read; writes by service role
drop policy if exists component_catalog_select on public.component_catalog;
create policy component_catalog_select on public.component_catalog
  for select
  using (true);

drop policy if exists component_catalog_write on public.component_catalog;
create policy component_catalog_write on public.component_catalog
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- profile_ships: managed server-side
drop policy if exists profile_ships_write on public.profile_ships;
create policy profile_ships_write on public.profile_ships
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- positions_catalog: public read; writes by service role
drop policy if exists positions_catalog_select on public.positions_catalog;
create policy positions_catalog_select on public.positions_catalog
  for select
  using (true);

drop policy if exists positions_catalog_write on public.positions_catalog;
create policy positions_catalog_write on public.positions_catalog
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ship_position_templates: managed server-side
drop policy if exists ship_position_templates_write on public.ship_position_templates;
create policy ship_position_templates_write on public.ship_position_templates
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- profile_ship_positions: managed server-side
drop policy if exists profile_ship_positions_write on public.profile_ship_positions;
create policy profile_ship_positions_write on public.profile_ship_positions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- crew_catalog: public read; writes by service role
drop policy if exists crew_catalog_select on public.crew_catalog;
create policy crew_catalog_select on public.crew_catalog
  for select
  using (true);

drop policy if exists crew_catalog_write on public.crew_catalog;
create policy crew_catalog_write on public.crew_catalog
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- profile_crew: managed server-side
drop policy if exists profile_crew_write on public.profile_crew;
create policy profile_crew_write on public.profile_crew
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
