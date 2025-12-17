-- Add RLS policies for calendar_signups
DROP POLICY IF EXISTS calendar_signups_select_members ON public.calendar_signups;
CREATE POLICY calendar_signups_select_members
ON public.calendar_signups
FOR SELECT
TO authenticated
USING (
  public.calendar_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS calendar_signups_insert_self ON public.calendar_signups;
CREATE POLICY calendar_signups_insert_self
ON public.calendar_signups
FOR INSERT
TO authenticated
WITH CHECK (
  public.calendar_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS calendar_signups_update_self ON public.calendar_signups;
CREATE POLICY calendar_signups_update_self
ON public.calendar_signups
FOR UPDATE
TO authenticated
USING (
  public.calendar_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  public.calendar_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS calendar_signups_delete_self ON public.calendar_signups;
CREATE POLICY calendar_signups_delete_self
ON public.calendar_signups
FOR DELETE
TO authenticated
USING (
  public.calendar_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Advocacy: admins/regional/national manage
DROP POLICY IF EXISTS adv_groups_admin_manage ON public.advocacy_groups;
CREATE POLICY adv_groups_admin_manage
ON public.advocacy_groups
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS adv_delivery_admin_manage ON public.advocacy_delivery_logs;
CREATE POLICY adv_delivery_admin_manage
ON public.advocacy_delivery_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
);

-- Comms: dispatchers manage
DROP POLICY IF EXISTS dispatchers_manage_com_teams ON public.com_teams;
CREATE POLICY dispatchers_manage_com_teams
ON public.com_teams
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS dispatchers_manage_com_operators ON public.com_operators;
CREATE POLICY dispatchers_manage_com_operators
ON public.com_operators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS dispatchers_manage_com_channels ON public.com_channels;
CREATE POLICY dispatchers_manage_com_channels
ON public.com_channels
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Organization membership helpers
DROP POLICY IF EXISTS org_roles_select_self ON public.organization_roles;
CREATE POLICY org_roles_select_self
ON public.organization_roles
FOR SELECT
TO authenticated
USING (
  public.organization_roles.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS org_roles_insert_owner ON public.organization_roles;
CREATE POLICY org_roles_insert_owner
ON public.organization_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.organization_roles.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.organization_roles.role = 'owner'
);

DROP POLICY IF EXISTS org_pods_select_members ON public.organization_pods;
CREATE POLICY org_pods_select_members
ON public.organization_pods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = public.organization_pods.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organization_pods.org_id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
