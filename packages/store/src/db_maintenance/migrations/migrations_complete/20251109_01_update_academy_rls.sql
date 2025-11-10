-- Migration: Update RLS for academy_instructors and academy_participants
-- - academy_instructors: require dispatcher_verified+ (dispatcher_verified, dispatcher_admin, admin, regional_admin, national_admin)
-- - academy_participants: require trainer+ (trainer and dispatcher/admin roles)

-- Drop existing policies if present
DROP POLICY IF EXISTS public_view_academy_instructors ON public.academy_instructors;
DROP POLICY IF EXISTS dispatchers_manage_academy_instructors ON public.academy_instructors;

DROP POLICY IF EXISTS public_view_academy_participants ON public.academy_participants;
DROP POLICY IF EXISTS dispatchers_manage_academy_participants ON public.academy_participants;
DROP POLICY IF EXISTS dispatchers_insert_academy_participants ON public.academy_participants;
DROP POLICY IF EXISTS dispatchers_update_academy_participants ON public.academy_participants;

-- Recreate policies with new role requirements
CREATE POLICY public_view_academy_instructors
ON public.academy_instructors
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY dispatchers_manage_academy_instructors
ON public.academy_instructors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY public_view_academy_participants
ON public.academy_participants
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY dispatchers_manage_academy_participants
ON public.academy_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY dispatchers_insert_academy_participants
ON public.academy_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY dispatchers_update_academy_participants
ON public.academy_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- pnw
-- wap
-- socal
-- norcal