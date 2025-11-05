-- Public donation ledger summary view
-- Idempotent: drops and recreates the view

drop view if exists public.ledger_summary;
create view public.ledger_summary as
select e.region_id as region_id,
       coalesce(sum(e.amount), 0) as total,
       count(distinct e.source_email) as donors
from public.resonance_effects e
group by e.region_id;
