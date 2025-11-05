-- Add region_id to resonance_effects for ledger grouping
alter table if exists public.resonance_effects
  add column if not exists region_id text;

-- Optional: supporting index if queries group/filter by region
create index if not exists resonance_region_idx on public.resonance_effects (region_id);

