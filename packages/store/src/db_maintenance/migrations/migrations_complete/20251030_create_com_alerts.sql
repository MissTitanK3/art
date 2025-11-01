-- Create table for dispatch custom alerts (shared guidance)
-- Adjust event_id type to match your events schema (text vs uuid)

-- Ensure gen_random_uuid() is available
create extension if not exists pgcrypto;

create table if not exists public.com_alerts (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  direction text not null,
  description text not null,
  updated_at timestamptz not null default now()
);

-- Helpful index for per-event queries
create index if not exists com_alerts_event_id_idx on public.com_alerts(event_id);

-- Enable row level security and permissive policies (tune for your app auth model)
alter table public.com_alerts enable row level security;

-- Read: everyone (viewer) can read alerts for now
drop policy if exists com_alerts_select_all on public.com_alerts;
create policy com_alerts_select_all on public.com_alerts
  for select
  using (true);

-- Insert: allow any authenticated user (simplify for now)
drop policy if exists com_alerts_insert_all on public.com_alerts;
create policy com_alerts_insert_all on public.com_alerts
  for insert
  with check (true);

-- Update: allow any authenticated user (simplify for now)
drop policy if exists com_alerts_update_all on public.com_alerts;
create policy com_alerts_update_all on public.com_alerts
  for update
  using (true)
  with check (true);

-- Delete: allow any authenticated user (simplify for now)
drop policy if exists com_alerts_delete_all on public.com_alerts;
create policy com_alerts_delete_all on public.com_alerts
  for delete
  using (true);
