-- Always Ready Tools: Region Database Indexes
-- Run after init_region.sql to add/refresh indexes and materialized view data.
-- Version: 2025-11-17

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_va_dispatch_profile
  ON public.volunteer_attributions(dispatch_id, profile_id);

CREATE INDEX IF NOT EXISTS idx_va_attributed_at
  ON public.volunteer_attributions(attributed_at DESC);

CREATE INDEX IF NOT EXISTS idx_com_teams_event ON public.com_teams(event_id);

CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_by ON public.bug_reports (created_by);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports (status);

CREATE INDEX IF NOT EXISTS meet_a_need_created_at_idx ON public.meet_a_need (created_at DESC);
CREATE INDEX IF NOT EXISTS meet_a_need_visibility_idx ON public.meet_a_need (visibility);
CREATE INDEX IF NOT EXISTS meet_a_need_status_idx ON public.meet_a_need (status);
CREATE INDEX IF NOT EXISTS meet_a_need_urgency_idx ON public.meet_a_need (urgency);
CREATE INDEX IF NOT EXISTS meet_a_need_created_by_idx ON public.meet_a_need (created_by);
CREATE INDEX IF NOT EXISTS meet_a_need_location_gin ON public.meet_a_need USING gin (location jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_wizard_test ON public.wizard USING btree (test);

CREATE INDEX IF NOT EXISTS idx_warehouses_region ON public.warehouses(region_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse ON public.warehouse_inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_sku ON public.warehouse_inventory(sku);
CREATE INDEX IF NOT EXISTS idx_warehouse_movement_logs_warehouse ON public.warehouse_movement_logs(warehouse_id);

-- Idempotent index creation (dynamic checks preserve existing deployments)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_user_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_user_id ON public.profiles (user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_region_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_region_id ON public.profiles (region_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_email'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_email ON public.profiles (email)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_handle'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_handle ON public.profiles (handle)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_roster_pod_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_roster_pod_id ON public.roster_entries (pod_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_roster_profile_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_roster_profile_id ON public.roster_entries (profile_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_pods_slug'
  ) THEN
    EXECUTE 'CREATE INDEX idx_pods_slug ON public.pods (slug)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_pods_region_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_pods_region_id ON public.pods (region_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_pods_created_by'
  ) THEN
    EXECUTE 'CREATE INDEX idx_pods_created_by ON public.pods (created_by)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_timestamp'
  ) THEN
    EXECUTE 'CREATE INDEX idx_dispatch_timestamp ON public.dispatch_submissions (timestamp)';
  END IF;

  -- advocacy tables indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_advocacy_groups_active'
  ) THEN
    EXECUTE 'CREATE INDEX idx_advocacy_groups_active ON public.advocacy_groups (active_status)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_advocacy_delivery_logs_case_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_advocacy_delivery_logs_case_id ON public.advocacy_delivery_logs (case_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_status'
  ) THEN
    EXECUTE 'CREATE INDEX idx_dispatch_status ON public.dispatch_submissions (status)';
  END IF;

  -- Optional performance index: dispatch type
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_type'
  ) THEN
    EXECUTE 'CREATE INDEX idx_dispatch_type ON public.dispatch_submissions (type)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_region_settings_updated_at'
  ) THEN
    EXECUTE 'CREATE INDEX idx_region_settings_updated_at ON public.region_settings (updated_at DESC)';
  END IF;

  -- GIN indexes for JSONB fields often filtered
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_coverage_zones_gin'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_coverage_zones_gin ON public.profiles USING gin (coverage_zones)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_assigned_volunteers_gin'
  ) THEN
    EXECUTE 'CREATE INDEX idx_dispatch_assigned_volunteers_gin ON public.dispatch_submissions USING gin (assigned_volunteers)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_updates_dispatch_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_updates_dispatch_id ON public.dispatch_updates (dispatch_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_logistics_dispatch_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_logistics_dispatch_id ON public.dispatch_logistics (dispatch_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_shifts_pod_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_shifts_pod_id ON public.dispatch_shifts (pod_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_shifts_volunteer_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_shifts_volunteer_id ON public.dispatch_shifts (volunteer_id)';
  END IF;

  -- Organization tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_organization_roles_org_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_organization_roles_org_id ON public.organization_roles (org_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_organization_roles_user_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_organization_roles_user_id ON public.organization_roles (user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_organizations_region_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_organizations_region_id ON public.organizations (region_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_organization_pods_org_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_organization_pods_org_id ON public.organization_pods (org_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_organization_pods_pod_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_organization_pods_pod_id ON public.organization_pods (pod_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_org_polls_org_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_org_polls_org_id ON public.organization_polls (org_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_org_poll_options_poll_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_org_poll_options_poll_id ON public.organization_poll_options (poll_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_org_poll_votes_poll_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_org_poll_votes_poll_id ON public.organization_poll_votes (poll_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_org_poll_votes_option_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_org_poll_votes_option_id ON public.organization_poll_votes (option_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_campaigns_region_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_campaigns_region_id ON public.campaigns (region_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_academy_lessons_slug'
  ) THEN
    EXECUTE 'CREATE INDEX idx_academy_lessons_slug ON public.academy_lessons (slug)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_lessons_slug'
  ) THEN
    EXECUTE 'CREATE INDEX idx_lessons_slug ON public.lessons (slug)';
  END IF;

  -- Calendar items indexes (formerly pod_shifts)
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_calendar_items_pod_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_calendar_items_pod_id ON public.calendar_items (pod_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_calendar_items_start'
  ) THEN
    EXECUTE 'CREATE INDEX idx_calendar_items_start ON public.calendar_items (start)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_calendar_signups_item_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_calendar_signups_item_id ON public.calendar_signups (item_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_calendar_signups_user_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_calendar_signups_user_id ON public.calendar_signups (user_id)';
  END IF;

  -- Comms indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_logs_event_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_com_logs_event_id ON public.com_logs (event_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_logs_timestamp'
  ) THEN
    EXECUTE 'CREATE INDEX idx_com_logs_timestamp ON public.com_logs (timestamp DESC)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_operators_team_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_com_operators_team_id ON public.com_operators (team_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_channels_team_id'
  ) THEN
    EXECUTE 'CREATE INDEX idx_com_channels_team_id ON public.com_channels (team_id)';
  END IF;

  -- Comms optional index: team last_check_in for recency sorts
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_teams_last_check_in'
  ) THEN
    EXECUTE 'CREATE INDEX idx_com_teams_last_check_in ON public.com_teams (last_check_in DESC)';
  END IF;

  -- Comms alerts index for per-event lookup
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'com_alerts_event_id_idx'
  ) THEN
    EXECUTE 'CREATE INDEX com_alerts_event_id_idx ON public.com_alerts (event_id)';
  END IF;

  -- Optional performance index: roster joined_at timeline queries
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_roster_joined_at'
  ) THEN
    EXECUTE 'CREATE INDEX idx_roster_joined_at ON public.roster_entries (joined_at DESC)';
  END IF;
END $$;

-- PostGIS spatial index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_location_geog'
  ) THEN
    CREATE INDEX idx_dispatch_location_geog ON public.dispatch_submissions USING gist (location_geog);
  END IF;
END $$;

-- Additional indexes and constraints (idempotent)
DO $$
BEGIN
  -- Unique user_id when present (enforce 1:1 with auth user)
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'uq_profiles_user_id_not_null'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uq_profiles_user_id_not_null ON public.profiles (user_id) WHERE user_id IS NOT NULL';
  END IF;

  -- Prevent duplicate roster membership per pod
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'uq_roster_pod_profile'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uq_roster_pod_profile ON public.roster_entries (pod_id, profile_id)';
  END IF;

  -- Helpful filter indexes
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_operating_counties_gin'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_operating_counties_gin ON public.profiles USING gin (operating_counties)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_access_role'
  ) THEN
    EXECUTE 'CREATE INDEX idx_profiles_access_role ON public.profiles (access_role)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_roster_status'
  ) THEN
    EXECUTE 'CREATE INDEX idx_roster_status ON public.roster_entries (status)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_logistics_category'
  ) THEN
    EXECUTE 'CREATE INDEX idx_logistics_category ON public.dispatch_logistics (category)';
  END IF;

  -- Optional filter index for missing person languages
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_missing_languages_spoken_gin'
  ) THEN
    EXECUTE 'CREATE INDEX idx_missing_languages_spoken_gin ON public.missing_person_records USING gin (languages_spoken)';
  END IF;
END $$;
