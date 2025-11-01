-- Migration: Scope com_teams to a specific dispatch via event_id
-- Date: 2025-11-01
-- Safe to run multiple times.

-- 1) Ensure column event_id exists on com_teams
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'com_teams' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE public.com_teams
      ADD COLUMN event_id TEXT REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2) Helpful index for filtering by event
CREATE INDEX IF NOT EXISTS idx_com_teams_event ON public.com_teams(event_id);

-- 3) (Optional) Backfill strategy placeholder
-- If you want to associate existing teams to a specific dispatch, uncomment and set the ID:
-- UPDATE public.com_teams SET event_id = '<dispatch-id>' WHERE event_id IS NULL;

-- Note: UI now filters teams by event_id. Records with NULL event_id will not appear.

