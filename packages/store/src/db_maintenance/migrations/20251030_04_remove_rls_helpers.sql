-- Migration: Remove RLS helper functions and inline role checks to avoid recursion (54001)
-- Align policies with role groups from packages/store/src/utils/nav.ts
-- Date: 2025-10-30

BEGIN;

-- Profiles: allow pod/admin roles to view all profiles via JWT claim to avoid recursion
DROP POLICY IF EXISTS "dispatchers_view_profiles" ON public.profiles;
CREATE POLICY "dispatchers_view_profiles"
ON public.profiles
FOR SELECT
USING (
  current_setting('request.jwt.claims', true)::json->>'role' IN (
    'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'
  )
);

-- Pods: pod/admin roles can read and modify all pods
DROP POLICY IF EXISTS dispatchers_manage_pods ON public.pods;
CREATE POLICY dispatchers_manage_pods
ON public.pods
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Roster entries: pod/admin roles manage
DROP POLICY IF EXISTS "dispatchers_manage_roster" ON public.roster_entries;
CREATE POLICY "dispatchers_manage_roster"
ON public.roster_entries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Pod shifts: team view/insert/update/delete or pod/admin roles
DROP POLICY IF EXISTS "team_view_pod_shifts" ON public.pod_shifts;
CREATE POLICY "team_view_pod_shifts"
ON public.pod_shifts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "team_insert_pod_shifts" ON public.pod_shifts;
CREATE POLICY "team_insert_pod_shifts"
ON public.pod_shifts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "team_update_pod_shifts" ON public.pod_shifts;
CREATE POLICY "team_update_pod_shifts"
ON public.pod_shifts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "team_delete_pod_shifts" ON public.pod_shifts;
CREATE POLICY "team_delete_pod_shifts"
ON public.pod_shifts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatch: submissions/updates/logistics
DROP POLICY IF EXISTS "dispatchers_manage_dispatches" ON public.dispatch_submissions;
CREATE POLICY "dispatchers_manage_dispatches"
ON public.dispatch_submissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "dispatchers_manage_dispatch_updates" ON public.dispatch_updates;
CREATE POLICY "dispatchers_manage_dispatch_updates"
ON public.dispatch_updates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "dispatchers_manage_dispatch_logistics" ON public.dispatch_logistics;
CREATE POLICY "dispatchers_manage_dispatch_logistics"
ON public.dispatch_logistics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatch shifts
DROP POLICY IF EXISTS "team_view_dispatch_shifts" ON public.dispatch_shifts;
CREATE POLICY "team_view_dispatch_shifts"
ON public.dispatch_shifts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = dispatch_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "dispatchers_manage_dispatch_shifts" ON public.dispatch_shifts;
CREATE POLICY "dispatchers_manage_dispatch_shifts"
ON public.dispatch_shifts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Academy
DROP POLICY IF EXISTS "dispatchers_manage_academy" ON public.academy_classes;
CREATE POLICY "dispatchers_manage_academy"
ON public.academy_classes
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

DROP POLICY IF EXISTS "dispatchers_manage_academy_sessions" ON public.academy_sessions;
CREATE POLICY "dispatchers_manage_academy_sessions"
ON public.academy_sessions
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

DROP POLICY IF EXISTS "dispatchers_manage_academy_instructors" ON public.academy_instructors;
CREATE POLICY "dispatchers_manage_academy_instructors"
ON public.academy_instructors
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

DROP POLICY IF EXISTS "dispatchers_insert_academy_sessions" ON public.academy_sessions;
CREATE POLICY "dispatchers_insert_academy_sessions"
ON public.academy_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "dispatchers_update_academy_sessions" ON public.academy_sessions;
CREATE POLICY "dispatchers_update_academy_sessions"
ON public.academy_sessions
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

DROP POLICY IF EXISTS "dispatchers_manage_academy_participants" ON public.academy_participants;
CREATE POLICY "dispatchers_manage_academy_participants"
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

DROP POLICY IF EXISTS "dispatchers_insert_academy_participants" ON public.academy_participants;
CREATE POLICY "dispatchers_insert_academy_participants"
ON public.academy_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "dispatchers_update_academy_participants" ON public.academy_participants;
CREATE POLICY "dispatchers_update_academy_participants"
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

-- Missing person records
DROP POLICY IF EXISTS "dispatchers_manage_missing_persons" ON public.missing_person_records;
CREATE POLICY "dispatchers_manage_missing_persons"
ON public.missing_person_records
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Trust signatures
DROP POLICY IF EXISTS "dispatch_admins_manage_trust" ON public.trust_signatures;
CREATE POLICY "dispatch_admins_manage_trust"
ON public.trust_signatures
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Drop helper functions if they exist (remove recursion risk)
DROP FUNCTION IF EXISTS public.is_in_roles(text[]);
DROP FUNCTION IF EXISTS public.current_access_role();
DROP FUNCTION IF EXISTS public.is_complete_onboarding();
DROP FUNCTION IF EXISTS public.is_elevated();
DROP FUNCTION IF EXISTS public.is_pod_admin();
DROP FUNCTION IF EXISTS public.is_region_admin();
DROP FUNCTION IF EXISTS public.is_national_admin();
DROP FUNCTION IF EXISTS public.can_manage_academy();

COMMIT;
