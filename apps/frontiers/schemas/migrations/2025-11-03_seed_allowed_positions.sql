-- Seed allowed_positions for initial crew entries
update public.crew_catalog set allowed_positions = '{mechanic}' where id in ('mechanic','mechanic_t2');
update public.crew_catalog set allowed_positions = '{navigator}' where id in ('navigator','navigator_t2');
update public.crew_catalog set allowed_positions = '{medic}' where id in ('medic','medic_t2');
update public.crew_catalog set allowed_positions = '{comms,sensor_tech}' where id in ('operator','operator_t2');
