-- Ensure RLS and auth-triggered provisioning for public.profiles

-- Enable RLS
alter table if exists public.profiles enable row level security;

-- Policies: own-row access (idempotent guards)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Select own profile'
  ) then
    create policy "Select own profile" on public.profiles for select using (auth.uid() = id);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Insert own profile'
  ) then
    create policy "Insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Update own profile'
  ) then
    create policy "Update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end$$;

-- Trigger: auto-create profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, region_id)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'Explorer'), '@', 1)),
          null)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
