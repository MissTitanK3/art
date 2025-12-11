-- Migration: 007_impact_system.sql
-- Purpose: Introduce volunteer impact tracking tables, impact metrics columns,
--          and summary views for reporting.

CREATE TABLE IF NOT EXISTS public.volunteer_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id TEXT NOT NULL REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  minutes INT NOT NULL CHECK (minutes > 0),
  attributed_by UUID NOT NULL REFERENCES auth.users(id),
  attributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  activity_type TEXT NOT NULL DEFAULT 'ops',
  notes TEXT,
  anomaly_flag BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','reverted'))
);

CREATE INDEX IF NOT EXISTS idx_va_dispatch_profile
  ON public.volunteer_attributions(dispatch_id, profile_id);

CREATE INDEX IF NOT EXISTS idx_va_attributed_at
  ON public.volunteer_attributions(attributed_at DESC);

-- Impact metrics on dispatch submissions
ALTER TABLE public.dispatch_submissions
  ADD COLUMN IF NOT EXISTS people_served INT DEFAULT 0 CHECK (people_served >= 0),
  ADD COLUMN IF NOT EXISTS resources_distributed INT DEFAULT 0 CHECK (resources_distributed >= 0),
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS updated_by UUID NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dispatch_risk_level_check'
      AND conrelid = 'public.dispatch_submissions'::regclass
  ) THEN
    ALTER TABLE public.dispatch_submissions
      ADD CONSTRAINT dispatch_risk_level_check CHECK (
        risk_level IS NULL OR risk_level IN ('unknown','low','medium','high','critical')
      );
  END IF;
END $$;

-- Ensure new risk-level options include verified_complete dispatch milestone
ALTER TABLE public.dispatch_submissions
  DROP CONSTRAINT IF EXISTS dispatch_status_check;

ALTER TABLE public.dispatch_submissions
  ADD CONSTRAINT dispatch_status_check CHECK (
    status IS NULL OR status IN (
      'preplanning','unconfirmed','confirmed','mobilizing','in_progress',
      'debriefing','completed','verified_complete','cancelled','expired','archived'
    )
  );

-- Views supporting dashboards (30-day windows, verified_complete dispatches only)
CREATE OR REPLACE VIEW public.view_total_people_served_last_30d AS
SELECT
  COALESCE(SUM(GREATEST(COALESCE(ds.people_served, 0), 0)), 0)::BIGINT AS total_people_served
FROM public.dispatch_submissions ds
WHERE ds.status = 'verified_complete'
  AND ds.timestamp >= now() - INTERVAL '30 days';

CREATE OR REPLACE VIEW public.view_total_volunteer_hours_last_30d AS
SELECT
  COALESCE(ROUND(COALESCE(SUM(va.minutes), 0) / 60.0, 1), 0)::NUMERIC(10,1) AS total_hours
FROM public.volunteer_attributions va
JOIN public.dispatch_submissions ds ON ds.id = va.dispatch_id
WHERE va.status = 'active'
  AND ds.status = 'verified_complete'
  AND va.attributed_at >= now() - INTERVAL '30 days';

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_median_response_time_last_30d AS
SELECT
  COALESCE(
    percentile_cont(0.5) WITHIN GROUP (ORDER BY response_minutes),
    0
  ) AS median_minutes
FROM (
  SELECT
    GREATEST(EXTRACT(EPOCH FROM (MIN(va.attributed_at) - ds.timestamp)) / 60.0, 0) AS response_minutes
  FROM public.dispatch_submissions ds
  JOIN public.volunteer_attributions va
    ON va.dispatch_id = ds.id
   AND va.status = 'active'
  WHERE ds.status = 'verified_complete'
    AND ds.timestamp >= now() - INTERVAL '30 days'
  GROUP BY ds.id
) sub
WITH NO DATA;

REFRESH MATERIALIZED VIEW public.mv_median_response_time_last_30d;

CREATE OR REPLACE VIEW public.view_median_response_time_last_30d AS
SELECT median_minutes FROM public.mv_median_response_time_last_30d;
