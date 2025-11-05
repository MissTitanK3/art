-- Phase 3: Donations, Resonance Metadata, Notifications, Graph v2, Fleets
-- Safe, idempotent migration for existing databases.

-- 1) Public donation ledger
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  profile_email text not null,
  amount numeric not null,
  message_id text unique,
  donor_alias text,
  message text,
  created_at timestamptz not null default now()
);
create index if not exists donations_created_idx on public.donations (created_at desc);

-- 2) Extend resonance pulses with donor metadata
alter table if exists public.resonance_effects
  add column if not exists source_email text;
alter table if exists public.resonance_effects
  add column if not exists amount numeric default 0;
alter table if exists public.resonance_effects
  add column if not exists donation_message_id text;
create index if not exists resonance_donation_msg_idx on public.resonance_effects (donation_message_id);

-- 3) Notifications queue
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_profile_idx on public.notifications (profile_id, read_at);

-- 4) Connection graph v2 (UUID-based)
create table if not exists public.connections_v2 (
  source_id uuid not null,
  target_id uuid not null,
  relation text,
  trust numeric,
  created_at timestamptz not null default now(),
  primary key (source_id, target_id)
);
create index if not exists connections_v2_source_idx on public.connections_v2 (source_id);
create index if not exists connections_v2_target_idx on public.connections_v2 (target_id);
create index if not exists connections_v2_relation_idx on public.connections_v2 (relation);

-- 5) Fleets (affiliations)
create table if not exists public.fleets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region_id text,
  leader_id uuid,
  members uuid[] default '{}'::uuid[],
  created_at timestamptz not null default now()
);
create index if not exists fleets_region_idx on public.fleets (region_id);

-- 7) Ledger summary view (by recipient region)
drop view if exists public.ledger_summary;
create view public.ledger_summary as
select p.region_id as region_id,
       coalesce(sum(e.amount), 0) as total,
       count(distinct e.source_email) as donors
from public.resonance_effects e
left join public.profiles p on p.id = e.recipient_id
group by p.region_id;

-- 6) RLS and policies
alter table if exists public.donations enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.connections_v2 enable row level security;
alter table if exists public.fleets enable row level security;

-- donations policies
drop policy if exists donations_insert on public.donations;
create policy donations_insert on public.donations
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists donations_select on public.donations;
create policy donations_select on public.donations
  for select
  using (true);

-- notifications policies
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert
  with check (auth.role() = 'service_role');

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select
  using (true);

-- connections_v2 policies
drop policy if exists connections_v2_rw on public.connections_v2;
create policy connections_v2_rw on public.connections_v2
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- fleets policies
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
