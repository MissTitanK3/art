-- Core
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_entries ENABLE ROW LEVEL SECURITY;

-- Core
ALTER TABLE dispatch_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_shifts ENABLE ROW LEVEL SECURITY;

ALTER TABLE academy_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_participants ENABLE ROW LEVEL SECURITY;

ALTER TABLE missing_person_records ENABLE ROW LEVEL SECURITY;

-- Comms
ALTER TABLE com_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE com_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE com_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE com_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE com_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE com_alerts ENABLE ROW LEVEL SECURITY;

-- Feedback
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Mutual Aid
ALTER TABLE meet_a_need ENABLE ROW LEVEL SECURITY;

-- Event Wizard
ALTER TABLE wizard ENABLE ROW LEVEL SECURITY;

-- Trust
ALTER TABLE trust_signatures ENABLE ROW LEVEL SECURITY;

-- Everyone can view their own profile
CREATE POLICY "select_own_profile"
ON profiles
FOR SELECT
USING (user_id = auth.uid()::text);

-- Users can update only their own profile
CREATE POLICY "update_own_profile"
ON profiles
FOR UPDATE
USING (user_id = auth.uid()::text);

-- Allow authenticated users to insert their own profile
create policy "insert_own_profile"
on public.profiles
for insert
to authenticated
with check (user_id = (auth.uid())::text);

-- Pod/admin roles can view all profiles (use JWT claim to avoid recursion)
CREATE POLICY "dispatchers_view_profiles"
ON profiles
FOR SELECT
USING (
  -- Allow if the JWT includes an app-level dispatcher role, either as a top-level claim
  -- or under app_metadata.access_role (Supabase places custom claims here by default).
  (
    current_setting('request.jwt.claims', true)::json->>'role' IN (
      'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'
    )
  )
  OR (
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'access_role') IN (
      'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'
    )
  )
);

-- Team members can read pods they belong to
CREATE POLICY "read_assigned_pods"
ON pods
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pods.id
    AND r.profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()::text
    )
  )
);

-- Pod/admin roles can read and modify all pods
CREATE POLICY dispatchers_manage_pods
ON public.pods
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Roster entries: users see and edit only their own
CREATE POLICY "read_own_roster_entry"
ON roster_entries
FOR SELECT
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text)
);

CREATE POLICY "update_own_roster_entry"
ON roster_entries
FOR UPDATE
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()::text)
);

-- Dispatchers manage all roster entries
CREATE POLICY "dispatchers_manage_roster"
ON roster_entries
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Pod shifts: team members of a pod can view/manage that pod's shifts; dispatchers can manage all
CREATE POLICY "team_view_pod_shifts"
ON pod_shifts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY "team_insert_pod_shifts"
ON pod_shifts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY "team_update_pod_shifts"
ON pod_shifts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY "team_delete_pod_shifts"
ON pod_shifts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Team members can see confirmed dispatches
CREATE POLICY "team_view_dispatches"
ON dispatch_submissions
FOR SELECT
USING (
  status IN ('confirmed','in_progress','completed')
);

-- =========================================================
-- Comms policies

-- Teams: dispatchers manage all, others no access by default
CREATE POLICY "dispatchers_manage_com_teams"
ON com_teams
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Alerts: permissive starter policies (tune per region auth)
CREATE POLICY com_alerts_select_all
ON com_alerts
FOR SELECT
USING (TRUE);

CREATE POLICY com_alerts_insert_all
ON com_alerts
FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY com_alerts_update_all
ON com_alerts
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY com_alerts_delete_all
ON com_alerts
FOR DELETE
USING (TRUE);

-- Bug reports: any authenticated user can submit; creators read their own; admins manage all
CREATE POLICY insert_bug_report_authenticated
ON bug_reports
FOR INSERT
TO authenticated
WITH CHECK (TRUE);

CREATE POLICY read_own_bug_reports
ON bug_reports
FOR SELECT
USING (created_by = auth.uid()::text);

CREATE POLICY admins_manage_bug_reports
ON bug_reports
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Meet-A-Need policies
-- Visibility policy: public, region (matching coordination_zone), or pod (dispatch/admin roles)
CREATE POLICY man_select_visibility
ON public.meet_a_need
FOR SELECT
TO authenticated
USING (
  visibility = 'public'
  OR (
    visibility = 'region' AND EXISTS (
      SELECT 1 FROM public.profiles viewer
      JOIN public.profiles owner ON owner.id = meet_a_need.created_by
      WHERE viewer.user_id = (auth.uid())::text
        AND viewer.coordination_zone IS NOT NULL
        AND viewer.coordination_zone = owner.coordination_zone
    )
  )
  OR (
    visibility = 'pod' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = (auth.uid())::text
        AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
    )
  )
);

-- Creator can read/write their own needs
CREATE POLICY man_owner_rw
ON public.meet_a_need
FOR ALL
TO authenticated
USING (
  created_by IN (SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text)
)
WITH CHECK (
  created_by IN (SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text)
);

-- Dispatchers/admins manage all
CREATE POLICY man_dispatchers_manage
ON public.meet_a_need
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Allow any authenticated user to insert their own need
CREATE POLICY man_insert_authenticated
ON public.meet_a_need
FOR INSERT
TO authenticated
WITH CHECK (
  created_by IN (SELECT id FROM public.profiles WHERE user_id = (auth.uid())::text)
);

-- TEMPORARY: permissive update for responders list (replace with RPC/trigger later)
CREATE POLICY man_update_responders_any_authenticated
ON public.meet_a_need
FOR UPDATE
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

-- Operators: dispatchers manage all
CREATE POLICY "dispatchers_manage_com_operators"
ON com_operators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Channels: dispatchers manage all
CREATE POLICY "dispatchers_manage_com_channels"
ON com_channels
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Logs: visible when related dispatch is visible to team; dispatchers manage
CREATE POLICY "visible_to_related_dispatch_com_logs"
ON com_logs
FOR SELECT
USING (
  event_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('confirmed','in_progress','completed')
  )
);

CREATE POLICY "dispatchers_manage_com_logs"
ON com_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Briefings: visible when related dispatch is visible to team; dispatchers manage
CREATE POLICY "visible_to_related_dispatch_com_briefings"
ON com_briefings
FOR SELECT
USING (
  event_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('confirmed','in_progress','completed')
  )
);

CREATE POLICY "dispatchers_manage_com_briefings"
ON com_briefings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
-- Dispatchers can create and manage all dispatches
CREATE POLICY "dispatchers_manage_dispatches"
ON dispatch_submissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

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
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Logistics: visible when related dispatch is visible to team; dispatchers manage
CREATE POLICY "visible_to_related_dispatch_logistics"
ON dispatch_logistics
FOR SELECT
USING (
  dispatch_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('confirmed','in_progress','completed')
  )
);

CREATE POLICY "dispatchers_manage_dispatch_logistics"
ON dispatch_logistics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatch desk shifts: team members of the pod or any dispatcher can view; dispatchers manage
CREATE POLICY "team_view_dispatch_shifts"
ON dispatch_shifts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = dispatch_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()::text
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY "dispatchers_manage_dispatch_shifts"
ON dispatch_shifts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Anyone can view public classes/sessions
CREATE POLICY "public_view_academy_classes"
ON academy_classes
FOR SELECT
USING (TRUE);

-- Dispatchers can manage classes and sessions
CREATE POLICY "dispatchers_manage_academy"
ON academy_classes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Anyone can view sessions
CREATE POLICY "public_view_academy_sessions"
ON academy_sessions
FOR SELECT
USING (TRUE);

-- Dispatchers can manage sessions
CREATE POLICY "dispatchers_manage_academy_sessions"
ON academy_sessions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Anyone can view instructors
CREATE POLICY "public_view_academy_instructors"
ON academy_instructors
FOR SELECT
USING (TRUE);

-- Dispatchers can manage instructors
CREATE POLICY "dispatchers_manage_academy_instructors"
ON academy_instructors
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatchers can create sessions
CREATE POLICY "dispatchers_insert_academy_sessions"
ON academy_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatchers can update sessions
CREATE POLICY "dispatchers_update_academy_sessions"
ON academy_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Anyone can view session participants
CREATE POLICY "public_view_academy_participants"
ON academy_participants
FOR SELECT
USING (TRUE);

-- Dispatchers can manage participants
CREATE POLICY "dispatchers_manage_academy_participants"
ON academy_participants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatchers can create participants
CREATE POLICY "dispatchers_insert_academy_participants"
ON academy_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatchers can update participants
CREATE POLICY "dispatchers_update_academy_participants"
ON academy_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatchers can read and write
CREATE POLICY "dispatchers_manage_missing_persons"
ON missing_person_records
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Other roles: read-only if marked by same creator
CREATE POLICY "creator_view_own_case"
ON missing_person_records
FOR SELECT
USING (created_by = auth.uid()::text);

-- Public read (non-sensitive)
CREATE POLICY "anyone_can_view_trust_signatures"
ON trust_signatures
FOR SELECT
USING (TRUE);

-- Only dispatch admins can add or revoke trust
CREATE POLICY "dispatch_admins_manage_trust"
ON trust_signatures
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Enable RLS globally
DO $$
DECLARE
  sql TEXT;
BEGIN
  -- Enable RLS only on tables we can ALTER and that are not extension-owned
  SELECT string_agg(
           format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', t.schemaname, t.tablename),
           E'\n'
         )
    INTO sql
    FROM pg_tables t
    JOIN pg_class c
      ON c.relname = t.tablename
     AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.schemaname)
    LEFT JOIN pg_depend d
      ON d.objid = c.oid
     AND d.deptype = 'e' -- extension-owned objects (e.g., PostGIS spatial_ref_sys)
   WHERE t.schemaname = 'public'
     AND d.objid IS NULL
     AND c.relowner = (SELECT oid FROM pg_roles WHERE rolname = current_user);

  IF sql IS NOT NULL THEN
    EXECUTE sql;
  END IF;
END $$;
