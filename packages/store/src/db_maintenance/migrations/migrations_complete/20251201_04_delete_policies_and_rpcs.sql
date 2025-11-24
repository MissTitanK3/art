-- Delete Guard + RPC wrappers
-- Date: 2025-12-01
-- Locks down direct DELETE paths and provides SECURITY DEFINER archive helpers.

BEGIN;

-- =========================================================
-- Pod lifecycle: remove delete permissions, keep archive-only
DROP POLICY IF EXISTS dispatchers_manage_pods ON public.pods;
DROP POLICY IF EXISTS dispatchers_select_pods ON public.pods;
DROP POLICY IF EXISTS dispatchers_insert_pods ON public.pods;
DROP POLICY IF EXISTS dispatchers_update_pods ON public.pods;
DROP POLICY IF EXISTS pods_delete_block_authenticated ON public.pods;
CREATE POLICY dispatchers_select_pods
ON public.pods
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
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
USING (false);

-- =========================================================
-- Roster entries: remove delete access, preserve archive
DROP POLICY IF EXISTS dispatchers_manage_roster ON public.roster_entries;
DROP POLICY IF EXISTS dispatchers_select_roster ON public.roster_entries;
DROP POLICY IF EXISTS dispatchers_insert_roster ON public.roster_entries;
DROP POLICY IF EXISTS dispatchers_update_roster ON public.roster_entries;
DROP POLICY IF EXISTS roster_entries_delete_block_authenticated ON public.roster_entries;
CREATE POLICY dispatchers_select_roster
ON public.roster_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY dispatchers_insert_roster
ON public.roster_entries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY dispatchers_update_roster
ON public.roster_entries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

CREATE POLICY roster_entries_delete_block_authenticated
ON public.roster_entries
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- Pod shifts: remove delete access
DROP POLICY IF EXISTS team_delete_pod_shifts ON public.pod_shifts;
DROP POLICY IF EXISTS pod_shifts_delete_block_authenticated ON public.pod_shifts;
CREATE POLICY pod_shifts_delete_block_authenticated
ON public.pod_shifts
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- Dispatch submissions: archive-only parents
DROP POLICY IF EXISTS dispatch_submissions_delete_block_authenticated ON public.dispatch_submissions;
CREATE POLICY dispatch_submissions_delete_block_authenticated
ON public.dispatch_submissions
FOR DELETE
TO authenticated
USING (false);

-- Dispatch shifts: archive-only deletes
DROP POLICY IF EXISTS dispatch_shifts_delete_any ON public.dispatch_shifts;
DROP POLICY IF EXISTS dispatch_shifts_delete_block_authenticated ON public.dispatch_shifts;
CREATE POLICY dispatch_shifts_delete_block_authenticated
ON public.dispatch_shifts
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- Academy: archive classes (sessions cascade via service role)
DROP POLICY IF EXISTS academy_classes_delete_block_authenticated ON public.academy_classes;
CREATE POLICY academy_classes_delete_block_authenticated
ON public.academy_classes
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- Organizations: archive-only delete model
DROP POLICY IF EXISTS orgs_delete_manage ON public.organizations;
DROP POLICY IF EXISTS organizations_delete_block_authenticated ON public.organizations;
CREATE POLICY organizations_delete_block_authenticated
ON public.organizations
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- Warehouse tables: replace FOR ALL policies with insert/update + delete blocks
DROP POLICY IF EXISTS warehouse_write_privileged ON public.warehouses;
DROP POLICY IF EXISTS warehouse_write_privileged ON public.warehouses; -- allow idempotent name variants
DROP POLICY IF EXISTS warehouses_write_privileged ON public.warehouses;
DROP POLICY IF EXISTS warehouses_delete_block_authenticated ON public.warehouses;
DROP POLICY IF EXISTS warehouses_insert_privileged ON public.warehouses;
DROP POLICY IF EXISTS warehouses_update_privileged ON public.warehouses;
CREATE POLICY warehouses_insert_privileged
ON public.warehouses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouses_update_privileged
ON public.warehouses
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
ON public.warehouses
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS warehouse_zones_write_privileged ON public.warehouse_zones;
DROP POLICY IF EXISTS warehouse_zones_delete_block_authenticated ON public.warehouse_zones;
DROP POLICY IF EXISTS warehouse_zones_insert_privileged ON public.warehouse_zones;
DROP POLICY IF EXISTS warehouse_zones_update_privileged ON public.warehouse_zones;
CREATE POLICY warehouse_zones_insert_privileged
ON public.warehouse_zones
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_zones_update_privileged
ON public.warehouse_zones
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
ON public.warehouse_zones
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS warehouse_bins_write_privileged ON public.warehouse_bins;
DROP POLICY IF EXISTS warehouse_bins_delete_block_authenticated ON public.warehouse_bins;
DROP POLICY IF EXISTS warehouse_bins_insert_privileged ON public.warehouse_bins;
DROP POLICY IF EXISTS warehouse_bins_update_privileged ON public.warehouse_bins;
CREATE POLICY warehouse_bins_insert_privileged
ON public.warehouse_bins
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_bins_update_privileged
ON public.warehouse_bins
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
ON public.warehouse_bins
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS warehouse_inventory_write_privileged ON public.warehouse_inventory;
DROP POLICY IF EXISTS warehouse_inventory_delete_block_authenticated ON public.warehouse_inventory;
DROP POLICY IF EXISTS warehouse_inventory_insert_privileged ON public.warehouse_inventory;
DROP POLICY IF EXISTS warehouse_inventory_update_privileged ON public.warehouse_inventory;
CREATE POLICY warehouse_inventory_insert_privileged
ON public.warehouse_inventory
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_inventory_update_privileged
ON public.warehouse_inventory
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
ON public.warehouse_inventory
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS warehouse_movement_logs_write_privileged ON public.warehouse_movement_logs;
DROP POLICY IF EXISTS warehouse_movement_logs_delete_block_authenticated ON public.warehouse_movement_logs;
DROP POLICY IF EXISTS warehouse_movement_logs_insert_privileged ON public.warehouse_movement_logs;
DROP POLICY IF EXISTS warehouse_movement_logs_update_privileged ON public.warehouse_movement_logs;
CREATE POLICY warehouse_movement_logs_insert_privileged
ON public.warehouse_movement_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_movement_logs_update_privileged
ON public.warehouse_movement_logs
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
ON public.warehouse_movement_logs
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS warehouse_pick_lists_write_privileged ON public.warehouse_pick_lists;
DROP POLICY IF EXISTS warehouse_pick_lists_delete_block_authenticated ON public.warehouse_pick_lists;
DROP POLICY IF EXISTS warehouse_pick_lists_insert_privileged ON public.warehouse_pick_lists;
DROP POLICY IF EXISTS warehouse_pick_lists_update_privileged ON public.warehouse_pick_lists;
CREATE POLICY warehouse_pick_lists_insert_privileged
ON public.warehouse_pick_lists
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
CREATE POLICY warehouse_pick_lists_update_privileged
ON public.warehouse_pick_lists
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
ON public.warehouse_pick_lists
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- Trust, advocacy, and mutual aid archive-only deletes
DROP POLICY IF EXISTS trust_signatures_delete_block_authenticated ON public.trust_signatures;
CREATE POLICY trust_signatures_delete_block_authenticated
ON public.trust_signatures
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS missing_person_records_delete_block_authenticated ON public.missing_person_records;
CREATE POLICY missing_person_records_delete_block_authenticated
ON public.missing_person_records
FOR DELETE
TO authenticated
USING (false);

DROP POLICY IF EXISTS meet_a_need_delete_block_authenticated ON public.meet_a_need;
CREATE POLICY meet_a_need_delete_block_authenticated
ON public.meet_a_need
FOR DELETE
TO authenticated
USING (false);

-- =========================================================
-- Shared archive auth helper
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

-- =========================================================
-- RPC wrappers for archive-first deletes
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
  UPDATE public.pod_shifts SET deleted_at = now() WHERE id = p_id;
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

COMMIT;
