-- Migration: Add date_of_event to dispatch_submissions
-- Date: 2025-11-05
-- Safe to run multiple times

DO $$ BEGIN
  -- Check if column exists
  PERFORM 1 FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'dispatch_submissions'
    AND column_name = 'date_of_event';
  IF NOT FOUND THEN
    ALTER TABLE public.dispatch_submissions
    ADD COLUMN date_of_event TIMESTAMPTZ;
  END IF;
END $$;

-- Optional: backfill existing rows with timestamp to preserve semantics
-- Uncomment if you want existing events to reflect their submission time by default
UPDATE public.dispatch_submissions
SET date_of_event = COALESCE(date_of_event, timestamp)
WHERE date_of_event IS NULL;
