-- Migration: add external ids + sync metadata for wizard reports
-- Safe to re-run

ALTER TABLE public.wizard
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS external_source text,
  ADD COLUMN IF NOT EXISTS synced_at timestamp with time zone DEFAULT timezone('utc'::text, now());

CREATE UNIQUE INDEX IF NOT EXISTS idx_wizard_external_id
  ON public.wizard (external_id)
  WHERE external_id IS NOT NULL;

-- Backfill any missing synced_at values to existing timestamps for consistency
UPDATE public.wizard
SET synced_at = COALESCE(synced_at, timestamp)
WHERE synced_at IS NULL;
