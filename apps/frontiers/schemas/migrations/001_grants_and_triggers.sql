-- Ensure function execute grants for RPCs
grant execute on function public.reset_state(text) to anon, authenticated, service_role;

-- Keep updated_at fresh on profiles_factions
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_factions_updated on public.profiles_factions;
create trigger trg_profiles_factions_updated
before update on public.profiles_factions
for each row execute function public.set_updated_at();

