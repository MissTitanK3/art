-- Migration: Add created_by to pods to track creator
-- Date: 2025-11-06
-- Safe to re-run

BEGIN;

ALTER TABLE public.pods
  ADD COLUMN IF NOT EXISTS created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Helpful index for creator lookups
CREATE INDEX IF NOT EXISTS idx_pods_created_by ON public.pods (created_by);

COMMIT;

-- pnw
-- norcal
-- socal
-- wap