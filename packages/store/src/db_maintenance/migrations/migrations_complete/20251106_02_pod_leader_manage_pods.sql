-- Migration: Include Pod Leaders in manage-pods policy
-- Date: 2025-11-06
-- Safe to re-run

BEGIN;

-- Recreate manage policy to include 'pod_leader' among elevated roles
DROP POLICY IF EXISTS dispatchers_manage_pods ON public.pods;
CREATE POLICY dispatchers_manage_pods
ON public.pods
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader', 'trainer' ,'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['pod_leader', 'trainer' ,'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

COMMIT;

