-- Migration: 20251118_02_org_rls_crud.sql
-- Purpose: Allow authenticated pod leaders/dispatch/admin roles to create/manage organizations
-- Notes: Mirrors the policy changes in init_rls.sql for existing deployments

DROP POLICY IF EXISTS orgs_insert_elevated ON public.organizations;
CREATE POLICY orgs_insert_elevated
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (
        ARRAY[
          'pod_leader','trainer',
          'dispatcher_basic','dispatcher_verified','dispatcher_admin',
          'admin','regional_admin','national_admin'
        ]
      )
  )
);

DROP POLICY IF EXISTS orgs_update_manage ON public.organizations;
CREATE POLICY orgs_update_manage
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organizations.id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
      AND r.role = ANY (ARRAY['owner','admin'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (
        ARRAY[
          'pod_leader','trainer',
          'dispatcher_basic','dispatcher_verified','dispatcher_admin',
          'admin','regional_admin','national_admin'
        ]
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organizations.id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
      AND r.role = ANY (ARRAY['owner','admin'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (
        ARRAY[
          'pod_leader','trainer',
          'dispatcher_basic','dispatcher_verified','dispatcher_admin',
          'admin','regional_admin','national_admin'
        ]
      )
  )
);

DROP POLICY IF EXISTS orgs_delete_manage ON public.organizations;
CREATE POLICY orgs_delete_manage
ON public.organizations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organizations.id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
      AND r.role = ANY (ARRAY['owner','admin'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (
        ARRAY[
          'pod_leader','trainer',
          'dispatcher_basic','dispatcher_verified','dispatcher_admin',
          'admin','regional_admin','national_admin'
        ]
      )
  )
);

DROP POLICY IF EXISTS org_roles_insert_owner ON public.organization_roles;
CREATE POLICY org_roles_insert_owner
ON public.organization_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.organization_roles.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
  )
  AND public.organization_roles.role = 'owner'
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_roles existing
    WHERE existing.org_id = public.organization_roles.org_id
  )
);
