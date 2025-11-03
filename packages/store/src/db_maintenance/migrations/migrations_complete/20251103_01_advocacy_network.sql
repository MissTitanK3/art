-- Migration: Regional Advocacy Network tables
-- Date: 2025-11-03
-- Safe to run multiple times.

-- Ensure gen_random_uuid() is available for UUID defaults
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trusted organizations that receive finalized missing-person reports
CREATE TABLE IF NOT EXISTS public.advocacy_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  -- e.g., 'legal_aid','civil_rights','immigrant_justice','media_advocacy','public_defender','other'
  type TEXT,
  jurisdiction TEXT,
  contact_emails TEXT[],
  contact_signal TEXT,
  -- preferred delivery: 'pdf', 'web', 'feed'
  preferred_format TEXT,
  active_status BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Delivery logs for auditing per-case notifications to advocacy groups
CREATE TABLE IF NOT EXISTS public.advocacy_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.advocacy_groups(id) ON DELETE SET NULL,
  case_id TEXT REFERENCES public.missing_person_records(case_id) ON DELETE CASCADE,
  format TEXT,
  status TEXT,
  details JSONB,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_advocacy_groups_active ON public.advocacy_groups (active_status);
CREATE INDEX IF NOT EXISTS idx_advocacy_delivery_logs_case_id ON public.advocacy_delivery_logs (case_id);

-- Enable RLS and add admin policies (region admins only)
ALTER TABLE public.advocacy_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advocacy_delivery_logs ENABLE ROW LEVEL SECURITY;

-- Only region admins can manage groups
DROP POLICY IF EXISTS adv_groups_admin_manage ON public.advocacy_groups;
CREATE POLICY adv_groups_admin_manage
ON public.advocacy_groups
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
);

-- Only region admins can read/manage delivery logs
DROP POLICY IF EXISTS adv_delivery_admin_manage ON public.advocacy_delivery_logs;
CREATE POLICY adv_delivery_admin_manage
ON public.advocacy_delivery_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['admin','regional_admin','national_admin'])
  )
);

-- Allow dispatchers (and admins) to view groups
DROP POLICY IF EXISTS adv_groups_dispatcher_select ON public.advocacy_groups;
CREATE POLICY adv_groups_dispatcher_select
ON public.advocacy_groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Allow dispatchers (and admins) to view delivery logs
DROP POLICY IF EXISTS adv_delivery_dispatcher_select ON public.advocacy_delivery_logs;
CREATE POLICY adv_delivery_dispatcher_select
ON public.advocacy_delivery_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
