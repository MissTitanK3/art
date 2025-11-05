-- Extend crew catalog with position fit metadata
alter table if exists public.crew_catalog
  add column if not exists allowed_positions text[],
  add column if not exists rank text,
  add column if not exists upkeep int default 0;
