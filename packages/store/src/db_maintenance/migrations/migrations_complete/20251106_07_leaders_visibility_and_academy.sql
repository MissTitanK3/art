-- Migration: Broaden leaders' pod/dispatch visibility and tighten Academy CRUD
-- Date: 2025-11-06
-- Safe to re-run

BEGIN;

-- ================================================
-- Pods visibility for pod leaders / trainers
-- ================================================
DROP POLICY IF EXISTS leaders_view_pods_in_area ON public.pods;
DROP POLICY IF EXISTS leaders_view_all_pods ON public.pods;
CREATE POLICY leaders_view_all_pods
ON public.pods
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

-- ================================================
-- Dispatch visibility: add mobilizing/debriefing for leaders/trainers
-- ================================================
DROP POLICY IF EXISTS leaders_view_extra_dispatches ON public.dispatch_submissions;
CREATE POLICY leaders_view_extra_dispatches
ON public.dispatch_submissions
FOR SELECT
USING (
  status IN ('mobilizing','debriefing')
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

-- Related comms/logistics/updates inherit visibility for those statuses
DROP POLICY IF EXISTS leaders_view_extra_com_logs ON public.com_logs;
CREATE POLICY leaders_view_extra_com_logs
ON public.com_logs
FOR SELECT
USING (
  event_id IN (
    SELECT id FROM public.dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

DROP POLICY IF EXISTS leaders_view_extra_com_briefings ON public.com_briefings;
CREATE POLICY leaders_view_extra_com_briefings
ON public.com_briefings
FOR SELECT
USING (
  event_id IN (
    SELECT id FROM public.dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

DROP POLICY IF EXISTS leaders_view_extra_dispatch_updates ON public.dispatch_updates;
CREATE POLICY leaders_view_extra_dispatch_updates
ON public.dispatch_updates
FOR SELECT
USING (
  dispatch_id IN (
    SELECT id FROM public.dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

DROP POLICY IF EXISTS leaders_view_extra_dispatch_logistics ON public.dispatch_logistics;
CREATE POLICY leaders_view_extra_dispatch_logistics
ON public.dispatch_logistics
FOR SELECT
USING (
  dispatch_id IN (
    SELECT id FROM public.dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

-- ================================================
-- Academy Hub: Read for authenticated; CRUD restricted to trainers
-- ================================================

-- Classes
DROP POLICY IF EXISTS public_view_academy_classes ON public.academy_classes;
CREATE POLICY public_view_academy_classes
ON public.academy_classes
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS dispatchers_manage_academy ON public.academy_classes;
CREATE POLICY dispatchers_manage_academy
ON public.academy_classes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

-- Sessions
DROP POLICY IF EXISTS public_view_academy_sessions ON public.academy_sessions;
CREATE POLICY public_view_academy_sessions
ON public.academy_sessions
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS dispatchers_manage_academy_sessions ON public.academy_sessions;
CREATE POLICY dispatchers_manage_academy_sessions
ON public.academy_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

DROP POLICY IF EXISTS dispatchers_insert_academy_sessions ON public.academy_sessions;
CREATE POLICY dispatchers_insert_academy_sessions
ON public.academy_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

DROP POLICY IF EXISTS dispatchers_update_academy_sessions ON public.academy_sessions;
CREATE POLICY dispatchers_update_academy_sessions
ON public.academy_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

-- Instructors
DROP POLICY IF EXISTS public_view_academy_instructors ON public.academy_instructors;
CREATE POLICY public_view_academy_instructors
ON public.academy_instructors
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS dispatchers_manage_academy_instructors ON public.academy_instructors;
CREATE POLICY dispatchers_manage_academy_instructors
ON public.academy_instructors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

-- Participants
DROP POLICY IF EXISTS public_view_academy_participants ON public.academy_participants;
CREATE POLICY public_view_academy_participants
ON public.academy_participants
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS dispatchers_manage_academy_participants ON public.academy_participants;
CREATE POLICY dispatchers_manage_academy_participants
ON public.academy_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

DROP POLICY IF EXISTS dispatchers_insert_academy_participants ON public.academy_participants;
CREATE POLICY dispatchers_insert_academy_participants
ON public.academy_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

DROP POLICY IF EXISTS dispatchers_update_academy_participants ON public.academy_participants;
CREATE POLICY dispatchers_update_academy_participants
ON public.academy_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

COMMIT;

-- pnw
-- norcal
-- socal
-- wap