-- Buff per-level component effects to make upgrades feel more meaningful
-- Safe/idempotent-ish: runs multiplicative bumps on known numeric keys when present.

do $$
declare
  v_exists boolean;
begin
  select exists (
    select 1 from information_schema.tables where table_schema='public' and table_name='component_catalog'
  ) into v_exists;
  if not v_exists then
    return;
  end if;

  -- Helper: multiply a numeric value inside jsonb if present
  -- Note: This uses jsonb_each + aggregation to avoid losing other keys.

  -- Hull: integrity_upkeep per-level +50%
  update public.component_catalog
  set per_level = (
    select jsonb_object_agg(k, case when k='integrity_upkeep' then to_jsonb((coalesce((v::text)::numeric, 0) * 1.5)) else v end)
    from jsonb_each(per_level) as e(k, v)
  )
  where slot='hull' and per_level is not null;

  -- Engine: route_efficiency per-level +50%
  update public.component_catalog
  set per_level = (
    select jsonb_object_agg(k, case when k='route_efficiency' then to_jsonb((coalesce((v::text)::numeric, 0) * 1.5)) else v end)
    from jsonb_each(per_level) as e(k, v)
  )
  where slot='engine' and per_level is not null;

  -- Comms: signal_yield per-level +33%
  update public.component_catalog
  set per_level = (
    select jsonb_object_agg(k, case when k='signal_yield' then to_jsonb((coalesce((v::text)::numeric, 0) * 1.3333)) else v end)
    from jsonb_each(per_level) as e(k, v)
  )
  where slot='comms' and per_level is not null;

  -- Scanner: signal_clarity per-level +33%
  update public.component_catalog
  set per_level = (
    select jsonb_object_agg(k, case when k='signal_clarity' then to_jsonb((coalesce((v::text)::numeric, 0) * 1.3333)) else v end)
    from jsonb_each(per_level) as e(k, v)
  )
  where slot='scanner' and per_level is not null;

  -- Aux: repair_bonus per-level +33%
  update public.component_catalog
  set per_level = (
    select jsonb_object_agg(k, case when k='repair_bonus' then to_jsonb((coalesce((v::text)::numeric, 0) * 1.3333)) else v end)
    from jsonb_each(per_level) as e(k, v)
  )
  where slot='aux' and per_level is not null;

  -- Weapons currently have empty per_level; leave unchanged.
end $$;
