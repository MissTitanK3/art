-- Migration: Backfill pods.created_by using earliest lead roster entry
-- Date: 2025-11-06
-- Safe to re-run

BEGIN;

-- For pods with NULL created_by, set it to the profile_id of the earliest lead
-- If joined_at is NULL, fall back to the lowest id ordering as a tiebreaker
WITH earliest_leads AS (
  SELECT
    r.pod_id,
    r.profile_id,
    ROW_NUMBER() OVER (
      PARTITION BY r.pod_id
      ORDER BY r.joined_at NULLS LAST, r.id ASC
    ) AS rn
  FROM public.roster_entries r
  WHERE r.role = 'lead'
)
UPDATE public.pods p
SET created_by = e.profile_id
FROM earliest_leads e
WHERE p.created_by IS NULL
  AND p.id = e.pod_id
  AND e.rn = 1;

COMMIT;

-- pnw
-- norcal
-- socal
-- wap