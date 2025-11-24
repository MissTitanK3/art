-- Core
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_shift_signups ENABLE ROW LEVEL SECURITY;

-- Core
ALTER TABLE dispatch_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pod_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS dispatchers_view_profiles ON public.profiles;
CREATE POLICY dispatchers_view_profiles
ON public.profiles
FOR SELECT
USING (
  COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role'
  ) = ANY (
    ARRAY[
      'dispatcher_basic','dispatcher_verified','dispatcher_admin',
      'admin','regional_admin','national_admin'
    ]
  )
);

CREATE POLICY view_own_profile
ON public.profiles
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Region settings policies
CREATE POLICY region_settings_read_authenticated
ON region_settings
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY region_settings_insert_admins
ON region_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY region_settings_update_admins
ON region_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY region_settings_delete_admins
ON region_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

ALTER TABLE academy_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_participants ENABLE ROW LEVEL SECURITY;

ALTER TABLE missing_person_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE com_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE com_operators ENABLE ROW LEVEL SECURITY;
-- Dispatchers and Trainer+ roles can manage classes and sessions
-- NOTE: academy_sessions.class_id no longer enforces FK to academy_classes
DROP POLICY IF EXISTS "dispatchers_manage_academy" ON academy_classes;
CREATE POLICY "dispatchers_manage_academy_insert"
ON academy_classes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_academy_update"
ON academy_classes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY academy_classes_delete_block_authenticated
ON academy_classes
FOR DELETE
TO authenticated
USING (FALSE);
DROP POLICY IF EXISTS "dispatchers_manage_academy_sessions" ON academy_sessions;
CREATE POLICY "dispatchers_manage_academy_sessions_insert"
ON academy_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_academy_sessions_update"
ON academy_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY academy_sessions_delete_block_authenticated
ON academy_sessions
FOR DELETE
TO authenticated
USING (FALSE);
CREATE POLICY "dispatchers_insert_academy_sessions"
ON academy_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_update_academy_sessions"
ON academy_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
DROP POLICY IF EXISTS "dispatchers_manage_academy_instructors" ON academy_instructors;
CREATE POLICY "dispatchers_manage_academy_instructors_insert"
ON academy_instructors
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_academy_instructors_update"
ON academy_instructors
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
DROP POLICY IF EXISTS "dispatchers_manage_academy_participants" ON academy_participants;
CREATE POLICY "dispatchers_manage_academy_participants_insert"
ON academy_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_academy_participants_update"
ON academy_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY academy_participants_delete_block_authenticated
ON academy_participants
FOR DELETE
TO authenticated
USING (FALSE);
CREATE POLICY "dispatchers_insert_academy_participants"
ON academy_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_update_academy_participants"
ON academy_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
        EXISTS (
          SELECT 1 FROM public.roster_entries r
          WHERE r.pod_id = public.pods.id
            AND r.profile_id = p.id
            AND r.role = 'lead'
        )
        OR public.pods.created_by = p.id
      )
  )
);

CREATE POLICY leaders_update_own_pods
ON public.pods
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
      AND (
        EXISTS (
          SELECT 1 FROM public.roster_entries r
          WHERE r.pod_id = public.pods.id
            AND r.profile_id = p.id
            AND r.role = 'lead'
        )
        OR public.pods.created_by = p.id
      )
  )
);

-- Dispatchers manage pods (no delete)
DROP POLICY IF EXISTS dispatchers_manage_pods ON public.pods;
CREATE POLICY dispatchers_select_pods
ON public.pods
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY dispatchers_insert_pods
ON public.pods
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY dispatchers_update_pods
ON public.pods
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS leaders_delete_own_pods ON public.pods;
CREATE POLICY pods_delete_block_authenticated
ON public.pods
FOR DELETE
TO authenticated
USING (FALSE);

-- Organizations + collective calendar helpers
CREATE POLICY orgs_select_members
ON public.organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organizations.id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.organization_pods op
    JOIN public.roster_entries re ON re.pod_id = op.pod_id
    WHERE op.org_id = public.organizations.id
      AND re.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY orgs_insert_elevated
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY[
          'pod_leader','trainer',
          'dispatcher_basic','dispatcher_verified','dispatcher_admin',
          'admin','regional_admin','national_admin'
        ]
      )
  )
);

CREATE POLICY orgs_update_manage
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organizations.id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
      AND r.role = ANY (ARRAY['owner','admin'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY[
          'pod_leader','trainer',
          'dispatcher_basic','dispatcher_verified','dispatcher_admin',
          'admin','regional_admin','national_admin'
        ]
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organizations.id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
      AND r.role = ANY (ARRAY['owner','admin'])
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY[
          'pod_leader','trainer',
          'dispatcher_basic','dispatcher_verified','dispatcher_admin',
          'admin','regional_admin','national_admin'
        ]
      )
  )
);

DROP POLICY IF EXISTS orgs_delete_manage ON public.organizations;
CREATE POLICY organizations_delete_block_authenticated
ON public.organizations
FOR DELETE
TO authenticated
USING (FALSE);

CREATE POLICY org_roles_select_self
ON public.organization_roles
FOR SELECT
TO authenticated
USING (
  public.organization_roles.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY org_roles_insert_owner
ON public.organization_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.organization_roles.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND public.organization_roles.role = 'owner'
);

CREATE POLICY org_pods_select_members
ON public.organization_pods
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.roster_entries r
    WHERE r.pod_id = public.organization_pods.pod_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.organization_roles r
    WHERE r.org_id = public.organization_pods.org_id
      AND r.user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY pod_shift_signups_select_members
ON public.pod_shift_signups
FOR SELECT
TO authenticated
USING (
  public.pod_shift_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.pod_shifts ps
    JOIN public.roster_entries r ON r.pod_id = ps.pod_id
    WHERE ps.id = public.pod_shift_signups.shift_id
      AND r.profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY pod_shift_signups_insert_self
ON public.pod_shift_signups
FOR INSERT
TO authenticated
WITH CHECK (
  public.pod_shift_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.pod_shifts ps
    JOIN public.roster_entries r ON r.pod_id = ps.pod_id
    WHERE ps.id = public.pod_shift_signups.shift_id
      AND r.profile_id = public.pod_shift_signups.user_id
  )
);

CREATE POLICY pod_shift_signups_delete_self
ON public.pod_shift_signups
FOR DELETE
TO authenticated
USING (
  public.pod_shift_signups.user_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

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

-- Dispatchers manage roster entries (no delete)
DROP POLICY IF EXISTS "dispatchers_manage_roster" ON roster_entries;
CREATE POLICY "dispatchers_manage_roster_rw"
ON roster_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader', 'trainer' ,'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_roster_insert"
ON roster_entries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader', 'trainer' ,'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_roster_update"
ON roster_entries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader', 'trainer' ,'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader', 'trainer' ,'dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY roster_entries_delete_block_authenticated
ON roster_entries
FOR DELETE
TO authenticated
USING (FALSE);

-- Pod shifts: team members of a pod can view/manage that pod's shifts; dispatchers can manage all
CREATE POLICY "team_view_pod_shifts"
ON pod_shifts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM roster_entries r
    WHERE r.pod_id = pod_shifts.pod_id
      AND r.profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY pod_shifts_delete_block_authenticated
ON pod_shifts
FOR DELETE
TO authenticated
USING (FALSE);

-- Team members can see confirmed dispatches
CREATE POLICY "team_view_dispatches"
ON dispatch_submissions
FOR SELECT
USING (
  status IN ('confirmed','in_progress','completed')
);

-- Pod leaders/trainers can also view mobilizing and debriefing dispatches
CREATE POLICY leaders_view_extra_dispatches
ON dispatch_submissions
FOR SELECT
USING (
  status IN ('mobilizing','debriefing')
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
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
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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

DROP POLICY IF EXISTS com_alerts_delete_all ON com_alerts;
CREATE POLICY com_alerts_delete_block_authenticated
ON com_alerts
FOR DELETE
TO authenticated
USING (FALSE);

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
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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
      WHERE viewer.user_id = auth.uid()
        AND viewer.coordination_zone IS NOT NULL
        AND viewer.coordination_zone = owner.coordination_zone
    )
  )
  OR (
    visibility = 'pod' AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
    )
  )
);

-- Creator can read/write their own needs (no delete)
CREATE POLICY man_owner_rw_select
ON public.meet_a_need
FOR SELECT
TO authenticated
USING (
  created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY man_owner_rw_update
ON public.meet_a_need
FOR UPDATE
TO authenticated
USING (
  created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
)
WITH CHECK (
  created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Dispatchers/admins manage all (no delete)
DROP POLICY IF EXISTS man_dispatchers_manage ON public.meet_a_need;
CREATE POLICY man_dispatchers_manage_select
ON public.meet_a_need
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY man_dispatchers_manage_update
ON public.meet_a_need
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Allow any authenticated user to insert their own need
CREATE POLICY man_insert_authenticated
ON public.meet_a_need
FOR INSERT
TO authenticated
WITH CHECK (
  created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- TEMPORARY: permissive update for responders list (replace with RPC/trigger later)
CREATE POLICY man_update_responders_any_authenticated
ON public.meet_a_need
FOR UPDATE
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

CREATE POLICY meet_a_need_delete_block_authenticated
ON public.meet_a_need
FOR DELETE
TO authenticated
USING (FALSE);

-- Operators: dispatchers manage all
CREATE POLICY "dispatchers_manage_com_operators"
ON com_operators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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

-- Leaders/trainers inherit visibility for mobilizing/debriefing related logs
CREATE POLICY leaders_view_extra_com_logs
ON com_logs
FOR SELECT
USING (
  event_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

CREATE POLICY "dispatchers_manage_com_logs"
ON com_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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

-- Leaders/trainers inherit visibility for mobilizing/debriefing related briefings
CREATE POLICY leaders_view_extra_com_briefings
ON com_briefings
FOR SELECT
USING (
  event_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

CREATE POLICY "dispatchers_manage_com_briefings"
ON com_briefings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
-- Dispatchers can create and manage dispatches (no delete)
DROP POLICY IF EXISTS "dispatchers_manage_dispatches" ON dispatch_submissions;
CREATE POLICY "dispatchers_manage_dispatches_select"
ON dispatch_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_dispatches_insert"
ON dispatch_submissions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_dispatches_update"
ON dispatch_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY dispatch_submissions_delete_block_authenticated
ON dispatch_submissions
FOR DELETE
TO authenticated
USING (FALSE);

CREATE POLICY "visible_to_related_dispatch"
ON dispatch_updates
FOR SELECT
USING (
  dispatch_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('confirmed','in_progress','completed')
  )
);

-- Leaders/trainers can view updates for mobilizing/debriefing dispatches
CREATE POLICY leaders_view_extra_dispatch_updates
ON dispatch_updates
FOR SELECT
USING (
  dispatch_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

CREATE POLICY "dispatchers_manage_dispatch_updates"
ON dispatch_updates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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

-- Leaders/trainers can view logistics for mobilizing/debriefing dispatches
CREATE POLICY leaders_view_extra_dispatch_logistics
ON dispatch_logistics
FOR SELECT
USING (
  dispatch_id IN (
    SELECT id FROM dispatch_submissions
    WHERE status IN ('mobilizing','debriefing')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer'])
  )
);

CREATE POLICY "dispatchers_manage_dispatch_logistics"
ON dispatch_logistics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

DROP POLICY IF EXISTS "dispatchers_manage_dispatch_shifts" ON dispatch_shifts;
CREATE POLICY "dispatchers_manage_dispatch_shifts_select"
ON dispatch_shifts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_dispatch_shifts_insert"
ON dispatch_shifts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_dispatch_shifts_update"
ON dispatch_shifts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY dispatch_shifts_delete_block_authenticated
ON dispatch_shifts
FOR DELETE
TO authenticated
USING (FALSE);

-- Anyone can view public classes/sessions
CREATE POLICY "public_view_academy_classes"
ON academy_classes
FOR SELECT
TO authenticated
USING (TRUE);

-- Anyone can view sessions
CREATE POLICY "public_view_academy_sessions"
ON academy_sessions
FOR SELECT
TO authenticated
USING (TRUE);

-- Anyone can view instructors
CREATE POLICY "public_view_academy_instructors"
ON academy_instructors
FOR SELECT
TO authenticated
USING (TRUE);

-- Dispatchers can create sessions
CREATE POLICY "dispatchers_insert_academy_sessions"
ON academy_sessions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

-- Dispatchers can update sessions
CREATE POLICY "dispatchers_update_academy_sessions"
ON academy_sessions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer'])
  )
);

-- Anyone can view session participants
CREATE POLICY "public_view_academy_participants"
ON academy_participants
FOR SELECT
TO authenticated
USING (TRUE);

-- Dispatchers can create participants
CREATE POLICY "dispatchers_insert_academy_participants"
ON academy_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
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
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Dispatchers can read and write (no delete)
DROP POLICY IF EXISTS "dispatchers_manage_missing_persons" ON missing_person_records;
CREATE POLICY "dispatchers_manage_missing_persons_select"
ON missing_person_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatchers_manage_missing_persons_update"
ON missing_person_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY missing_person_records_delete_block_authenticated
ON missing_person_records
FOR DELETE
TO authenticated
USING (FALSE);

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

-- Only dispatch admins can add or revoke trust (no delete)
DROP POLICY IF EXISTS "dispatch_admins_manage_trust" ON trust_signatures;
CREATE POLICY "dispatch_admins_manage_trust_rw"
ON trust_signatures
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "dispatch_admins_manage_trust_update"
ON trust_signatures
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY trust_signatures_delete_block_authenticated
ON trust_signatures
FOR DELETE
TO authenticated
USING (FALSE);

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

-- Warehouse RLS Policies

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_movement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_pick_lists ENABLE ROW LEVEL SECURITY;

-- Warehouses: Read accessible to all authenticated users
CREATE POLICY "warehouses_read_authenticated"
ON warehouses
FOR SELECT
TO authenticated
USING (TRUE);

-- Warehouses: Write restricted to admins and dispatchers
DROP POLICY IF EXISTS "warehouses_write_privileged" ON warehouses;
CREATE POLICY "warehouses_insert_privileged"
ON warehouses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "warehouses_update_privileged"
ON warehouses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouses_delete_block_authenticated
ON warehouses
FOR DELETE
TO authenticated
USING (FALSE);

-- Zones: Same as warehouses
CREATE POLICY "warehouse_zones_read_authenticated"
ON warehouse_zones
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "warehouse_zones_write_privileged" ON warehouse_zones;
CREATE POLICY "warehouse_zones_insert_privileged"
ON warehouse_zones
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "warehouse_zones_update_privileged"
ON warehouse_zones
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_zones_delete_block_authenticated
ON warehouse_zones
FOR DELETE
TO authenticated
USING (FALSE);

-- Bins: Same as warehouses
CREATE POLICY "warehouse_bins_read_authenticated"
ON warehouse_bins
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "warehouse_bins_write_privileged" ON warehouse_bins;
CREATE POLICY "warehouse_bins_insert_privileged"
ON warehouse_bins
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "warehouse_bins_update_privileged"
ON warehouse_bins
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_bins_delete_block_authenticated
ON warehouse_bins
FOR DELETE
TO authenticated
USING (FALSE);

-- Inventory: Same as warehouses
CREATE POLICY "warehouse_inventory_read_authenticated"
ON warehouse_inventory
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "warehouse_inventory_write_privileged" ON warehouse_inventory;
CREATE POLICY "warehouse_inventory_insert_privileged"
ON warehouse_inventory
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "warehouse_inventory_update_privileged"
ON warehouse_inventory
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_inventory_delete_block_authenticated
ON warehouse_inventory
FOR DELETE
TO authenticated
USING (FALSE);

-- Movement Logs: Read accessible to all, Write restricted to privileged
CREATE POLICY "warehouse_movement_logs_read_authenticated"
ON warehouse_movement_logs
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "warehouse_movement_logs_write_privileged" ON warehouse_movement_logs;
CREATE POLICY "warehouse_movement_logs_insert_privileged"
ON warehouse_movement_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "warehouse_movement_logs_update_privileged"
ON warehouse_movement_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_movement_logs_delete_block_authenticated
ON warehouse_movement_logs
FOR DELETE
TO authenticated
USING (FALSE);

-- Pick Lists: Read accessible to all, Write restricted to privileged
CREATE POLICY "warehouse_pick_lists_read_authenticated"
ON warehouse_pick_lists
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS "warehouse_pick_lists_write_privileged" ON warehouse_pick_lists;
CREATE POLICY "warehouse_pick_lists_insert_privileged"
ON warehouse_pick_lists
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "warehouse_pick_lists_update_privileged"
ON warehouse_pick_lists
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_pick_lists_delete_block_authenticated
ON warehouse_pick_lists
FOR DELETE
TO authenticated
USING (FALSE);

-- Warehouse Item Catalog RLS Policies

-- Enable RLS
ALTER TABLE warehouse_item_catalog ENABLE ROW LEVEL SECURITY;

-- Read accessible to all authenticated users
CREATE POLICY "warehouse_item_catalog_read_authenticated"
ON warehouse_item_catalog
FOR SELECT
TO authenticated
USING (TRUE);

-- Write restricted to admins and dispatchers (no delete)
DROP POLICY IF EXISTS "warehouse_item_catalog_write_privileged" ON warehouse_item_catalog;
CREATE POLICY "warehouse_item_catalog_insert_privileged"
ON warehouse_item_catalog
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY "warehouse_item_catalog_update_privileged"
ON warehouse_item_catalog
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_item_catalog_delete_block_authenticated
ON warehouse_item_catalog
FOR DELETE
TO authenticated
USING (FALSE);
