-- Migration: 20250110_add_otg_general_roles.sql
-- Purpose: Ensure all profiles include otg_general_support and otg_support in field_roles.
-- Notes: Idempotent; preserves existing roles and avoids duplicates.

UPDATE public.profiles
SET field_roles = (
  SELECT jsonb_agg(DISTINCT role ORDER BY role)
  FROM (
    SELECT jsonb_array_elements_text(COALESCE(public.profiles.field_roles, '[]'::jsonb)) AS role
    UNION ALL SELECT 'otg_general_support'
    UNION ALL SELECT 'otg_support'
  ) roles
),
updated_at = now()
WHERE field_roles IS NULL
  OR NOT (field_roles ? 'otg_general_support' AND field_roles ? 'otg_support');
