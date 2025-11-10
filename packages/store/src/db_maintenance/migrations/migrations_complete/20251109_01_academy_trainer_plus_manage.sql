-- Migration: Allow Trainer+ roles to manage Academy classes and sessions
-- Date: 2025-11-09

-- Drop existing restrictive policies (if present) and replace with broader Trainer+ permissions
DROP POLICY IF EXISTS dispatchers_manage_academy ON public.academy_classes;
CREATE POLICY dispatchers_manage_academy
ON public.academy_classes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY[
        'trainer',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'admin',
        'regional_admin',
        'national_admin'
      ])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY[
        'trainer',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'admin',
        'regional_admin',
        'national_admin'
      ])
  )
);

-- Sessions: allow same Trainer+ set to manage academy_sessions
DROP POLICY IF EXISTS dispatchers_manage_academy_sessions ON public.academy_sessions;
CREATE POLICY dispatchers_manage_academy_sessions
ON public.academy_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY[
        'trainer',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'admin',
        'regional_admin',
        'national_admin'
      ])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY[
        'trainer',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'admin',
        'regional_admin',
        'national_admin'
      ])
  )
);

-- Also update insert/update RPC-friendly policies for sessions if they exist (idempotent drops/creates)
DROP POLICY IF EXISTS dispatchers_insert_academy_sessions ON public.academy_sessions;
CREATE POLICY dispatchers_insert_academy_sessions
ON public.academy_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY[
        'trainer',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'admin',
        'regional_admin',
        'national_admin'
      ])
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
      AND p.access_role = ANY (ARRAY[
        'trainer',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'admin',
        'regional_admin',
        'national_admin'
      ])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY[
        'trainer',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'admin',
        'regional_admin',
        'national_admin'
      ])
  )
);

-- Ensure public_view policies remain permissive for authenticated read access (no changes)
