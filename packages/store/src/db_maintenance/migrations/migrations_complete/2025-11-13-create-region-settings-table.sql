-- Migration: Create region_settings table for regional overrides
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.region_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_slug TEXT NOT NULL UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  operational_minimums JSONB,
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_region_settings_updated_at
  ON public.region_settings (updated_at DESC);

WITH default_minimums AS (
  SELECT jsonb_build_array(
    jsonb_build_object(
      'key', 'dispatch',
      'label', 'Dispatch & Coordination',
      'description', 'Certified dispatchers who can triage incidents, assign resources, and coordinate Meet-A-Need intakes around the clock.',
      'requiredCount', 3,
      'requiredCourses', jsonb_build_array('dispatcher-foundations', 'dispatcher-cert'),
      'staffingRange', jsonb_build_array(3, 5),
      'tags', jsonb_build_array('dispatch', 'coordination'),
      'emphasis', 'Need 3-5 cleared dispatchers to operate minimum coverage windows.'
    ),
    jsonb_build_object(
      'key', 'field',
      'label', 'Field Safety & On-The-Ground Teams',
      'description', 'Level 1 volunteers prepared for field deployments, basic bystander intervention, and mesh communications while on patrol.',
      'requiredCount', 10,
      'requiredCourses', jsonb_build_array('team-member-orientation', 'field-level-1'),
      'staffingRange', jsonb_build_array(10, 15),
      'tags', jsonb_build_array('field', 'safety'),
      'emphasis', 'Sustain at least 10 trained volunteers to rotate into field teams without burnout.'
    ),
    jsonb_build_object(
      'key', 'comms',
      'label', 'Communications & Technology',
      'description', 'Radio leads who can configure mesh hardware, maintain power, and run briefings for deployments.',
      'requiredCount', 2,
      'requiredCourses', jsonb_build_array('radio-comms-101', 'mesh-network-hardware-power', 'teleprompter-briefing-basics'),
      'staffingRange', jsonb_build_array(2, 3),
      'tags', jsonb_build_array('comms', 'technology'),
      'emphasis', 'At least two comms leads keep radios, mesh, and daily briefings online.'
    ),
    jsonb_build_object(
      'key', 'admin',
      'label', 'Trust & Regional Governance',
      'description', 'Admins who can maintain trust signatures, validate roster entries, and manage signer rotations.',
      'requiredCount', 1,
      'requiredCourses', jsonb_build_array('admin-trust-management', 'roster-entry-verification', 'signing-rot-basics'),
      'staffingRange', jsonb_build_array(1, 2),
      'tags', jsonb_build_array('trust', 'governance'),
      'emphasis', 'Keep at least one trusted admin active to manage signatures and onboarding.'
    ),
    jsonb_build_object(
      'key', 'pod',
      'label', 'Local Ops & Pod Management',
      'description', 'Pod leads who can stand up pods, run shifts, and facilitate after-action reviews for learning feedback loops.',
      'requiredCount', 3,
      'requiredCourses', jsonb_build_array('pod-creation', 'shift-lead-training', 'after-action-review'),
      'staffingRange', jsonb_build_array(3, 4),
      'tags', jsonb_build_array('leadership', 'pods'),
      'emphasis', 'Ensure three trained pod leads to cover weekly rotations and relief coverage.'
    ),
    jsonb_build_object(
      'key', 'engagement',
      'label', 'Community Engagement',
      'description', 'Outreach volunteers ready to run CDC deployments, coordinated foot patrols, and Meet-A-Need responses.',
      'requiredCount', 4,
      'requiredCourses', jsonb_build_array('cdc-operations', 'foot-patrol-protocols', 'meet-a-need-coordination'),
      'staffingRange', jsonb_build_array(4, 6),
      'tags', jsonb_build_array('community', 'outreach'),
      'emphasis', 'Keep 4-6 outreach volunteers ready so community requests never stall.'
    )
  ) AS payload
)
INSERT INTO public.region_settings (region_slug, settings, operational_minimums)
SELECT
  'default',
  jsonb_build_object(
    'academy',
    jsonb_build_object(
      'operational_minimums', payload
    )
  ),
  payload
FROM default_minimums
ON CONFLICT (region_slug) DO NOTHING;

--pnw
-- wap
-- norcal
-- socal