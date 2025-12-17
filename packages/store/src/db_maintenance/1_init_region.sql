  -- Always Ready Tools: Region Database Schema
  -- Version: 2025-11-17
  -- Each region runs its own instance using this schema.
  -- This script is idempotent and safe to re-run.
  -- =========================================================

  -- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  email TEXT,
  handle TEXT,
  region_id TEXT,
  display_name TEXT NOT NULL,
  access_role TEXT NOT NULL DEFAULT 'team_member',
    field_roles JSONB DEFAULT '[]',
    verified_by TEXT DEFAULT 'self',
    affiliation TEXT,
    availability BOOLEAN DEFAULT TRUE,
  last_check_in TIMESTAMPTZ,
    contact_signal TEXT,
    coordination_zone TEXT,
    coverage_zones JSONB DEFAULT '[]',
    state TEXT,
    weekly_availability JSONB,
    self_risk_acknowledged BOOLEAN DEFAULT FALSE,
  self_status_flags JSONB DEFAULT '[]',
  city TEXT,
  operating_counties TEXT[],
  inserted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
    CONSTRAINT profiles_access_role_check CHECK (
      access_role IN (
        'team_member',
        'dispatcher_basic',
        'dispatcher_verified',
        'dispatcher_admin',
        'guest',
        'user',
        'volunteer',
        'pod_leader',
        'trainer',
        'admin',
        'regional_admin',
        'national_admin'
      )
    ),
    CONSTRAINT profiles_verified_by_check CHECK (
      verified_by IN ('self','partner_org','admin','suspended')
    ),
    CONSTRAINT profiles_field_roles_json_check CHECK (
      field_roles IS NULL OR jsonb_typeof(field_roles) = 'array'
    ),
    CONSTRAINT profiles_coverage_zones_json_check CHECK (
      coverage_zones IS NULL OR jsonb_typeof(coverage_zones) = 'array'
    ),
    CONSTRAINT profiles_self_status_flags_json_check CHECK (
      self_status_flags IS NULL OR jsonb_typeof(self_status_flags) = 'array'
    )
  );

  -- Dispatch submissions
  CREATE TABLE IF NOT EXISTS public.dispatch_submissions (
    id TEXT PRIMARY KEY,
    type TEXT,
    location JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    date_of_event TIMESTAMPTZ,
    required_roles JSONB,
    encrypted_payload TEXT,
    auto_delete_after TIMESTAMPTZ,
    integrity_hash TEXT,
    submitted_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    source TEXT,
    visibility_radius_km DOUBLE PRECISION,
    status TEXT,
    priority TEXT,
    summary TEXT,
    briefing TEXT,
    notes TEXT,
    assigned_volunteers JSONB,
    required_roles_by_type JSONB,
    location_label TEXT,
    point_of_contact TEXT,
    state TEXT,
    intended_action_preset TEXT,
    intended_action_notes TEXT,
    intended_actions JSONB,
    intended_actions_custom TEXT,
    signal_link TEXT,
    public_signal_link TEXT,
    training BOOLEAN DEFAULT FALSE,
    flagged BOOLEAN DEFAULT FALSE,
    people_served INT DEFAULT 0 CHECK (people_served >= 0),
    resources_distributed INT DEFAULT 0 CHECK (resources_distributed >= 0),
    risk_level TEXT DEFAULT 'unknown',
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    visibility_scope TEXT DEFAULT 'org_and_region_masked',
    invited_user_ids TEXT[],
    CONSTRAINT dispatch_status_check CHECK (
      status IS NULL OR status IN (
        'open','preplanning','unconfirmed','confirmed','mobilizing','in_progress','debriefing','completed','verified_complete','cancelled','expired','archived'
      )
    ),
    CONSTRAINT dispatch_source_check CHECK (
      source IS NULL OR source IN ('dispatch','manual','system')
    ),
    CONSTRAINT dispatch_type_check CHECK (
      type IS NULL OR type IN ('rapid_response','planned_event','training','community_aid','technical_aid','other')
    ),
    CONSTRAINT dispatch_required_roles_json_check CHECK (
      required_roles IS NULL OR jsonb_typeof(required_roles) = 'array'
    ),
    CONSTRAINT dispatch_assigned_volunteers_json_check CHECK (
      assigned_volunteers IS NULL OR jsonb_typeof(assigned_volunteers) = 'array'
    ),
    CONSTRAINT dispatch_required_roles_by_type_json_check CHECK (
      required_roles_by_type IS NULL OR jsonb_typeof(required_roles_by_type) = 'object'
    ),
    CONSTRAINT dispatch_intended_actions_json_check CHECK (
      intended_actions IS NULL OR jsonb_typeof(intended_actions) = 'array'
    ),
    CONSTRAINT dispatch_risk_level_check CHECK (
      risk_level IS NULL OR risk_level IN ('unknown','low','medium','high','critical')
    )
  );

  -- Volunteer impact attributions
  CREATE TABLE IF NOT EXISTS public.volunteer_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatch_id TEXT NOT NULL REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    minutes INT NOT NULL CHECK (minutes > 0),
    attributed_by UUID NOT NULL REFERENCES auth.users(id),
    attributed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    activity_type TEXT NOT NULL DEFAULT 'ops',
    notes TEXT,
    anomaly_flag BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','reverted'))
  );

  -- Pods
CREATE TABLE IF NOT EXISTS public.pods (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  region_id TEXT,
  area TEXT,
  channels JSONB DEFAULT '[]',
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ
);

-- Roster
CREATE TABLE IF NOT EXISTS public.roster_entries (
  id TEXT PRIMARY KEY,
  pod_id TEXT REFERENCES public.pods(id) ON DELETE RESTRICT,
  profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  role TEXT CHECK (role IN ('lead','member','trainee')),
  status TEXT CHECK (status IN ('active','inactive','suspended')),
  langs JSONB DEFAULT '[]',
  skills TEXT[],
  certs JSONB DEFAULT '[]',
    notes TEXT,
  handle TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_shift_at TIMESTAMPTZ,
  signal_handle TEXT,
  deleted_at TIMESTAMPTZ
);

  -- Organizations (for grouping pods under a shared identity)
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  norms JSONB,
  visibility_scope TEXT DEFAULT 'org_and_region_masked',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

  -- Organization ↔ Pod membership (many-to-many)
CREATE TABLE IF NOT EXISTS public.organization_pods (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pod_id TEXT NOT NULL REFERENCES public.pods(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (org_id, pod_id)
);

  -- Organization roles (user-level permissions)
CREATE TABLE IF NOT EXISTS public.organization_roles (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  role TEXT NOT NULL, -- owner | admin | editor | viewer
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (org_id, user_id)
);

  CREATE UNIQUE INDEX IF NOT EXISTS organization_roles_owner_unique
    ON public.organization_roles (org_id)
    WHERE role = 'owner';

  -- Organization polls
  CREATE TABLE IF NOT EXISTS public.organization_polls (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    closes_at TIMESTAMPTZ,
    allow_multiple BOOLEAN DEFAULT FALSE,
    note TEXT,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT organization_polls_status_check CHECK (
      status IN ('open','closed','archived')
    )
  );

  CREATE TABLE IF NOT EXISTS public.organization_poll_options (
    id TEXT PRIMARY KEY,
    poll_id TEXT NOT NULL REFERENCES public.organization_polls(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    emoji TEXT,
    position INTEGER,
    votes_count INTEGER DEFAULT 0 CHECK (votes_count >= 0),
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.organization_poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id TEXT NOT NULL REFERENCES public.organization_polls(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL REFERENCES public.organization_poll_options(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT organization_poll_votes_unique_choice UNIQUE (poll_id, option_id, profile_id)
  );

  -- Dispatch updates
  CREATE TABLE IF NOT EXISTS public.dispatch_updates (
    id TEXT PRIMARY KEY,
    dispatch_id TEXT REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
    author TEXT,
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    attachments JSONB DEFAULT '[]',
    visibility_scope TEXT DEFAULT 'org_and_region_masked',
    invited_user_ids TEXT[],
    CONSTRAINT dispatch_updates_attachments_json_check CHECK (
      attachments IS NULL OR jsonb_typeof(attachments) = 'array'
    )
  );

  -- Dispatch logistics
  CREATE TABLE IF NOT EXISTS public.dispatch_logistics (
    id TEXT PRIMARY KEY,
    dispatch_id TEXT REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
    category TEXT,
    description TEXT,
    quantity TEXT,
    priority TEXT,
    status TEXT,
    responsible_party JSONB,
    warehouse JSONB,
    accountability_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    visibility_scope TEXT DEFAULT 'org_and_region_masked',
    invited_user_ids TEXT[],
    CONSTRAINT dispatch_logistics_category_check CHECK (
      category IS NULL OR category IN ('transport','supply','comms','rally_point','other')
    ),
    CONSTRAINT dispatch_logistics_priority_check CHECK (
      priority IS NULL OR priority IN ('low','medium','high','critical')
    ),
    CONSTRAINT dispatch_logistics_status_check CHECK (
      status IS NULL OR status IN ('pending','in_progress','delivered','cancelled')
    )
  );

  -- Dispatch shifts (lightweight)
  CREATE TABLE IF NOT EXISTS public.dispatch_shifts (
    id TEXT PRIMARY KEY,
    pod_id TEXT REFERENCES public.pods(id) ON DELETE RESTRICT,
    volunteer_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
  );

  -- =========================================================
  -- Comms: teams, operators, logs, channels, briefings
  -- These tables support the Dispatch Comms Management Module
  -- Ensure gen_random_uuid() is available for UUID defaults used below
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- Region-level configuration settings (per region deployment)
  CREATE TABLE IF NOT EXISTS public.region_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_slug TEXT NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}'::jsonb,
    operational_minimums JSONB,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  WITH default_minimums AS (
    SELECT jsonb_build_array(
      jsonb_build_object(
        'key', 'dispatch',
        'label', 'Dispatch & Coordination',
        'description', 'Certified dispatchers who can triage incidents, assign resources, and coordinate Meet-A-Need intakes around the clock.',
        'requiredCount', 3,
  'requiredCourses', jsonb_build_array('responding-to-dispatch-calls', 'trust-and-ethics-in-dispatch'),
        'staffingRange', jsonb_build_array(3, 5),
        'tags', jsonb_build_array('dispatch', 'coordination'),
        'emphasis', 'Need 3-5 cleared dispatchers to operate minimum coverage windows.'
      ),
      jsonb_build_object(
        'key', 'field',
        'label', 'Field Safety & On-The-Ground Teams',
        'description', 'Level 1 volunteers prepared for field deployments, basic bystander intervention, and mesh communications while on patrol.',
        'requiredCount', 10,
  'requiredCourses', jsonb_build_array('field-role-training-hub', 'field-safety'),
        'staffingRange', jsonb_build_array(10, 15),
        'tags', jsonb_build_array('field', 'safety'),
        'emphasis', 'Sustain at least 10 trained volunteers to rotate into field teams without burnout.'
      ),
      jsonb_build_object(
        'key', 'comms',
        'label', 'Communications & Technology',
        'description', 'Radio leads who can configure mesh hardware, maintain power, and run briefings for deployments.',
        'requiredCount', 2,
  'requiredCourses', jsonb_build_array('radio-communications', 'mesh-networks-hardware-guide', 'digital-resilience-contingency-comms'),
        'staffingRange', jsonb_build_array(2, 3),
        'tags', jsonb_build_array('comms', 'technology'),
        'emphasis', 'At least two comms leads keep radios, mesh, and daily briefings online.'
      ),
      jsonb_build_object(
        'key', 'admin',
        'label', 'Trust & Regional Governance',
        'description', 'Admins who can maintain trust signatures, validate roster entries, and manage signer rotations.',
        'requiredCount', 1,
  'requiredCourses', jsonb_build_array('admin-tools', 'trust-networks-signature-management', 'regional-data-stewardship'),
        'staffingRange', jsonb_build_array(1, 2),
        'tags', jsonb_build_array('trust', 'governance'),
        'emphasis', 'Keep at least one trusted admin active to manage signatures and onboarding.'
      ),
      jsonb_build_object(
        'key', 'pod',
        'label', 'Local Ops & Pod Management',
        'description', 'Pod leads who can stand up pods, run shifts, and facilitate after-action reviews for learning feedback loops.',
        'requiredCount', 3,
  'requiredCourses', jsonb_build_array('create-a-pod', 'training-the-trainers', 'after-action-data-hygiene'),
        'staffingRange', jsonb_build_array(3, 4),
        'tags', jsonb_build_array('leadership', 'pods'),
        'emphasis', 'Ensure three trained pod leads to cover weekly rotations and relief coverage.'
      ),
      jsonb_build_object(
        'key', 'engagement',
        'label', 'Community Engagement',
        'description', 'Outreach volunteers ready to run CDC deployments, coordinated foot patrols, and Meet-A-Need responses.',
        'requiredCount', 4,
  'requiredCourses', jsonb_build_array('outreach-messaging-community-trust', 'community-defense-center', 'community-intelligence-situational-reporting'),
        'staffingRange', jsonb_build_array(4, 6),
        'tags', jsonb_build_array('community', 'outreach'),
        'emphasis', 'Keep 4-6 outreach volunteers ready so community requests never stall.'
      )
    ) AS payload
  )
  INSERT INTO public.region_settings (region_slug, settings, operational_minimums)
  SELECT
    'default',
    jsonb_build_object(
      'academy',
      jsonb_build_object(
        'operational_minimums', payload
      )
    ),
    payload
  FROM default_minimums
  ON CONFLICT (region_slug) DO NOTHING;

  CREATE TABLE IF NOT EXISTS public.com_teams (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel TEXT,
    encryption_mode TEXT,
    assigned_dispatch_lead TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    last_check_in TIMESTAMPTZ,
    location_label TEXT,
    default_check_in_interval_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT com_teams_encryption_mode_check CHECK (
      encryption_mode IS NULL OR encryption_mode IN ('Clear','AES-256','Proprietary','Other')
    )
  );

  CREATE TABLE IF NOT EXISTS public.com_operators (
    id TEXT PRIMARY KEY,
    callsign TEXT NOT NULL,
    sector TEXT,
    station_name TEXT,
    station_type TEXT,
    assigned_roles JSONB DEFAULT '[]',
    linked_units JSONB DEFAULT '[]',
    frequency TEXT,
    battery_status TEXT,
    coms_condition TEXT,
    status TEXT,
    check_in_interval_minutes INTEGER,
    last_check_in TIMESTAMPTZ,
    handoff_to TEXT REFERENCES public.com_operators(id) ON DELETE SET NULL,
    team_id TEXT REFERENCES public.com_teams(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT com_operators_station_type_check CHECK (
      station_type IS NULL OR station_type IN ('Portable','Mobile','Base','Relay','Other')
    ),
    CONSTRAINT com_operators_battery_status_check CHECK (
      battery_status IS NULL OR battery_status IN ('Full','Good','Low','Critical')
    ),
    CONSTRAINT com_operators_coms_condition_check CHECK (
      coms_condition IS NULL OR coms_condition IN ('Clear','Static','Intermittent','Down')
    ),
    CONSTRAINT com_operators_status_check CHECK (
      status IS NULL OR status IN ('Active','Standby','Offshift','Unknown')
    ),
    CONSTRAINT com_operators_assigned_roles_json_check CHECK (
      assigned_roles IS NULL OR jsonb_typeof(assigned_roles) = 'array'
    ),
    CONSTRAINT com_operators_linked_units_json_check CHECK (
      linked_units IS NULL OR jsonb_typeof(linked_units) = 'array'
    )
  );

  CREATE TABLE IF NOT EXISTS public.com_logs (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
    operator_id TEXT REFERENCES public.com_operators(id) ON DELETE SET NULL,
    incident_id TEXT,
    message TEXT,
    message_type TEXT,
    importance TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    tags JSONB DEFAULT '[]',
    CONSTRAINT com_logs_message_type_check CHECK (
      message_type IS NULL OR message_type IN ('Routine','Priority','Emergency')
    ),
    CONSTRAINT com_logs_importance_check CHECK (
      importance IS NULL OR importance IN ('Low','Normal','High')
    ),
    CONSTRAINT com_logs_tags_json_check CHECK (
      tags IS NULL OR jsonb_typeof(tags) = 'array'
    )
  );

  CREATE TABLE IF NOT EXISTS public.com_channels (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES public.com_teams(id) ON DELETE SET NULL,
    channel_name TEXT,
    frequency TEXT,
    cross_team_relays JSONB DEFAULT '[]',
    handover_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT com_channels_relays_json_check CHECK (
      cross_team_relays IS NULL OR jsonb_typeof(cross_team_relays) = 'array'
    )
  );

  CREATE TABLE IF NOT EXISTS public.com_briefings (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
    overview TEXT,
    comms_plan TEXT,
    safety_notes TEXT,
    updates TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Comms alerts: lightweight custom alerts tied to events
  CREATE TABLE IF NOT EXISTS public.com_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL,
    direction TEXT NOT NULL,
    description TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Meet-A-Need: lightweight mutual aid requests
CREATE TABLE IF NOT EXISTS public.meet_a_need (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('low','normal','urgent')) DEFAULT 'normal',
    visibility TEXT DEFAULT 'role:team_member',
    location JSONB,
    contact_preference TEXT,
    status TEXT CHECK (status IN ('open','matched','fulfilled','closed')) DEFAULT 'open',
  responders JSONB DEFAULT '[]',
  assigned_to TEXT[],
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

  -- Ensure visibility constraint allows role-based thresholds (idempotent)
  DO $$ BEGIN
    BEGIN
      ALTER TABLE public.meet_a_need DROP CONSTRAINT IF EXISTS meet_a_need_visibility_check;
    EXCEPTION WHEN undefined_object THEN
      NULL;
    END;
    ALTER TABLE public.meet_a_need
      ADD CONSTRAINT meet_a_need_visibility_check CHECK (
        visibility IS NULL OR visibility IN (
          'public','region','pod',
          'role:team_member','role:pod_leader','role:trainer',
          'role:dispatcher_basic','role:dispatcher_verified','role:dispatcher_admin',
          'role:admin','role:regional_admin','role:national_admin'
        )
      );
  END $$;

  -- Confirmed Watch Wizard submissions (lightweight event reports)
  CREATE TABLE IF NOT EXISTS public.wizard (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    agency_type TEXT[],
    agency_other TEXT,
    location JSONB,
    media_url TEXT,
    vet_method TEXT,
    officer_moving BOOLEAN,
    officer_direction TEXT,
    lights_on BOOLEAN,
    sirens_on BOOLEAN,
    submitted_by UUID,
    test BOOLEAN DEFAULT FALSE
  );

  -- =========================================================
  -- Feedback: Bug Reports
  -- Lightweight issue tracker for platform feedback within a region
  CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT, -- auth uid
    title TEXT NOT NULL,
    area TEXT NOT NULL DEFAULT 'general',
    steps TEXT,
    expected TEXT,
    actual TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- open, triage, in_progress, resolved, closed
    priority TEXT, -- low, medium, high, critical
    metadata JSONB
  );

  -- Campaigns (region-scoped announcements and reward offers)
  CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    region_id TEXT,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    summary TEXT,
    reward_schema JSONB,
    art_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
  );

  -- =========================================================
  -- Storage: Ensure 'media' bucket exists for uploads (photos, reports, etc.)
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('media', 'media', true)
  ON CONFLICT (id) DO NOTHING;

  -- Calendar Items (formerly pod_shifts)
  -- Field operations scheduling, shifts, and general calendar events
  CREATE TABLE IF NOT EXISTS public.calendar_items (
    id TEXT PRIMARY KEY,
    pod_id TEXT REFERENCES public.pods(id) ON DELETE RESTRICT, -- Optional link to pod
    start TIMESTAMPTZ,
    "end" TIMESTAMPTZ,
    tz TEXT,
    headcount INTEGER DEFAULT 1 CHECK (headcount >= 1),
    location TEXT,
    label TEXT,
    dispatch_link TEXT,
    notes TEXT,
    visibility TEXT DEFAULT 'public', -- Legacy visibility enum
    needed INTEGER DEFAULT 0,
    route JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    visibility_scope TEXT DEFAULT 'org_and_region_masked', -- New universal scope
    invited_user_ids TEXT[],
    CONSTRAINT calendar_items_visibility_check CHECK (
      visibility IN ('public','org','private')
    )
  );

  -- Calendar Signups (formerly pod_shift_signups)
  CREATE TABLE IF NOT EXISTS public.calendar_signups (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES public.calendar_items(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT calendar_signups_unique_item_user UNIQUE (item_id, user_id)
  );

  -- AARs (After Action Reports)
  CREATE TABLE IF NOT EXISTS public.aars (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TIMESTAMPTZ,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    visibility_scope TEXT DEFAULT 'org_and_region_masked',
    invited_user_ids TEXT[]
  );

  -- Academy
CREATE TABLE IF NOT EXISTS public.academy_instructors (
  id TEXT PRIMARY KEY,
  profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT,
  type TEXT,
  focus TEXT,
  availability TEXT,
    timezone TEXT,
    certifications JSONB DEFAULT '[]',
  registration_status TEXT,
  vetting_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT academy_instructor_type_check CHECK (
    type IS NULL OR type IN ('dispatcher','mentor','expert')
  ),
    CONSTRAINT academy_instructor_availability_check CHECK (
      availability IS NULL OR availability IN ('available','limited','unavailable')
    ),
    CONSTRAINT academy_instructor_registration_check CHECK (
      registration_status IS NULL OR registration_status IN ('registered','unregistered','pending')
    ),
    CONSTRAINT academy_instructor_vetting_check CHECK (
      vetting_status IS NULL OR vetting_status IN ('awaiting_verification','needs_review','cleared')
    )
  );

CREATE TABLE IF NOT EXISTS public.academy_classes (
  id TEXT PRIMARY KEY,
  pathway_id TEXT,
  pathway_label TEXT,
  track_label TEXT,
    variant TEXT,
    title TEXT,
    description TEXT,
    modality TEXT,
    instructor_type TEXT,
  duration_hours DOUBLE PRECISION,
    capacity INTEGER,
    start_date TEXT,
    start_time TEXT,
    location TEXT,
    meeting_url TEXT,
    notes TEXT,
    instructor_name TEXT,
  sessions_scheduled INTEGER DEFAULT 0,
  next_session TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  visibility_scope TEXT DEFAULT 'org_and_region_masked',
  invited_user_ids TEXT[],
  CONSTRAINT academy_class_modality_check CHECK (
    modality IS NULL OR modality IN ('in_person','online','hybrid')
  ),
    CONSTRAINT academy_class_instructor_type_check CHECK (
      instructor_type IS NULL OR instructor_type IN ('dispatcher','mentor','expert')
    ),
    CONSTRAINT academy_class_status_check CHECK (
    status IS NULL OR status IN ('draft','needs_instructor','scheduled','completed')
  )
  );

  -- Owners Tables (Polymorphic)
  CREATE TABLE IF NOT EXISTS public.dispatch_owners (
    resource_id TEXT NOT NULL REFERENCES public.dispatch_submissions(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    PRIMARY KEY (resource_id, owner_type, owner_id)
  );

  CREATE TABLE IF NOT EXISTS public.academy_owners (
    resource_id TEXT NOT NULL REFERENCES public.academy_classes(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    PRIMARY KEY (resource_id, owner_type, owner_id)
  );

  CREATE TABLE IF NOT EXISTS public.calendar_owners (
    resource_id TEXT NOT NULL REFERENCES public.calendar_items(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    PRIMARY KEY (resource_id, owner_type, owner_id)
  );

  CREATE TABLE IF NOT EXISTS public.aar_owners (
    resource_id TEXT NOT NULL REFERENCES public.aars(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    PRIMARY KEY (resource_id, owner_type, owner_id)
  );

  CREATE TABLE IF NOT EXISTS public.logistics_item_owners (
    resource_id TEXT NOT NULL REFERENCES public.dispatch_logistics(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    PRIMARY KEY (resource_id, owner_type, owner_id)
  );


CREATE TABLE IF NOT EXISTS public.academy_sessions (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES public.academy_classes(id) ON DELETE CASCADE,
    title TEXT,
    start TIMESTAMPTZ,
    "end" TIMESTAMPTZ,
    modality TEXT,
    location TEXT,
    meeting_url TEXT,
    instructor_name TEXT,
    instructor_type TEXT,
    status TEXT,
    seats JSONB,
  timezone TEXT,
  related_topic TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  visibility_scope TEXT DEFAULT 'org_and_region_masked',
  invited_user_ids TEXT[],
    CONSTRAINT academy_session_seats_json_check CHECK (
      seats IS NULL OR jsonb_typeof(seats) = 'object'
    ),
    CONSTRAINT academy_session_modality_check CHECK (
      modality IS NULL OR modality IN ('in_person','online','hybrid')
    ),
    CONSTRAINT academy_session_status_check CHECK (
      status IS NULL OR status IN ('scheduled','in_progress','completed','archived')
    ),
    CONSTRAINT academy_session_instructor_type_check CHECK (
      instructor_type IS NULL OR instructor_type IN ('dispatcher','mentor','expert')
    )
  );

  -- Allow sessions without a class; no default class_id

CREATE TABLE IF NOT EXISTS public.academy_participants (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES public.academy_sessions(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT,
  signal_handle TEXT,
  understanding TEXT,
  status TEXT,
    CONSTRAINT academy_participant_understanding_check CHECK (
      understanding IS NULL OR understanding IN ('needs_support','building','confident')
    ),
    CONSTRAINT academy_participant_status_check CHECK (
      status IS NULL OR status IN ('confirmed','waitlist')
    )
  );

  -- Academy content (teleprompter pulls)
  CREATE TABLE IF NOT EXISTS public.academy_lessons (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    content_md TEXT,
    content TEXT,
    body_md TEXT,
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
  );

  -- Legacy lessons fallback (older content source)
  CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    content_md TEXT,
    content TEXT,
    body_md TEXT,
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
  );

  -- Missing person records
CREATE TABLE IF NOT EXISTS public.missing_person_records (
  case_id TEXT PRIMARY KEY,
    detention_datetime TIMESTAMPTZ,
    detention_location TEXT,
    arresting_agency TEXT,
    witness_contacts JSONB,
    dispatcher_contact JSONB,
    full_name TEXT,
    aliases TEXT[],
    date_of_birth TEXT,
    country_of_birth TEXT,
    gender_identity TEXT,
    pronouns TEXT,
    languages_spoken TEXT[],
    a_number TEXT,
    photo_url TEXT,
    physical_description TEXT,
    last_known_facility TEXT,
    last_known_city TEXT,
    arresting_officers TEXT[],
    stated_reason_for_detention TEXT,
    known_transfers JSONB,
    belongings_left_behind TEXT,
    dependents_left_behind TEXT,
    family_contacts JSONB,
    prior_attorney TEXT,
    preferred_legal_aid_orgs TEXT[],
    interpreter_needed BOOLEAN,
    urgent_needs TEXT[],
    information_sources JSONB,
    last_updated TIMESTAMPTZ,
  confidence_rating DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,
  version INTEGER,
  deleted_at TIMESTAMPTZ
);

  -- Regional advocacy groups (per region app)
  -- Stores trusted orgs that should receive missing-person reports when finalized.
  CREATE TABLE IF NOT EXISTS public.advocacy_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    -- e.g., 'legal_aid','civil_rights','immigrant_justice','media_advocacy','public_defender'
    type TEXT,
    jurisdiction TEXT,
    contact_emails TEXT[],
    contact_signal TEXT,
    -- preferred report delivery format: 'pdf', 'web', or 'feed'
    preferred_format TEXT,
    active_status BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );

  -- Delivery logs for auditing where reports were sent upon finalization
CREATE TABLE IF NOT EXISTS public.advocacy_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.advocacy_groups(id) ON DELETE SET NULL,
  case_id TEXT REFERENCES public.missing_person_records(case_id) ON DELETE CASCADE,
    format TEXT,
    status TEXT,
    details JSONB,
    attempted_at TIMESTAMPTZ DEFAULT now()
  );

  -- Trust signatures
CREATE TABLE IF NOT EXISTS public.trust_signatures (
  subject_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  signer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  signer_role TEXT,
  signer_rot TEXT,
  signed_at TIMESTAMPTZ,
  signed_entry_hash TEXT,
  status TEXT,
  deleted_at TIMESTAMPTZ,
  PRIMARY KEY (subject_id, signer_id),
    CONSTRAINT trust_signatures_role_check CHECK (
      signer_role IS NULL OR signer_role IN ('regional_admin','pod_leader','trainer')
    ),
    CONSTRAINT trust_signatures_status_check CHECK (
      status IS NULL OR status IN ('active','inactive')
    )
  );

  -- =========================================================
  -- PostGIS support and location_geog best-effort migration
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
      BEGIN
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS postgis';
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'PostGIS extension not created or unavailable: %', SQLERRM;
      END;
    END IF;
  END $$;

  -- Add geography column if missing
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'dispatch_submissions' AND column_name = 'location_geog'
    ) THEN
      ALTER TABLE public.dispatch_submissions ADD COLUMN location_geog geography(POINT,4326);
    END IF;
  END $$;

  -- Populate location_geog from common JSON patterns
  DO $$
  DECLARE
    r RECORD;
    lon NUMERIC;
    lat NUMERIC;
  BEGIN
    FOR r IN SELECT id, location FROM public.dispatch_submissions WHERE location IS NOT NULL LOOP
      BEGIN
        lon := NULL; lat := NULL;
        BEGIN
          lon := (r.location -> 'coordinates' ->> 0)::numeric;
          lat := (r.location -> 'coordinates' ->> 1)::numeric;
        EXCEPTION WHEN OTHERS THEN
          lon := NULL; lat := NULL;
        END;

        IF lon IS NULL OR lat IS NULL THEN
          BEGIN
            lat := (r.location -> 'coords' ->> 0)::numeric;
            lon := (r.location -> 'coords' ->> 1)::numeric;
          EXCEPTION WHEN OTHERS THEN
            lat := NULL; lon := NULL;
          END;
        END IF;

        IF lon IS NOT NULL AND lat IS NOT NULL THEN
          UPDATE public.dispatch_submissions
          SET location_geog = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
          WHERE id = r.id AND (location_geog IS NULL);
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not parse location for id %: %', r.id, SQLERRM;
      END;
    END LOOP;
  END $$;

-- Warehouse Schema Migration
-- Date: 2025-11-22

-- Warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
    id TEXT PRIMARY KEY,
    region_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    region_zone TEXT,
    urban_type TEXT,
    capabilities JSONB DEFAULT '[]',
    max_capacity_rating TEXT,
    visibility_scope TEXT DEFAULT 'regional',
    invited_user_ids TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Warehouse Zones
CREATE TABLE IF NOT EXISTS public.warehouse_zones (
    id TEXT PRIMARY KEY,
    warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Warehouse Bins
CREATE TABLE IF NOT EXISTS public.warehouse_bins (
    id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL REFERENCES public.warehouse_zones(id) ON DELETE RESTRICT,
    label TEXT NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Warehouse Inventory
CREATE TABLE IF NOT EXISTS public.warehouse_inventory (
    id TEXT PRIMARY KEY,
    warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    zone_id TEXT REFERENCES public.warehouse_zones(id) ON DELETE RESTRICT,
    bin_id TEXT REFERENCES public.warehouse_bins(id) ON DELETE RESTRICT,
    item_name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    condition TEXT,
    quantity INTEGER DEFAULT 0,
    expiration_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Warehouse Movement Logs
CREATE TABLE IF NOT EXISTS public.warehouse_movement_logs (
    id TEXT PRIMARY KEY,
    warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    inventory_id TEXT REFERENCES public.warehouse_inventory(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- intake, outflow, move, adjustment
    sku TEXT,
    item_name TEXT,
    quantity INTEGER,
    by_display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    zone_id TEXT,
    bin_id TEXT,
    deleted_at TIMESTAMPTZ
);

-- Warehouse Pick Lists
CREATE TABLE IF NOT EXISTS public.warehouse_pick_lists (
    id TEXT PRIMARY KEY,
    inventory_id TEXT REFERENCES public.warehouse_inventory(id) ON DELETE SET NULL,
    warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE RESTRICT,
    zone_id TEXT,
    bin_id TEXT,
    item_name TEXT,
    sku TEXT,
    quantity INTEGER,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Warehouse Owners (Polymorphic Ownership)
CREATE TABLE IF NOT EXISTS public.warehouse_owners (
    warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    owner_type TEXT NOT NULL,       -- 'user','pod','org'
    owner_id TEXT NOT NULL,         -- profile.id, pods.id, organizations.id
    PRIMARY KEY (warehouse_id, owner_type, owner_id)
);

-- Indexes
-- Warehouse Item Catalog
CREATE TABLE IF NOT EXISTS public.warehouse_item_catalog (
    sku TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Data
INSERT INTO public.warehouse_item_catalog (sku, item_name, category) VALUES
('water-1L-bottle', 'Bottled Water 1L', 'water'),
('water-500ml-bottle', 'Bottled Water 500ml', 'water'),
('electrolyte-packets', 'Electrolyte Packets', 'water'),
('hydration-jug-5gal', '5 Gallon Water Jug', 'water'),
('food-snack-bars', 'Snack Bars', 'food'),
('food-vegan-meals', 'Shelf-Stable Vegan Meal', 'food'),
('food-rice-bags', 'Rice Bags', 'food'),
('food-pasta', 'Dry Pasta', 'food'),
('food-infant-formula', 'Infant Formula', 'food'),
('hygiene-toothbrush', 'Toothbrush', 'hygiene'),
('hygiene-toothpaste', 'Toothpaste', 'hygiene'),
('hygiene-soap-bars', 'Soap Bars', 'hygiene'),
('hygiene-wet-wipes', 'Wet Wipes', 'hygiene'),
('hygiene-menstrual-pads', 'Menstrual Pads', 'hygiene'),
('hygiene-diapers', 'Diapers', 'hygiene'),
('med-firstaid-kit-basic', 'Basic First Aid Kit', 'medical'),
('med-bandages-assorted', 'Assorted Bandages', 'medical'),
('med-gauze-rolls', 'Gauze Rolls', 'medical'),
('med-antiseptic-wipes', 'Antiseptic Wipes', 'medical'),
('med-gloves-nitrile', 'Nitrile Gloves', 'medical'),
('med-saline', 'Saline Bottles', 'medical'),
('med-oral-rehydration', 'Oral Rehydration Salts', 'medical'),
('warmth-blankets-mylar', 'Mylar Emergency Blankets', 'warmth'),
('warmth-blankets-heavy', 'Heavy Blankets', 'warmth'),
('warmth-gloves', 'Warm Gloves', 'warmth'),
('warmth-hats', 'Warm Hats', 'warmth'),
('warmth-socks', 'Thermal Socks', 'warmth'),
('warmth-handwarmers', 'Hand Warmers', 'warmth'),
('kid-coloring-kits', 'Coloring Kits', 'kid-support'),
('kid-small-toys', 'Small Toys', 'kid-support'),
('kid-snacks', 'Kid Snacks', 'kid-support'),
('ppe-masks-n95', 'N95 Masks', 'ppe'),
('ppe-earplugs', 'Ear Plugs', 'ppe'),
('ppe-goggles', 'Protective Goggles', 'ppe'),
('ppe-safety-vests', 'Safety Vests', 'ppe'),
('ppe-rainponchos', 'Rain Ponchos', 'ppe'),
('logistics-canopies', 'Pop-Up Canopies', 'logistics'),
('logistics-tables', 'Folding Tables', 'logistics'),
('logistics-chairs', 'Folding Chairs', 'logistics'),
('logistics-tarps', 'Tarps', 'logistics'),
('logistics-totes', 'Plastic Storage Totes', 'logistics'),
('logistics-batteries-aa', 'AA Batteries', 'logistics'),
('logistics-batteries-powerbanks', 'Portable Power Banks', 'logistics'),
('comms-radios-baofeng', 'Baofeng Radios', 'comms'),
('comms-meshtastic-nodes', 'Meshtastic Nodes', 'comms'),
('comms-chargers', 'Radio Chargers', 'comms'),
('comms-batteries', 'Radio Batteries', 'comms'),
('tools-flashlights', 'Flashlights', 'tools'),
('tools-headlamps', 'Headlamps', 'tools'),
('tools-multitools', 'Multi-Tools', 'tools'),
('tools-tape-duct', 'Duct Tape', 'tools'),
('tools-zip-ties', 'Zip Ties', 'tools'),
('comfort-hot-drinks', 'Instant Hot Drink Mix', 'comfort'),
('comfort-disposable-cups', 'Disposable Cups', 'comfort'),
('comfort-blankets', 'Comfort Blankets', 'comfort'),
('comfort-notepads', 'Mini Notepads', 'comfort'),
('admin-clipboards', 'Clipboards', 'admin'),
('admin-pens', 'Pens', 'admin'),
('admin-sharpies', 'Sharpies', 'admin'),
('admin-forms', 'Paper Forms', 'admin')
ON CONFLICT (sku) DO NOTHING;
