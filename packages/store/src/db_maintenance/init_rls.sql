-- Core
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_entries ENABLE ROW LEVEL SECURITY;

-- Core
ALTER TABLE dispatch_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_shifts ENABLE ROW LEVEL SECURITY;

ALTER TABLE academy_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_participants ENABLE ROW LEVEL SECURITY;

ALTER TABLE missing_person_records ENABLE ROW LEVEL SECURITY;

-- Trust
ALTER TABLE trust_signatures ENABLE ROW LEVEL SECURITY;

-- Everyone can view their own profile
CREATE POLICY "select_own_profile"
FOR SELECT
USING (user_id = auth.uid());
-- Users can update only their own profile
CREATE POLICY "update_own_profile"
ON profiles
FOR UPDATE
USING (user_id = auth.uid());

-- Dispatchers can view all profiles
CREATE POLICY "dispatchers_view_profiles"
ON profiles
FOR SELECT
USING (current_setting('request.jwt.claims', true)::json->>'role' IN
      ('dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin'));

-- Team members can read pods they belong to
CREATE POLICY "read_assigned_pods"
ON pods
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pods.id
    AND r.profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Dispatchers can read and modify all pods
CREATE POLICY "dispatchers_manage_pods"
ON pods
FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' IN
       ('dispatcher_verified', 'dispatcher_admin'));

-- Roster entries: users see and edit only their own
CREATE POLICY "read_own_roster_entry"
ON roster_entries
FOR SELECT
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

CREATE POLICY "update_own_roster_entry"
ON roster_entries
FOR UPDATE
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Dispatchers manage all roster entries
CREATE POLICY "dispatchers_manage_roster"
ON roster_entries
FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' IN
       ('dispatcher_verified', 'dispatcher_admin'));

-- Team members can see confirmed dispatches
CREATE POLICY "team_view_dispatches"
ON dispatch_submissions
FOR SELECT
USING (
  status IN ('confirmed','in_progress','completed')
);

-- Dispatchers can create and manage all dispatches
CREATE POLICY "dispatchers_manage_dispatches"
ON dispatch_submissions
FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' IN
       ('dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin'));

CREATE POLICY "visible_to_related_dispatch"
ON dispatch_updates
FOR SELECT
USING (
  dispatch_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('confirmed','in_progress','completed')
  )
);

CREATE POLICY "dispatchers_manage_dispatch_updates"
ON dispatch_updates
FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' IN
       ('dispatcher_basic', 'dispatcher_verified', 'dispatcher_admin'));

-- Anyone can view public classes/sessions
CREATE POLICY "public_view_academy_classes"
ON academy_classes
FOR SELECT
USING (TRUE);

-- Dispatchers can manage classes and sessions
CREATE POLICY "dispatchers_manage_academy"
ON academy_classes
FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' IN
       ('dispatcher_verified', 'dispatcher_admin'));

-- Dispatchers can read and write
CREATE POLICY "dispatchers_manage_missing_persons"
ON missing_person_records
FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' IN
       ('dispatcher_verified', 'dispatcher_admin'));

-- Other roles: read-only if marked by same creator
CREATE POLICY "creator_view_own_case"
ON missing_person_records
FOR SELECT
USING (created_by = auth.uid());

-- Public read (non-sensitive)
CREATE POLICY "anyone_can_view_trust_signatures"
ON trust_signatures
FOR SELECT
USING (TRUE);

-- Only dispatch admins can add or revoke trust
CREATE POLICY "dispatch_admins_manage_trust"
ON trust_signatures
FOR ALL
USING (current_setting('request.jwt.claims', true)::json->>'role' = 'dispatcher_admin');

-- Enable RLS globally
DO $$
BEGIN
  EXECUTE (
    SELECT string_agg('ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;', E'\n')
    FROM pg_tables
    WHERE schemaname = 'public'
  );
END $$;
