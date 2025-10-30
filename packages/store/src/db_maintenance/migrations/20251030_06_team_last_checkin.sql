-- Adds team-level last_check_in column for check-in tracking
-- Safe to re-run

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'com_teams'
      AND column_name = 'last_check_in'
  ) THEN
    ALTER TABLE public.com_teams
      ADD COLUMN last_check_in TIMESTAMPTZ;
  END IF;
END $$;

-- Optional index to sort/filter by most recent check-in
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_teams_last_check_in'
  ) THEN
    CREATE INDEX idx_com_teams_last_check_in ON public.com_teams (last_check_in DESC);
  END IF;
END $$;

