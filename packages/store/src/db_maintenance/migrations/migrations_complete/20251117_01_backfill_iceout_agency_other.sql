-- Migration: backfill legacy Iceout imports with a marker so they match new enum-hint convention
-- Safe to re-run; only touches iceout rows where agency_other is null/empty

UPDATE public.wizard
SET agency_other = 'legacy-iceout-import: enum metadata not captured'
WHERE external_source = 'iceout'
  AND external_id ILIKE 'iceout-%'
  AND (agency_other IS NULL OR agency_other = '');
