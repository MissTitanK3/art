-- Region functions and triggers
-- Run after init_region.sql so tables exist

-- =========================================================
-- Auditing: touch updated_at on UPDATE for key tables (idempotent)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_com_teams_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_com_teams_updated BEFORE UPDATE ON public.com_teams FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_com_operators_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_com_operators_updated BEFORE UPDATE ON public.com_operators FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_com_channels_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_com_channels_updated BEFORE UPDATE ON public.com_channels FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_com_briefings_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_com_briefings_updated BEFORE UPDATE ON public.com_briefings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_organizations_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_organization_polls_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_organization_polls_updated BEFORE UPDATE ON public.organization_polls FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_campaigns_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_region_settings_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_region_settings_updated BEFORE UPDATE ON public.region_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_volunteer_attributions_updated') THEN
    EXECUTE 'CREATE TRIGGER trg_volunteer_attributions_updated BEFORE UPDATE ON public.volunteer_attributions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()';
  END IF;
END $$;

-- =========================================================
-- Auto-populate location_geog on insert/update (best-effort)
CREATE OR REPLACE FUNCTION public.set_dispatch_location_geog()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_dispatch_set_location_geog'
  ) THEN
    EXECUTE 'CREATE TRIGGER trg_dispatch_set_location_geog BEFORE INSERT OR UPDATE ON public.dispatch_submissions FOR EACH ROW EXECUTE FUNCTION public.set_dispatch_location_geog()';
  END IF;
END $$;

-- =========================================================
-- Warehouse ownership helper (used by RLS policies)
CREATE OR REPLACE FUNCTION public.is_warehouse_owner(p_warehouse_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id TEXT;
BEGIN
  SELECT id INTO v_profile_id FROM public.profiles WHERE user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_profile_id
    AND access_role IN ('admin', 'regional_admin', 'national_admin')
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.warehouse_owners wo
    WHERE wo.warehouse_id = p_warehouse_id
    AND (
      (wo.owner_type = 'user' AND wo.owner_id = v_profile_id)
      OR
      (wo.owner_type = 'pod' AND wo.owner_id IN (
        SELECT pod_id
        FROM public.roster_entries
        WHERE profile_id = v_profile_id
          AND status = 'active'
          AND role = 'lead'
      ))
      OR
      (wo.owner_type = 'org' AND wo.owner_id IN (
        SELECT org_id FROM public.organization_roles WHERE user_id = v_profile_id
      ))
    )
  );
END $$;

-- =========================================================
-- Archive delete helper + RPC wrappers (mirrors migration 20251201_04)
CREATE OR REPLACE FUNCTION public._assert_archive_permission()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (
        ARRAY['pod_leader','trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin']
      )
  ) THEN
    RAISE EXCEPTION 'not authorized to archive records' USING ERRCODE = '42501';
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION public._assert_archive_permission() TO authenticated;

CREATE OR REPLACE FUNCTION public.safe_delete_pod(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.pods SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_roster_entry(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.roster_entries SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_pod_shift(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.calendar_items SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_dispatch_submission(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.dispatch_submissions SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_dispatch_shift(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.dispatch_shifts SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_organization(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.organizations SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_academy_class(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.academy_classes SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_warehouse(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.warehouses SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_warehouse_zone(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.warehouse_zones SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_warehouse_bin(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.warehouse_bins SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_warehouse_inventory(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.warehouse_inventory SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_warehouse_movement_log(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.warehouse_movement_logs SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_warehouse_pick_list(p_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.warehouse_pick_lists SET deleted_at = now() WHERE id = p_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_missing_person_record(p_case_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.missing_person_records SET deleted_at = now() WHERE case_id = p_case_id;
END $$;

CREATE OR REPLACE FUNCTION public.safe_delete_meet_a_need(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._assert_archive_permission();
  UPDATE public.meet_a_need SET deleted_at = now() WHERE id = p_id;
END $$;

GRANT EXECUTE ON FUNCTION public.safe_delete_pod(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_roster_entry(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_pod_shift(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_dispatch_submission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_dispatch_shift(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_organization(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_academy_class(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_warehouse(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_warehouse_zone(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_warehouse_bin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_warehouse_inventory(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_warehouse_movement_log(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_warehouse_pick_list(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_missing_person_record(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_delete_meet_a_need(UUID) TO authenticated;
