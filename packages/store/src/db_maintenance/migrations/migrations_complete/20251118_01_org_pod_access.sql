-- Migration: 20251118_01_org_pod_access.sql
-- Purpose: Ensure organization CRUD tables + pod shift signup infrastructure exist in production
-- Notes:
--   - Adds organizations, organization_pods, organization_roles, and pod_shift_signups tables
--   - Backfills helper indexes/constraints for PostgREST relationship discovery
--   - Enables RLS + policies mirroring the canonical init scripts so apps can access data safely

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Organizations core tables --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_pods (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pod_id TEXT NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (org_id, pod_id)
);

CREATE TABLE IF NOT EXISTS public.organization_roles (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.organization_roles'::regclass
      AND conname = 'organization_roles_unique_member'
  ) THEN
    ALTER TABLE public.organization_roles
    ADD CONSTRAINT organization_roles_unique_member UNIQUE (org_id, user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_organization_roles_org_id'
  ) THEN
    CREATE INDEX idx_organization_roles_org_id ON public.organization_roles (org_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_organization_roles_user_id'
  ) THEN
    CREATE INDEX idx_organization_roles_user_id ON public.organization_roles (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_organization_pods_org_id'
  ) THEN
    CREATE INDEX idx_organization_pods_org_id ON public.organization_pods (org_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_organization_pods_pod_id'
  ) THEN
    CREATE INDEX idx_organization_pods_pod_id ON public.organization_pods (pod_id);
  END IF;
END $$;

-- Pod shift metadata --------------------------------------------------------
ALTER TABLE public.pod_shifts
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS needed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS route JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.pod_shifts'::regclass
      AND conname = 'pod_shifts_visibility_check'
  ) THEN
    ALTER TABLE public.pod_shifts
    ADD CONSTRAINT pod_shifts_visibility_check
    CHECK (visibility IN ('public','org','private'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.pod_shift_signups (
  id TEXT PRIMARY KEY,
  shift_id TEXT NOT NULL REFERENCES public.pod_shifts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.pod_shift_signups'::regclass
      AND conname = 'pod_shift_signups_unique_shift_user'
  ) THEN
    ALTER TABLE public.pod_shift_signups
    ADD CONSTRAINT pod_shift_signups_unique_shift_user UNIQUE (shift_id, user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_pod_shift_signups_shift_id'
  ) THEN
    CREATE INDEX idx_pod_shift_signups_shift_id ON public.pod_shift_signups (shift_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_pod_shift_signups_user_id'
  ) THEN
    CREATE INDEX idx_pod_shift_signups_user_id ON public.pod_shift_signups (user_id);
  END IF;
END $$;

-- RLS enablement + policies -------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_shift_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orgs_select_members ON public.organizations;
CREATE POLICY orgs_select_members
ON public.organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = organizations.id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.organization_pods op
    JOIN public.roster_entries re ON re.pod_id = op.pod_id
    WHERE op.org_id = organizations.id
      AND re.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS org_roles_select_self ON public.organization_roles;
CREATE POLICY org_roles_select_self
ON public.organization_roles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS org_pods_select_members ON public.organization_pods;
CREATE POLICY org_pods_select_members
ON public.organization_pods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = organization_pods.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = organization_pods.org_id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS pod_shift_signups_select_members ON public.pod_shift_signups;
CREATE POLICY pod_shift_signups_select_members
ON public.pod_shift_signups
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM public.pod_shifts ps
    JOIN public.roster_entries r ON r.pod_id = ps.pod_id
    WHERE ps.id = pod_shift_signups.shift_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS pod_shift_signups_insert_self ON public.pod_shift_signups;
CREATE POLICY pod_shift_signups_insert_self
ON public.pod_shift_signups
FOR INSERT
TO authenticated
WITH CHECK (
  pod_shift_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
  )
  AND EXISTS (
    SELECT 1 FROM public.pod_shifts ps
    JOIN public.roster_entries r ON r.pod_id = ps.pod_id
    WHERE ps.id = pod_shift_signups.shift_id
      AND r.profile_id = pod_shift_signups.user_id
  )
);

DROP POLICY IF EXISTS pod_shift_signups_delete_self ON public.pod_shift_signups;
CREATE POLICY pod_shift_signups_delete_self
ON public.pod_shift_signups
FOR DELETE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
