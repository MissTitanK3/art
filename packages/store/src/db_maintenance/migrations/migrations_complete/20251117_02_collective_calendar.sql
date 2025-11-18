-- Migration: Collective calendar foundations (orgs + pod shift metadata)
-- Purpose:
--   - Introduce organizations and org memberships for pods/users
--   - Expand pod_shifts with visibility, needed headcount, and rough route metadata
--   - Add pod_shift_signups for crew requests

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Organization ↔ Pod membership (many-to-many)
CREATE TABLE IF NOT EXISTS public.organization_pods (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pod_id TEXT NOT NULL REFERENCES public.pods(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (org_id, pod_id)
);

-- Organization roles (user-level permissions)
CREATE TABLE IF NOT EXISTS public.organization_roles (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- owner | admin | editor | viewer
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful indexes for lookups
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

-- Pod shifts: shadow/visibility, crew needs, route metadata
ALTER TABLE public.pod_shifts
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS needed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS route JSONB;

-- Enforce visibility enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pod_shifts_visibility_check'
      AND conrelid = 'public.pod_shifts'::regclass
  ) THEN
    ALTER TABLE public.pod_shifts
    ADD CONSTRAINT pod_shifts_visibility_check
    CHECK (visibility IN ('public', 'org', 'private'));
  END IF;
END $$;

-- Crew signups per shift
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
    WHERE conname = 'pod_shift_signups_unique_shift_user'
      AND conrelid = 'public.pod_shift_signups'::regclass
  ) THEN
    ALTER TABLE public.pod_shift_signups
    ADD CONSTRAINT pod_shift_signups_unique_shift_user UNIQUE (shift_id, user_id);
  END IF;
END $$;
