-- Campaign missions and mission progress

create table if not exists public.campaign_missions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  title text,
  description text,
  required_actions jsonb,
  reward jsonb
);
create index if not exists campaign_missions_campaign_idx on public.campaign_missions (campaign_id);

-- Per-profile mission progress
create table if not exists public.campaign_mission_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  campaign_id uuid not null,
  mission_id uuid not null references public.campaign_missions(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create unique index if not exists mission_progress_unique on public.campaign_mission_progress (profile_id, mission_id);

alter table if exists public.campaign_missions enable row level security;
alter table if exists public.campaign_mission_progress enable row level security;

-- Public read; writes via service role only
drop policy if exists campaign_missions_public_read on public.campaign_missions;
create policy campaign_missions_public_read on public.campaign_missions for select using (true);

drop policy if exists mission_progress_insert on public.campaign_mission_progress;
create policy mission_progress_insert on public.campaign_mission_progress for insert to service_role with check (true);

drop policy if exists mission_progress_update on public.campaign_mission_progress;
create policy mission_progress_update on public.campaign_mission_progress for update to service_role using (true) with check (true);

