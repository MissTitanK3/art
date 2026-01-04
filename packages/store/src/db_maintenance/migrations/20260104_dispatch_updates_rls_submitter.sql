-- Migration: 20260104_dispatch_updates_rls_submitter.sql
-- Purpose: Allow dispatch submitters and JWT role-based dispatchers to manage dispatch_updates.
-- Notes: Keeps existing dispatcher access while adding submitter and JWT role checks.

DROP POLICY IF EXISTS "dispatchers_manage_dispatch_updates" ON public.dispatch_updates;
CREATE POLICY "dispatchers_manage_dispatch_updates"
ON public.dispatch_updates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
  OR COALESCE(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->>'role'
  ) = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  OR EXISTS (
    SELECT 1
    FROM public.dispatch_submissions d
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE d.id = dispatch_updates.dispatch_id
      AND d.submitted_by = p.id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
  OR COALESCE(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->>'role'
  ) = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  OR EXISTS (
    SELECT 1
    FROM public.dispatch_submissions d
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE d.id = dispatch_updates.dispatch_id
      AND d.submitted_by = p.id
  )
);
