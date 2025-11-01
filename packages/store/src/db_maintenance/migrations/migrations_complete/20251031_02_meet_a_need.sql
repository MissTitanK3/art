-- Meet-A-Need: lightweight mutual aid requests
-- Creates public.meet_a_need with basic privacy tiers and dispatcher-managed flow

-- Ensure gen_random_uuid() is available
create extension if not exists pgcrypto;

create table if not exists public.meet_a_need (
  id uuid primary key default gen_random_uuid(),
  created_by text references public.profiles(id),
  category text not null,
  description text not null,
  urgency text check (urgency in ('low','normal','urgent')) default 'normal',
  visibility text check (visibility in ('public','region','pod')) default 'region',
  -- location as flexible JSON (e.g., { type, label, lat, lng, area, media: [url, ...] })
  location jsonb,
  contact_preference text,
  status text check (status in ('open','matched','fulfilled','closed')) default 'open',
  responders jsonb default '[]', -- array of { profile_id, resource_type, notes, created_at }
  assigned_to text[],            -- array of profile ids
  fulfilled_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists meet_a_need_created_at_idx on public.meet_a_need(created_at desc);
create index if not exists meet_a_need_visibility_idx on public.meet_a_need(visibility);
create index if not exists meet_a_need_status_idx on public.meet_a_need(status);
-- Newly added to support UI filtering and updates
create index if not exists meet_a_need_urgency_idx on public.meet_a_need(urgency);
create index if not exists meet_a_need_created_by_idx on public.meet_a_need(created_by);
-- Helpful for querying by location label/media keys
create index if not exists meet_a_need_location_gin on public.meet_a_need using gin (location jsonb_path_ops);

alter table public.meet_a_need enable row level security;

-- Visibility policy: allow reading based on visibility tier
--  - public: visible to any authenticated user
--  - region: visible to authenticated users whose profile.coordination_zone matches the poster
--  - pod: visible to dispatchers (any dispatcher_* or admin roles)
drop policy if exists man_select_visibility on public.meet_a_need;
create policy man_select_visibility on public.meet_a_need
for select
to authenticated
using (
  visibility = 'public'
  OR (
    visibility = 'region' AND exists (
      select 1 from public.profiles viewer
      join public.profiles owner on owner.id = meet_a_need.created_by
      where viewer.user_id = (auth.uid())::text
        and viewer.coordination_zone is not null
        and viewer.coordination_zone = owner.coordination_zone
    )
  )
  OR (
    visibility = 'pod' AND exists (
      select 1 from public.profiles p
      where p.user_id = (auth.uid())::text
        and p.access_role = any (array['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
    )
  )
);

-- Creator can read/write their own need
drop policy if exists man_owner_rw on public.meet_a_need;
create policy man_owner_rw on public.meet_a_need
for all
to authenticated
using (
  created_by in (select id from public.profiles where user_id = (auth.uid())::text)
)
with check (
  created_by in (select id from public.profiles where user_id = (auth.uid())::text)
);

-- Dispatchers/admins manage all
drop policy if exists man_dispatchers_manage on public.meet_a_need;
create policy man_dispatchers_manage on public.meet_a_need
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = (auth.uid())::text
      and p.access_role = any (array['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = (auth.uid())::text
      and p.access_role = any (array['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Allow any authenticated user to insert (created_by must match their own profile)
drop policy if exists man_insert_authenticated on public.meet_a_need;
create policy man_insert_authenticated on public.meet_a_need
for insert
to authenticated
with check (
  created_by in (select id from public.profiles where user_id = (auth.uid())::text)
);

-- TEMPORARY: Allow authenticated users to update to register themselves as responders.
-- NOTE: This is permissive and should be replaced with a column-scoped RPC or trigger.
drop policy if exists man_update_responders_any_authenticated on public.meet_a_need;
create policy man_update_responders_any_authenticated on public.meet_a_need
for update
to authenticated
using (true)
with check (true);
