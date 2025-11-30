-- Allow dispatcher/admin roles coming from JWT claims (demo or service tokens)
-- to create/manage dispatch submissions even when a profile row is missing.
DO $$
DECLARE
  claim_expr text := 'COALESCE(
    current_setting(''request.jwt.claims'', true)::json->>''role'',
    current_setting(''request.jwt.claims'', true)::json->''app_metadata''->>''role'',
    current_setting(''request.jwt.claims'', true)::json->''user_metadata''->>''role''
  )';
BEGIN
  -- Recreate dispatch policies with expanded role check (inline claim expression so it works inside policy)
  DROP POLICY IF EXISTS "dispatchers_manage_dispatches_select" ON public.dispatch_submissions;
  DROP POLICY IF EXISTS "dispatchers_manage_dispatches_insert" ON public.dispatch_submissions;
  DROP POLICY IF EXISTS "dispatchers_manage_dispatches_update" ON public.dispatch_submissions;

  EXECUTE format($f$
    CREATE POLICY "dispatchers_manage_dispatches_select"
    ON public.dispatch_submissions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
      )
      OR %1$s = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
    );
  $f$, claim_expr);

  EXECUTE format($f$
    CREATE POLICY "dispatchers_manage_dispatches_insert"
    ON public.dispatch_submissions
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
      )
      OR %1$s = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
    );
  $f$, claim_expr);

  EXECUTE format($f$
    CREATE POLICY "dispatchers_manage_dispatches_update"
    ON public.dispatch_submissions
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
      )
      OR %1$s = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
      )
      OR %1$s = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
    );
  $f$, claim_expr);
END $$;
