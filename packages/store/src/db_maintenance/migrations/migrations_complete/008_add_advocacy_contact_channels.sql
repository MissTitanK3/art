-- Migration: 008_add_advocacy_contact_channels.sql
-- Purpose: Allow advocacy groups to store alternative contact methods like phones/faxes.
-- Notes: Adds TEXT[] columns with idempotent guards to avoid duplicate additions.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'advocacy_groups'
      AND column_name = 'contact_phones'
  ) THEN
    ALTER TABLE public.advocacy_groups
      ADD COLUMN contact_phones TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'advocacy_groups'
      AND column_name = 'contact_faxes'
  ) THEN
    ALTER TABLE public.advocacy_groups
      ADD COLUMN contact_faxes TEXT[];
  END IF;
END $$;
