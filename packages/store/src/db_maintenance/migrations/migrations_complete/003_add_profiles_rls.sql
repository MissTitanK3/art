-- Add RLS policies to allow users to create and update their own profiles

begin;

create policy insert_own_profile
on public.profiles
for insert
with check (
  user_id = auth.uid()
);

create policy update_own_profile
on public.profiles
for update
using (
  user_id = auth.uid()
)
with check (
  user_id = auth.uid()
);

commit;
