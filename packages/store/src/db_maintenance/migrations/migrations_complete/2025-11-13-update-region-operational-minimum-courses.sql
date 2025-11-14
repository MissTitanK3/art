-- Migration: Align region operational minimums with updated academy catalog
WITH updated AS (
  SELECT
    rs.id,
    jsonb_agg(
      CASE value->>'key'
        WHEN 'dispatch' THEN value || jsonb_build_object('requiredCourses', jsonb_build_array('responding-to-dispatch-calls', 'trust-and-ethics-in-dispatch'))
        WHEN 'field' THEN value || jsonb_build_object('requiredCourses', jsonb_build_array('field-role-training-hub', 'field-safety'))
        WHEN 'comms' THEN value || jsonb_build_object('requiredCourses', jsonb_build_array('radio-communications', 'mesh-networks-hardware-guide', 'digital-resilience-contingency-comms'))
        WHEN 'admin' THEN value || jsonb_build_object('requiredCourses', jsonb_build_array('admin-tools', 'trust-networks-signature-management', 'regional-data-stewardship'))
        WHEN 'pod' THEN value || jsonb_build_object('requiredCourses', jsonb_build_array('create-a-pod', 'training-the-trainers', 'after-action-data-hygiene'))
        WHEN 'engagement' THEN value || jsonb_build_object('requiredCourses', jsonb_build_array('outreach-messaging-community-trust', 'community-defense-center', 'community-intelligence-situational-reporting'))
        ELSE value
      END
      ORDER BY ord
    ) AS new_minimums
  FROM public.region_settings rs
  CROSS JOIN LATERAL jsonb_array_elements(rs.operational_minimums) WITH ORDINALITY AS arr(value, ord)
  GROUP BY rs.id
)
UPDATE public.region_settings AS rs
SET
  operational_minimums = updated.new_minimums,
  settings = jsonb_set(
    COALESCE(rs.settings, '{}'::jsonb),
    '{academy,operational_minimums}',
    updated.new_minimums,
    true
  ),
  updated_at = now()
FROM updated
WHERE rs.id = updated.id
  AND rs.operational_minimums IS DISTINCT FROM updated.new_minimums;

--pnw
-- wap
-- norcal
-- socal