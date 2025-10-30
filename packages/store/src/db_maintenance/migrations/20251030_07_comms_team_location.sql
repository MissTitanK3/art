-- Adds team location fields for placemarks (label + GPS)
-- Safe to re-run

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'com_teams'
      AND column_name = 'location_label'
  ) THEN
    ALTER TABLE public.com_teams ADD COLUMN location_label TEXT;
  END IF;
  -- latitude/longitude explicitly not added per product decision
END $$;
