-- Add policy to allow users to view their own profile regardless of role
-- This fixes issues where a user's JWT role doesn't match their DB role yet (e.g. after promotion)
-- preventing them from fetching their profile and causing session clears.

DROP POLICY IF EXISTS view_own_profile ON public.profiles;

CREATE POLICY view_own_profile
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid()
);
