-- Canonicalize legacy component kind identifiers in ship_catalog.base_slots and ship_components
-- This migration maps known legacy labels to the new component_catalog ids.

do $$
begin
  -- Only run mapping if the component_catalog exists
  if exists (
    select 1 from information_schema.tables where table_schema='public' and table_name='component_catalog'
  ) then
    -- Build mapping (legacy -> canonical)
    create temp table _kind_map(legacy text primary key, canonical text not null);

    -- hull
    insert into _kind_map(legacy, canonical) values
      ('light', 'plating_mk1'),
      ('reinforced', 'plating_mk2'),
      ('armored', 'adaptive_armor');

    -- engine
    insert into _kind_map(legacy, canonical) values
      ('basic', 'ion_drive'),
      ('improved', 'fusion_burn'),
      ('high-torque', 'fusion_burn'),
      ('dual', 'warp_coils');

    -- comms
    insert into _kind_map(legacy, canonical) values
      ('short', 'broadband_array'),
      ('medium', 'encrypted_relay'),
      ('long', 'quantum_link');

    -- aux
    insert into _kind_map(legacy, canonical) values
      ('battery', 'battery_bank'),
      ('stabilizer', 'power_coupler');

    -- Update ship_catalog.base_slots jsonb by replacing legacy values with canonical when present
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='ship_catalog' and column_name='base_slots') then
      update public.ship_catalog sc
      set base_slots = (
        select jsonb_object_agg(k, coalesce(m.canonical, v))
        from jsonb_each_text(sc.base_slots) as e(k, v)
        left join _kind_map m on m.legacy = v
      )
      where sc.base_slots is not null;
    end if;

    -- Update ship_components.kind to canonical where it matches a legacy id
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name='ship_components') then
      update public.ship_components c
      set kind = m.canonical
      from _kind_map m
      where c.kind = m.legacy;
    end if;

    drop table if exists _kind_map;
  end if;
end $$;
