-- Add notifications_disabled column to existing region_settings table
alter table region_settings
add column if not exists notifications_disabled boolean not null default false;

-- Ensure RLS is enabled (should be already, but safe to repeat)
alter table region_settings enable row level security;

-- Update policies if needed (assuming existing policies cover it, or adding specific ones)
-- Since the table existed, we should check if we need to add policies.
-- The init_region.sql didn't show policies for region_settings, so let's add them to be safe.

create policy "Region settings viewable by everyone"
  on region_settings for select
  using (true);

create policy "Region settings updatable by admins"
  on region_settings for update
  using (
    exists (
      select 1 from profiles
      where profiles.user_id = auth.uid()
      and profiles.access_role in ('dispatcher_admin', 'admin', 'regional_admin', 'national_admin')
    )
  );
