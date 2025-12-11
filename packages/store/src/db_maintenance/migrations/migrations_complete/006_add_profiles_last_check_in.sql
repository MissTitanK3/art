-- Migration: 006_add_profiles_last_check_in.sql
-- Purpose: Track explicit profile check-ins separately from generic updates.
-- Notes: Adds an idempotent TIMESTAMPTZ column; aligns with UI change to show the true last check-in.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'last_profile_check_in'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_profile_check_in TIMESTAMPTZ;
  END IF;
END $$;
