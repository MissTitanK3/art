-- Migration: remove ICE presence hints from legacy Iceout imports
-- Safe to re-run; only touches matching rows.

UPDATE public.wizard
SET agency_other = NULL
WHERE external_source = 'iceout';
