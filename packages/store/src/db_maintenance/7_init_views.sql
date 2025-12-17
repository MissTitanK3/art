-- Views and materialized views
-- Run after base schema is created

-- Impact reporting views/materialized views
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
