-- Foreign Key Hardening (NOT VALID first)
-- Date: 2025-12-01
-- Adds/updates FKs with standardized delete rules and inline guidance comments.

BEGIN;

-- Archive-only parent, do NOT cascade delete identities
DO $drop_profiles_policies$
DECLARE
  pol RECORD;
BEGIN
  -- Drop any policies that reference profiles.user_id (including on other tables) to unblock type change
  FOR pol IN
    SELECT p.polname,
           nrel.nspname AS relschema,
           crel.relname AS relname
    FROM pg_policy p
    JOIN pg_depend d
      ON d.objid = p.oid
     AND d.refobjid = 'public.profiles'::regclass
    JOIN pg_attribute a
      ON a.attrelid = d.refobjid
     AND a.attnum = d.refobjsubid
    JOIN pg_class crel
      ON crel.oid = p.polrelid
    JOIN pg_namespace nrel
      ON nrel.oid = crel.relnamespace
    WHERE a.attname = 'user_id'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.polname, pol.relschema, pol.relname);
  END LOOP;
  -- Also drop any remaining policies directly on profiles (fallback)
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END
$drop_profiles_policies$;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.profiles
  ALTER COLUMN user_id TYPE uuid USING NULLIF(user_id, '')::uuid;
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_user_id_auth
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.pods DROP CONSTRAINT IF EXISTS pods_created_by_fkey;
ALTER TABLE public.pods
  ADD CONSTRAINT fk_pods_created_by_profile
  FOREIGN KEY (created_by)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.roster_entries DROP CONSTRAINT IF EXISTS roster_entries_pod_id_fkey;
ALTER TABLE public.roster_entries
  ADD CONSTRAINT fk_roster_entries_pod
  FOREIGN KEY (pod_id)
  REFERENCES public.pods(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Pod leaders leaving: keep roster history, null profile if removed
ALTER TABLE public.roster_entries DROP CONSTRAINT IF EXISTS roster_entries_profile_id_fkey;
ALTER TABLE public.roster_entries
  ADD CONSTRAINT fk_roster_entries_profile
  FOREIGN KEY (profile_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.pod_shifts DROP CONSTRAINT IF EXISTS pod_shifts_pod_id_fkey;
ALTER TABLE public.pod_shifts
  ADD CONSTRAINT fk_pod_shifts_pod
  FOREIGN KEY (pod_id)
  REFERENCES public.pods(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Owned child of pod_shifts, safe to cascade delete
ALTER TABLE public.pod_shift_signups DROP CONSTRAINT IF EXISTS pod_shift_signups_shift_id_fkey;
ALTER TABLE public.pod_shift_signups
  ADD CONSTRAINT fk_pod_shift_signups_shift
  FOREIGN KEY (shift_id)
  REFERENCES public.pod_shifts(id)
  ON DELETE CASCADE
  NOT VALID;

-- Pod shift signup tied to profile; keep row but null reference when profile removed
ALTER TABLE public.pod_shift_signups DROP CONSTRAINT IF EXISTS pod_shift_signups_user_id_fkey;
ALTER TABLE public.pod_shift_signups
  ADD CONSTRAINT fk_pod_shift_signups_profile
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL
  NOT VALID;

-- Child of dispatch_submissions, safe to cascade delete
ALTER TABLE public.dispatch_updates DROP CONSTRAINT IF EXISTS dispatch_updates_dispatch_id_fkey;
ALTER TABLE public.dispatch_updates
  ADD CONSTRAINT fk_dispatch_updates_submission
  FOREIGN KEY (dispatch_id)
  REFERENCES public.dispatch_submissions(id)
  ON DELETE CASCADE
  NOT VALID;

-- Child of dispatch_submissions, safe to cascade delete
ALTER TABLE public.dispatch_logistics DROP CONSTRAINT IF EXISTS dispatch_logistics_dispatch_id_fkey;
ALTER TABLE public.dispatch_logistics
  ADD CONSTRAINT fk_dispatch_logistics_submission
  FOREIGN KEY (dispatch_id)
  REFERENCES public.dispatch_submissions(id)
  ON DELETE CASCADE
  NOT VALID;

-- Child of dispatch_submissions, safe to cascade delete
ALTER TABLE public.com_logs DROP CONSTRAINT IF EXISTS com_logs_event_id_fkey;
ALTER TABLE public.com_logs
  ADD CONSTRAINT fk_com_logs_dispatch_submission
  FOREIGN KEY (event_id)
  REFERENCES public.dispatch_submissions(id)
  ON DELETE CASCADE
  NOT VALID;

-- Child of dispatch_submissions, safe to cascade delete
ALTER TABLE public.com_briefings DROP CONSTRAINT IF EXISTS com_briefings_event_id_fkey;
ALTER TABLE public.com_briefings
  ADD CONSTRAINT fk_com_briefings_dispatch_submission
  FOREIGN KEY (event_id)
  REFERENCES public.dispatch_submissions(id)
  ON DELETE CASCADE
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.dispatch_shifts DROP CONSTRAINT IF EXISTS dispatch_shifts_pod_id_fkey;
ALTER TABLE public.dispatch_shifts
  ADD CONSTRAINT fk_dispatch_shifts_pod
  FOREIGN KEY (pod_id)
  REFERENCES public.pods(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.academy_sessions DROP CONSTRAINT IF EXISTS academy_sessions_class_id_fkey;
ALTER TABLE public.academy_sessions
  ADD CONSTRAINT fk_academy_sessions_class
  FOREIGN KEY (class_id)
  REFERENCES public.academy_classes(id)
  ON DELETE CASCADE
  NOT VALID;

-- Child of academy_sessions, safe to cascade delete
ALTER TABLE public.academy_participants DROP CONSTRAINT IF EXISTS academy_participants_session_id_fkey;
ALTER TABLE public.academy_participants
  ADD CONSTRAINT fk_academy_participants_session
  FOREIGN KEY (session_id)
  REFERENCES public.academy_sessions(id)
  ON DELETE CASCADE
  NOT VALID;

-- Participant profile retained; null reference if profile removed
ALTER TABLE public.academy_participants DROP CONSTRAINT IF EXISTS academy_participants_profile_id_fkey;
ALTER TABLE public.academy_participants
  ADD CONSTRAINT fk_academy_participants_profile
  FOREIGN KEY (profile_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL
  NOT VALID;

-- Instructor profile retained; null reference if profile removed
ALTER TABLE public.academy_instructors DROP CONSTRAINT IF EXISTS academy_instructors_profile_id_fkey;
ALTER TABLE public.academy_instructors
  ADD CONSTRAINT fk_academy_instructors_profile
  FOREIGN KEY (profile_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL
  NOT VALID;

-- Owned by organization, cascade when org archived by service role
ALTER TABLE public.organization_roles DROP CONSTRAINT IF EXISTS organization_roles_org_id_fkey;
ALTER TABLE public.organization_roles
  ADD CONSTRAINT fk_organization_roles_org
  FOREIGN KEY (org_id)
  REFERENCES public.organizations(id)
  ON DELETE CASCADE
  NOT VALID;

-- Organization roles must stay intact; block org role delete when profile missing
ALTER TABLE public.organization_roles DROP CONSTRAINT IF EXISTS organization_roles_user_id_fkey;
ALTER TABLE public.organization_roles
  ADD CONSTRAINT fk_organization_roles_profile
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Child of organization, safe to cascade delete from archive-only parent
ALTER TABLE public.organization_pods DROP CONSTRAINT IF EXISTS organization_pods_org_id_fkey;
ALTER TABLE public.organization_pods
  ADD CONSTRAINT fk_organization_pods_org
  FOREIGN KEY (org_id)
  REFERENCES public.organizations(id)
  ON DELETE CASCADE
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.organization_pods DROP CONSTRAINT IF EXISTS organization_pods_pod_id_fkey;
ALTER TABLE public.organization_pods
  ADD CONSTRAINT fk_organization_pods_pod
  FOREIGN KEY (pod_id)
  REFERENCES public.pods(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.warehouse_zones DROP CONSTRAINT IF EXISTS warehouse_zones_warehouse_id_fkey;
ALTER TABLE public.warehouse_zones
  ADD CONSTRAINT fk_warehouse_zones_warehouse
  FOREIGN KEY (warehouse_id)
  REFERENCES public.warehouses(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.warehouse_bins DROP CONSTRAINT IF EXISTS warehouse_bins_zone_id_fkey;
ALTER TABLE public.warehouse_bins
  ADD CONSTRAINT fk_warehouse_bins_zone
  FOREIGN KEY (zone_id)
  REFERENCES public.warehouse_zones(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Inventory must keep bin linkage; restrict bin deletion
ALTER TABLE public.warehouse_inventory DROP CONSTRAINT IF EXISTS warehouse_inventory_bin_id_fkey;
ALTER TABLE public.warehouse_inventory
  ADD CONSTRAINT fk_warehouse_inventory_bin
  FOREIGN KEY (bin_id)
  REFERENCES public.warehouse_bins(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Archive-only parent, do NOT cascade delete
ALTER TABLE public.warehouse_inventory DROP CONSTRAINT IF EXISTS warehouse_inventory_warehouse_id_fkey;
ALTER TABLE public.warehouse_inventory
  ADD CONSTRAINT fk_warehouse_inventory_warehouse
  FOREIGN KEY (warehouse_id)
  REFERENCES public.warehouses(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Inventory location must remain valid; restrict zone deletion
ALTER TABLE public.warehouse_inventory DROP CONSTRAINT IF EXISTS warehouse_inventory_zone_id_fkey;
ALTER TABLE public.warehouse_inventory
  ADD CONSTRAINT fk_warehouse_inventory_zone
  FOREIGN KEY (zone_id)
  REFERENCES public.warehouse_zones(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Movement logs retain audit trail; null inventory reference if removed
ALTER TABLE public.warehouse_movement_logs DROP CONSTRAINT IF EXISTS warehouse_movement_logs_inventory_id_fkey;
ALTER TABLE public.warehouse_movement_logs
  ADD CONSTRAINT fk_warehouse_movement_logs_inventory
  FOREIGN KEY (inventory_id)
  REFERENCES public.warehouse_inventory(id)
  ON DELETE SET NULL
  NOT VALID;

-- Movement logs tied to warehouse; restrict deletion
ALTER TABLE public.warehouse_movement_logs DROP CONSTRAINT IF EXISTS warehouse_movement_logs_warehouse_id_fkey;
ALTER TABLE public.warehouse_movement_logs
  ADD CONSTRAINT fk_warehouse_movement_logs_warehouse
  FOREIGN KEY (warehouse_id)
  REFERENCES public.warehouses(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Pick lists keep audit; null inventory reference if removed
ALTER TABLE public.warehouse_pick_lists DROP CONSTRAINT IF EXISTS warehouse_pick_lists_inventory_id_fkey;
ALTER TABLE public.warehouse_pick_lists
  ADD CONSTRAINT fk_warehouse_pick_lists_inventory
  FOREIGN KEY (inventory_id)
  REFERENCES public.warehouse_inventory(id)
  ON DELETE SET NULL
  NOT VALID;

-- Pick list creator is optional; null when profile removed
ALTER TABLE public.warehouse_pick_lists DROP CONSTRAINT IF EXISTS warehouse_pick_lists_user_id_fkey;
ALTER TABLE public.warehouse_pick_lists
  ADD CONSTRAINT fk_warehouse_pick_lists_user
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL
  NOT VALID;

-- Trust signatures must keep both profile links; restrict deletion
ALTER TABLE public.trust_signatures DROP CONSTRAINT IF EXISTS trust_signatures_subject_id_fkey;
ALTER TABLE public.trust_signatures
  ADD CONSTRAINT fk_trust_signatures_subject
  FOREIGN KEY (subject_id)
  REFERENCES public.profiles(id)
  ON DELETE RESTRICT
  NOT VALID;

-- Trust signatures must keep both profile links; restrict deletion
ALTER TABLE public.trust_signatures DROP CONSTRAINT IF EXISTS trust_signatures_signer_id_fkey;
ALTER TABLE public.trust_signatures
  ADD CONSTRAINT fk_trust_signatures_signer
  FOREIGN KEY (signer_id)
  REFERENCES public.profiles(id)
  ON DELETE RESTRICT
  NOT VALID;

COMMIT;
