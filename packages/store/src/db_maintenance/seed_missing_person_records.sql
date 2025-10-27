-- Minimal seed data for missing_person_records
-- Note: RLS policies allow full access for users with access_role in
-- ('dispatcher_verified','dispatcher_admin'). Other users only see
-- records where created_by = auth.uid(). These seed rows set created_by
-- to NULL so they are visible to dispatcher roles only.

INSERT INTO public.missing_person_records (
  case_id,
  detention_datetime,
  detention_location,
  arresting_agency,
  full_name,
  date_of_birth,
  last_known_city,
  urgent_needs,
  information_sources,
  last_updated,
  created_by,
  version
) VALUES
  (
    'CASE-PNW-0001',
    now() - interval '2 days',
    'Downtown PNW',
    'City PD',
    'Alex Doe',
    '1988-04-05',
    'Portland',
    ARRAY['medical','attorney']::text[],
    '{"caller":"family","notes":"Initial report via hotline"}'::jsonb,
    now() - interval '1 day',
    NULL,
    1
  ),
  (
    'CASE-PNW-0002',
    now() - interval '1 day',
    'Central Station',
    'Transit Authority',
    'Jamie Smith',
    '1992-10-12',
    'Seattle',
    ARRAY['transport','translator']::text[],
    '{"caller":"witness","notes":"Seen transferred to county"}'::jsonb,
    now() - interval '12 hours',
    NULL,
    1
  )
ON CONFLICT (case_id) DO UPDATE SET
  last_updated = EXCLUDED.last_updated,
  full_name = EXCLUDED.full_name,
  detention_location = EXCLUDED.detention_location,
  arresting_agency = EXCLUDED.arresting_agency,
  last_known_city = EXCLUDED.last_known_city,
  urgent_needs = EXCLUDED.urgent_needs,
  information_sources = EXCLUDED.information_sources,
  version = COALESCE(public.missing_person_records.version, 0) + 1;

