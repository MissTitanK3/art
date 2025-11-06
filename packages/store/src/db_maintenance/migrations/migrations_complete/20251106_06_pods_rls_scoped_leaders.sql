-- Migration: Scope pod_leader/trainer pod management to own pods; keep dispatch/admin broad
-- Date: 2025-11-06
-- Safe to re-run

BEGIN;

-- Broad policy: dispatchers and admins manage all pods
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

-- Remove prior insert-only policy if present
DROP POLICY IF EXISTS pod_leaders_create_pods ON public.pods;

-- Leaders/Trainers: Insert only for pods they create (created_by = self)
DROP POLICY IF EXISTS leaders_insert_own_pods ON public.pods;
CREATE POLICY leaders_insert_own_pods
ON public.pods
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
      AND p.id = public.pods.created_by
  )
);

-- Leaders/Trainers: manage only pods they lead or created
DROP POLICY IF EXISTS leaders_manage_own_pods ON public.pods;
CREATE POLICY leaders_manage_own_pods
ON public.pods
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
      AND (
        EXISTS (
          SELECT 1 FROM public.roster_entries r
          WHERE r.pod_id = public.pods.id
            AND r.profile_id = p.id
            AND r.role = 'lead'
        )
        OR public.pods.created_by = p.id
      )
  )
);

DROP POLICY IF EXISTS leaders_update_own_pods ON public.pods;
CREATE POLICY leaders_update_own_pods
ON public.pods
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
      AND (
        EXISTS (
          SELECT 1 FROM public.roster_entries r
          WHERE r.pod_id = public.pods.id
            AND r.profile_id = p.id
            AND r.role = 'lead'
        )
        OR public.pods.created_by = p.id
      )
  )
);

DROP POLICY IF EXISTS leaders_delete_own_pods ON public.pods;
CREATE POLICY leaders_delete_own_pods
ON public.pods
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
      AND (
        EXISTS (
          SELECT 1 FROM public.roster_entries r
          WHERE r.pod_id = public.pods.id
            AND r.profile_id = p.id
            AND r.role = 'lead'
        )
        OR public.pods.created_by = p.id
      )
  )
);

COMMIT;

-- pnw
-- norcal
-- socal
-- wap