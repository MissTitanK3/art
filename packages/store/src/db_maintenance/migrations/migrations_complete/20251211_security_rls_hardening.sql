-- 20251211_security_rls_hardening.sql
-- Harden RLS coverage and remove insecure claim fallbacks.

-- Enable RLS on tables that already have policies defined
ALTER TABLE IF EXISTS public.trust_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organization_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organization_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organization_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.volunteer_attributions ENABLE ROW LEVEL SECURITY;
-- Spatial reference catalog: only change if current role owns the table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'spatial_ref_sys'
      AND tableowner = current_user
  ) THEN
    EXECUTE ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    EXECUTE DROP POLICY IF EXISTS spatial_ref_sys_read_authenticated ON public.spatial_ref_sys;
    EXECUTE CREATE POLICY spatial_ref_sys_read_authenticated ON public.spatial_ref_sys FOR SELECT TO authenticated USING (TRUE);
  ELSE
    RAISE NOTICE 'Skipping spatial_ref_sys RLS changes because current user is not table owner';
  END IF;
END$$;

-- Organization polls: enforce membership/dispatcher roles
DROP POLICY IF EXISTS organization_polls_select_members ON public.organization_polls;
CREATE POLICY organization_polls_select_members
ON public.organization_polls
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organization_polls.org_id
      AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
      )
  )
);

DROP POLICY IF EXISTS organization_polls_manage ON public.organization_polls;
CREATE POLICY organization_polls_manage
ON public.organization_polls
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organization_polls.org_id
      AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND r.role = ANY (ARRAY['owner','admin','editor'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
      )
  )
);

DROP POLICY IF EXISTS organization_polls_manage_update ON public.organization_polls;
CREATE POLICY organization_polls_manage_update
ON public.organization_polls
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organization_polls.org_id
      AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND r.role = ANY (ARRAY['owner','admin','editor'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organization_polls.org_id
      AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND r.role = ANY (ARRAY['owner','admin','editor'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
      )
  )
);

DROP POLICY IF EXISTS organization_polls_manage_delete ON public.organization_polls;
CREATE POLICY organization_polls_manage_delete
ON public.organization_polls
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organization_polls.org_id
      AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      AND r.role = ANY (ARRAY['owner','admin'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
      )
  )
);

-- Organization poll options
DROP POLICY IF EXISTS organization_poll_options_select_members ON public.organization_poll_options;
CREATE POLICY organization_poll_options_select_members
ON public.organization_poll_options
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_polls op
    WHERE op.id = public.organization_poll_options.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM public.organization_roles r
          WHERE r.org_id = op.org_id
            AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.access_role = ANY (
              ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
            )
        )
      )
  )
);

DROP POLICY IF EXISTS organization_poll_options_manage ON public.organization_poll_options;
CREATE POLICY organization_poll_options_manage
ON public.organization_poll_options
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_polls op
    WHERE op.id = public.organization_poll_options.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM public.organization_roles r
          WHERE r.org_id = op.org_id
            AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            AND r.role = ANY (ARRAY['owner','admin','editor'])
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.access_role = ANY (
              ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
            )
        )
      )
  )
);

DROP POLICY IF EXISTS organization_poll_options_manage_update ON public.organization_poll_options;
CREATE POLICY organization_poll_options_manage_update
ON public.organization_poll_options
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_polls op
    WHERE op.id = public.organization_poll_options.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM public.organization_roles r
          WHERE r.org_id = op.org_id
            AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            AND r.role = ANY (ARRAY['owner','admin','editor'])
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.access_role = ANY (
              ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
            )
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_polls op
    WHERE op.id = public.organization_poll_options.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM public.organization_roles r
          WHERE r.org_id = op.org_id
            AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            AND r.role = ANY (ARRAY['owner','admin','editor'])
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.access_role = ANY (
              ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
            )
        )
      )
  )
);

DROP POLICY IF EXISTS organization_poll_options_manage_delete ON public.organization_poll_options;
CREATE POLICY organization_poll_options_manage_delete
ON public.organization_poll_options
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_polls op
    WHERE op.id = public.organization_poll_options.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM public.organization_roles r
          WHERE r.org_id = op.org_id
            AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
            AND r.role = ANY (ARRAY['owner','admin'])
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.access_role = ANY (
              ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
            )
        )
      )
  )
);

-- Organization poll votes
DROP POLICY IF EXISTS organization_poll_votes_select_members ON public.organization_poll_votes;
CREATE POLICY organization_poll_votes_select_members
ON public.organization_poll_votes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_polls op
    WHERE op.id = public.organization_poll_votes.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM public.organization_roles r
          WHERE r.org_id = op.org_id
            AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.access_role = ANY (
              ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
            )
        )
      )
  )
);

DROP POLICY IF EXISTS organization_poll_votes_insert_members ON public.organization_poll_votes;
CREATE POLICY organization_poll_votes_insert_members
ON public.organization_poll_votes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_polls op
    WHERE op.id = public.organization_poll_votes.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM public.organization_roles r
          WHERE r.org_id = op.org_id
            AND r.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.user_id = auth.uid()
            AND p.access_role = ANY (
              ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
            )
        )
      )
  )
  AND (
    public.organization_poll_votes.profile_id IS NULL
    OR public.organization_poll_votes.profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

DROP POLICY IF EXISTS organization_poll_votes_block_updates ON public.organization_poll_votes;
CREATE POLICY organization_poll_votes_block_updates
ON public.organization_poll_votes
FOR UPDATE
TO authenticated
USING (FALSE);

DROP POLICY IF EXISTS organization_poll_votes_block_deletes ON public.organization_poll_votes;
CREATE POLICY organization_poll_votes_block_deletes
ON public.organization_poll_votes
FOR DELETE
TO authenticated
USING (FALSE);

-- Remove user_metadata fallback from dispatch/impact policies
DROP POLICY IF EXISTS "dispatchers_manage_dispatches_select" ON dispatch_submissions;
CREATE POLICY "dispatchers_manage_dispatches_select"
ON dispatch_submissions
FOR SELECT
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
);

DROP POLICY IF EXISTS "dispatchers_manage_dispatches_insert" ON dispatch_submissions;
CREATE POLICY "dispatchers_manage_dispatches_insert"
ON dispatch_submissions
FOR INSERT
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
);

DROP POLICY IF EXISTS "dispatchers_manage_dispatches_update" ON dispatch_submissions;
CREATE POLICY "dispatchers_manage_dispatches_update"
ON dispatch_submissions
FOR UPDATE
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
);

DROP POLICY IF EXISTS volunteer_attributions_dispatchers_select ON volunteer_attributions;
CREATE POLICY volunteer_attributions_dispatchers_select
ON volunteer_attributions
FOR SELECT
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
);

DROP POLICY IF EXISTS volunteer_attributions_dispatchers_insert ON volunteer_attributions;
CREATE POLICY volunteer_attributions_dispatchers_insert
ON volunteer_attributions
FOR INSERT
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
);

DROP POLICY IF EXISTS volunteer_attributions_dispatchers_update ON volunteer_attributions;
CREATE POLICY volunteer_attributions_dispatchers_update
ON volunteer_attributions
FOR UPDATE
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
);

-- Mark reporting and notification views as SECURITY INVOKER
CREATE OR REPLACE VIEW public.view_total_people_served_last_30d
WITH (security_invoker = true) AS
SELECT
  COALESCE(SUM(GREATEST(COALESCE(ds.people_served, 0), 0)), 0)::BIGINT AS total_people_served
FROM public.dispatch_submissions ds
WHERE ds.status = 'verified_complete'
  AND ds.timestamp >= now() - INTERVAL '30 days';

CREATE OR REPLACE VIEW public.view_total_volunteer_hours_last_30d
WITH (security_invoker = true) AS
SELECT
  COALESCE(ROUND(COALESCE(SUM(va.minutes), 0) / 60.0, 1), 0)::NUMERIC(10,1) AS total_hours
FROM public.volunteer_attributions va
JOIN public.dispatch_submissions ds ON ds.id = va.dispatch_id
WHERE va.status = 'active'
  AND ds.status = 'verified_complete'
  AND va.attributed_at >= now() - INTERVAL '30 days';

CREATE OR REPLACE VIEW public.view_median_response_time_last_30d
WITH (security_invoker = true) AS
SELECT median_minutes FROM public.mv_median_response_time_last_30d;

CREATE OR REPLACE VIEW public.user_notifications
WITH (security_invoker = true) AS
SELECT
  nr.user_id,
  n.id AS notification_id,
  n.channel,
  n.title,
  n.body,
  n.level,
  n.link,
  n.sticky,
  n.meta,
  n.created_at,
  n.expires_at,
  nr.read_at,
  nr.dismissed_at
FROM public.notification_recipients nr
JOIN public.notifications n ON n.id = nr.notification_id;
