-- Migration: Expand meet_a_need.visibility to support role-based thresholds
-- Date: 2025-11-02
-- Safe to run multiple times.

DO $$ BEGIN
  -- Drop existing check if present
  BEGIN
    ALTER TABLE public.meet_a_need DROP CONSTRAINT IF EXISTS meet_a_need_visibility_check;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;

  -- Add new check: allow legacy values and explicit role-prefixed values
  ALTER TABLE public.meet_a_need
  ADD CONSTRAINT meet_a_need_visibility_check CHECK (
    visibility IS NULL OR visibility IN ('public','region','pod',
      'role:team_member','role:pod_leader','role:trainer',
      'role:dispatcher_basic','role:dispatcher_verified','role:dispatcher_admin',
      'role:admin','role:regional_admin','role:national_admin'
    )
  );
END $$;

-- Optional backfill: convert legacy 'region' default to role-based team_member for consistency
ALTER TABLE public.meet_a_need
  ALTER COLUMN visibility SET DEFAULT 'role:team_member';

