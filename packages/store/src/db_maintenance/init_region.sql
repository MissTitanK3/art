  -- Always Ready Tools: Region Database Schema
  -- Version: 2025-10-24
  -- Each region runs its own instance using this schema.
  -- This script is idempotent and safe to re-run.
  -- =========================================================

  -- Profiles
  CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    display_name TEXT NOT NULL,
    access_role TEXT NOT NULL DEFAULT 'team_member',
    field_roles JSONB DEFAULT '[]',
    verified_by TEXT DEFAULT 'self',
    affiliation TEXT,
    availability BOOLEAN DEFAULT TRUE,
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
    CONSTRAINT profiles_access_role_check CHECK (
      access_role IN ('team_member','dispatcher_basic','dispatcher_verified','dispatcher_admin')
    ),
    CONSTRAINT profiles_verified_by_check CHECK (
      verified_by IN ('self','partner_org','admin')
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

  -- Pods
  CREATE TABLE IF NOT EXISTS public.pods (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    area TEXT,
    channels JSONB DEFAULT '[]'
  );

  -- Roster
  CREATE TABLE IF NOT EXISTS public.roster_entries (
    id TEXT PRIMARY KEY,
    pod_id TEXT REFERENCES public.pods(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
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
    signal_handle TEXT
  );

  -- Dispatch submissions
  CREATE TABLE IF NOT EXISTS public.dispatch_submissions (
    id TEXT PRIMARY KEY,
    type TEXT,
    location JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    required_roles JSONB,
    encrypted_payload TEXT,
    auto_delete_after TIMESTAMPTZ,
    integrity_hash TEXT,
    submitted_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    source TEXT,
    visibility_radius_km DOUBLE PRECISION,
    status TEXT,
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
    training BOOLEAN DEFAULT FALSE,
    flagged BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT dispatch_status_check CHECK (
      status IS NULL OR status IN (
        'preplanning','unconfirmed','confirmed','mobilizing','in_progress','debriefing','completed','cancelled','expired','archived'
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
    )
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
    pod_id TEXT REFERENCES public.pods(id),
    volunteer_id TEXT REFERENCES public.profiles(id),
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Academy
  CREATE TABLE IF NOT EXISTS public.academy_instructors (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    focus TEXT,
    availability TEXT,
    timezone TEXT,
    certifications JSONB DEFAULT '[]',
    registration_status TEXT,
    vetting_status TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
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

  CREATE TABLE IF NOT EXISTS public.academy_participants (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES public.academy_sessions(id) ON DELETE CASCADE,
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
    version INTEGER
  );

  -- Trust signatures
  CREATE TABLE IF NOT EXISTS public.trust_signatures (
    subject_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    signer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    signer_role TEXT,
    signer_rot TEXT,
    signed_at TIMESTAMPTZ,
    signed_entry_hash TEXT,
    status TEXT,
    PRIMARY KEY (subject_id, signer_id),
    CONSTRAINT trust_signatures_role_check CHECK (
      signer_role IS NULL OR signer_role IN ('regional_admin','pod_leader','trainer')
    ),
    CONSTRAINT trust_signatures_status_check CHECK (
      status IS NULL OR status IN ('active','inactive')
    )
  );

  -- =========================================================
  -- Add indexes (idempotent)
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'i' AND c.relname = 'idx_profiles_user_id'
    ) THEN
      EXECUTE 'CREATE INDEX idx_profiles_user_id ON public.profiles (user_id)';
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
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_timestamp'
    ) THEN
      EXECUTE 'CREATE INDEX idx_dispatch_timestamp ON public.dispatch_submissions (timestamp)';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_status'
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

    -- Optional performance index: roster joined_at timeline queries
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_roster_joined_at'
    ) THEN
      EXECUTE 'CREATE INDEX idx_roster_joined_at ON public.roster_entries (joined_at DESC)';
    END IF;
  END $$;

  -- =========================================================
  -- Backfill: add missing audit columns/constraints if tables already exist
  DO $$
  BEGIN
    -- dispatch_updates.updated_at
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'dispatch_updates' AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.dispatch_updates ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- dispatch_logistics.created_at
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'dispatch_logistics' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.dispatch_logistics ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- dispatch_shifts.created_at
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'dispatch_shifts' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.dispatch_shifts ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- academy_instructors.created_at
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'academy_instructors' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.academy_instructors ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- academy_sessions.created_at
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'academy_sessions' AND column_name = 'created_at'
    ) THEN
      ALTER TABLE public.academy_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- academy_sessions.updated_at
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'academy_sessions' AND column_name = 'updated_at'
    ) THEN
      ALTER TABLE public.academy_sessions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- academy_sessions.seats JSON type check
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'academy_session_seats_json_check' AND conrelid = 'public.academy_sessions'::regclass
    ) THEN
      ALTER TABLE public.academy_sessions
      ADD CONSTRAINT academy_session_seats_json_check CHECK (
        seats IS NULL OR jsonb_typeof(seats) = 'object'
      );
    END IF;
  END $$;

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

  -- Create GIST index for spatial queries if not exists
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_dispatch_location_geog'
    ) THEN
      CREATE INDEX idx_dispatch_location_geog ON public.dispatch_submissions USING gist (location_geog);
    END IF;
  END $$;


  -- =========================================================
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

  -- =========================================================
  -- Auditing: touch updated_at on UPDATE for key tables (idempotent)
  CREATE OR REPLACE FUNCTION public.touch_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated') THEN
      EXECUTE 'CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_roster_entries_updated') THEN
      EXECUTE 'CREATE TRIGGER trg_roster_entries_updated BEFORE UPDATE ON public.roster_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dispatch_submissions_updated') THEN
      EXECUTE 'CREATE TRIGGER trg_dispatch_submissions_updated BEFORE UPDATE ON public.dispatch_submissions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dispatch_logistics_updated') THEN
      EXECUTE 'CREATE TRIGGER trg_dispatch_logistics_updated BEFORE UPDATE ON public.dispatch_logistics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dispatch_updates_updated') THEN
      EXECUTE 'CREATE TRIGGER trg_dispatch_updates_updated BEFORE UPDATE ON public.dispatch_updates FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_academy_classes_updated') THEN
      EXECUTE 'CREATE TRIGGER trg_academy_classes_updated BEFORE UPDATE ON public.academy_classes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_academy_sessions_updated') THEN
      EXECUTE 'CREATE TRIGGER trg_academy_sessions_updated BEFORE UPDATE ON public.academy_sessions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
    END IF;
  END $$;

  -- =========================================================
  -- Auto-populate location_geog on insert/update (best-effort)
  CREATE OR REPLACE FUNCTION public.set_dispatch_location_geog()
  RETURNS TRIGGER AS $$
  DECLARE lon NUMERIC; lat NUMERIC;
  BEGIN
    IF NEW.location IS NOT NULL THEN
      BEGIN
        lon := (NEW.location -> 'coordinates' ->> 0)::numeric;
        lat := (NEW.location -> 'coordinates' ->> 1)::numeric;
      EXCEPTION WHEN OTHERS THEN
        lon := NULL; lat := NULL;
      END;
      IF lon IS NULL OR lat IS NULL THEN
        BEGIN
          lat := (NEW.location -> 'coords' ->> 0)::numeric;
          lon := (NEW.location -> 'coords' ->> 1)::numeric;
        EXCEPTION WHEN OTHERS THEN
          lat := NULL; lon := NULL;
        END;
      END IF;
      IF lon IS NOT NULL AND lat IS NOT NULL THEN
        NEW.location_geog := ST_SetSRID(ST_MakePoint(lon, lat), 4326);
      END IF;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dispatch_set_location_geog'
    ) THEN
      EXECUTE 'CREATE TRIGGER trg_dispatch_set_location_geog BEFORE INSERT OR UPDATE ON public.dispatch_submissions FOR EACH ROW EXECUTE FUNCTION public.set_dispatch_location_geog()';
    END IF;
  END $$;
