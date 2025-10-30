-- Comms module additive migration: creates comms tables if missing and basic indexes
-- Safe to re-run; policies are defined in init_rls.sql and not duplicated here.

CREATE TABLE IF NOT EXISTS public.com_teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT,
  encryption_mode TEXT,
  assigned_dispatch_lead TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
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

-- Indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_logs_event_id'
  ) THEN
    CREATE INDEX idx_com_logs_event_id ON public.com_logs (event_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_logs_timestamp'
  ) THEN
    CREATE INDEX idx_com_logs_timestamp ON public.com_logs (timestamp DESC);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_operators_team_id'
  ) THEN
    CREATE INDEX idx_com_operators_team_id ON public.com_operators (team_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c WHERE c.relkind = 'i' AND c.relname = 'idx_com_channels_team_id'
  ) THEN
    CREATE INDEX idx_com_channels_team_id ON public.com_channels (team_id);
  END IF;
END $$;

-- Enable RLS on new tables (policies defined in init_rls.sql)
ALTER TABLE public.com_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.com_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.com_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.com_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.com_briefings ENABLE ROW LEVEL SECURITY;

