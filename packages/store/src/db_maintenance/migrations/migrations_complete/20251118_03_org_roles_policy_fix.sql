BEGIN;

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
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_roles_owner_unique
  ON public.organization_roles (org_id)
  WHERE role = 'owner';

ALTER TABLE public.organization_roles
  ALTER COLUMN id SET DEFAULT (gen_random_uuid())::text;

COMMIT;
