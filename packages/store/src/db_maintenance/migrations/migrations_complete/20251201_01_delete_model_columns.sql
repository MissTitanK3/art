-- Delete Model Modernization: add archive columns and missing FK fields
-- Date: 2025-12-01
-- Adds deleted_at for archive-first parents and introduces profile/relationship columns needed for downstream FKs.

BEGIN;

-- Archive-first parents: never hard delete, always mark deleted_at
ALTER TABLE public.pods ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.roster_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.pod_shifts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.dispatch_submissions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.dispatch_shifts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.academy_classes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.missing_person_records ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.meet_a_need ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.trust_signatures ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Warehouse domain archive columns
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.warehouse_zones ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.warehouse_bins ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.warehouse_inventory ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.warehouse_movement_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.warehouse_pick_lists ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add missing profile references for academy entities (to be FK constrained later)
ALTER TABLE public.academy_participants ADD COLUMN IF NOT EXISTS profile_id TEXT;
ALTER TABLE public.academy_instructors ADD COLUMN IF NOT EXISTS profile_id TEXT;

-- Add missing relationship handles for warehouse activity tables
ALTER TABLE public.warehouse_movement_logs ADD COLUMN IF NOT EXISTS inventory_id TEXT;
ALTER TABLE public.warehouse_pick_lists ADD COLUMN IF NOT EXISTS user_id TEXT;

COMMIT;
