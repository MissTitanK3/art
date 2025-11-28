-- Ship catalog tradeoffs + text IDs
-- Safely migrate ship_catalog to text IDs and add the new tradeoff columns.

begin;

-- 1) Drop existing FKs that reference ship_catalog so we can change the PK type
alter table if exists public.profile_ships drop constraint if exists profile_ships_ship_id_fkey;
alter table if exists public.ship_position_templates drop constraint if exists ship_position_templates_ship_id_fkey;
alter table if exists public.profile_ship_positions drop constraint if exists profile_ship_positions_ship_id_fkey;

-- 2) Add a working text column for IDs and backfill from existing UUID values
alter table if exists public.ship_catalog add column if not exists id_text text;
update public.ship_catalog set id_text = id::text where id_text is null;

-- 3) Drop old PK and replace id with the text column
alter table if exists public.ship_catalog drop constraint if exists ship_catalog_pkey;
alter table if exists public.ship_catalog drop column if exists id;
alter table if exists public.ship_catalog rename column id_text to id;
alter table if exists public.ship_catalog add primary key (id);

-- 4) Add new columns (with safe defaults for existing rows)
alter table if exists public.ship_catalog
  add column if not exists role text,
  add column if not exists mass_class text,
  add column if not exists description text,
  add column if not exists crew_requirements integer not null default 0,
  add column if not exists upkeep_cost numeric not null default 0,
  add column if not exists fuel_efficiency numeric not null default 0,
  add column if not exists power_capacity integer not null default 0,
  add column if not exists rarity text not null default 'common',
  add column if not exists faction_tags text[] not null default '{}'::text[],
  add column if not exists optional_modifiers jsonb,
  add column if not exists morale_influence numeric not null default 0,
  add column if not exists sector_bonus jsonb not null default '{}'::jsonb,
  add column if not exists depreciation_rate numeric not null default 0,
  add column if not exists image_url text;

-- 5) Backfill minimal defaults for existing rows to satisfy NOT NULL constraints
update public.ship_catalog
set
  role = coalesce(role, 'scout'),
  mass_class = coalesce(mass_class, 'light'),
  rarity = coalesce(rarity, 'common'),
  sector_bonus = coalesce(sector_bonus, '{}'::jsonb),
  faction_tags = coalesce(faction_tags, '{}'::text[])
where role is null
   or mass_class is null
   or rarity is null
   or sector_bonus is null
   or faction_tags is null;

-- Lock in NOT NULL where expected
alter table if exists public.ship_catalog
  alter column role set not null,
  alter column mass_class set not null,
  alter column crew_requirements set not null,
  alter column upkeep_cost set not null,
  alter column fuel_efficiency set not null,
  alter column power_capacity set not null,
  alter column rarity set not null,
  alter column faction_tags set not null,
  alter column morale_influence set not null,
  alter column sector_bonus set not null,
  alter column depreciation_rate set not null;

-- 6) Add validation checks for the new enum-like fields
alter table if exists public.ship_catalog
  drop constraint if exists ship_catalog_role_check,
  add constraint ship_catalog_role_check check (
    role in ('scout','hauler','combat','miner','patrol','carrier','flagship')
  ),
  drop constraint if exists ship_catalog_mass_class_check,
  add constraint ship_catalog_mass_class_check check (
    mass_class in ('light','medium','heavy','superheavy')
  ),
  drop constraint if exists ship_catalog_rarity_check,
  add constraint ship_catalog_rarity_check check (
    rarity in ('common','uncommon','rare','elite','legendary')
  ),
  drop constraint if exists ship_catalog_depreciation_check,
  add constraint ship_catalog_depreciation_check check (
    depreciation_rate >= 0 and depreciation_rate <= 1
  );

-- 7) Ensure the tier index still exists (idempotent)
create index if not exists ship_catalog_tier_idx on public.ship_catalog (tier);

-- 8) Convert referencing columns to text and restore FKs
alter table if exists public.profile_ships
  alter column ship_id type text using ship_id::text;
alter table if exists public.ship_position_templates
  alter column ship_id type text using ship_id::text;
alter table if exists public.profile_ship_positions
  alter column ship_id type text using ship_id::text;

alter table if exists public.profile_ships
  add constraint profile_ships_ship_id_fkey
    foreign key (ship_id) references public.ship_catalog(id) on delete cascade;
alter table if exists public.ship_position_templates
  add constraint ship_position_templates_ship_id_fkey
    foreign key (ship_id) references public.ship_catalog(id) on delete cascade;
alter table if exists public.profile_ship_positions
  add constraint profile_ship_positions_ship_id_fkey
    foreign key (ship_id) references public.ship_catalog(id) on delete cascade;

commit;
