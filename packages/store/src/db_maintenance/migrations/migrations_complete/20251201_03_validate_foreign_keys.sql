-- Validation pass for FK hardening
-- Date: 2025-12-01
-- Run after orphan cleanup to validate all NOT VALID constraints.

BEGIN;

-- Backfill any legacy academy_sessions.class_id values that point to missing classes
INSERT INTO public.academy_classes (id, title, status, created_at, updated_at)
SELECT missing.class_id, 'Imported legacy class', 'draft', now(), now()
FROM (
  SELECT DISTINCT s.class_id
  FROM public.academy_sessions s
  LEFT JOIN public.academy_classes c ON c.id = s.class_id
  WHERE s.class_id IS NOT NULL AND c.id IS NULL
) missing
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profiles VALIDATE CONSTRAINT fk_profiles_user_id_auth;
ALTER TABLE public.pods VALIDATE CONSTRAINT fk_pods_created_by_profile;
ALTER TABLE public.roster_entries VALIDATE CONSTRAINT fk_roster_entries_pod;
ALTER TABLE public.roster_entries VALIDATE CONSTRAINT fk_roster_entries_profile;
ALTER TABLE public.pod_shifts VALIDATE CONSTRAINT fk_pod_shifts_pod;
ALTER TABLE public.pod_shift_signups VALIDATE CONSTRAINT fk_pod_shift_signups_shift;
ALTER TABLE public.pod_shift_signups VALIDATE CONSTRAINT fk_pod_shift_signups_profile;
ALTER TABLE public.dispatch_updates VALIDATE CONSTRAINT fk_dispatch_updates_submission;
ALTER TABLE public.dispatch_logistics VALIDATE CONSTRAINT fk_dispatch_logistics_submission;
ALTER TABLE public.com_logs VALIDATE CONSTRAINT fk_com_logs_dispatch_submission;
ALTER TABLE public.com_briefings VALIDATE CONSTRAINT fk_com_briefings_dispatch_submission;
ALTER TABLE public.dispatch_shifts VALIDATE CONSTRAINT fk_dispatch_shifts_pod;
ALTER TABLE public.academy_sessions VALIDATE CONSTRAINT fk_academy_sessions_class;
ALTER TABLE public.academy_participants VALIDATE CONSTRAINT fk_academy_participants_session;
ALTER TABLE public.academy_participants VALIDATE CONSTRAINT fk_academy_participants_profile;
ALTER TABLE public.academy_instructors VALIDATE CONSTRAINT fk_academy_instructors_profile;
ALTER TABLE public.organization_roles VALIDATE CONSTRAINT fk_organization_roles_org;
ALTER TABLE public.organization_roles VALIDATE CONSTRAINT fk_organization_roles_profile;
ALTER TABLE public.organization_pods VALIDATE CONSTRAINT fk_organization_pods_org;
ALTER TABLE public.organization_pods VALIDATE CONSTRAINT fk_organization_pods_pod;
ALTER TABLE public.warehouse_zones VALIDATE CONSTRAINT fk_warehouse_zones_warehouse;
ALTER TABLE public.warehouse_bins VALIDATE CONSTRAINT fk_warehouse_bins_zone;
ALTER TABLE public.warehouse_inventory VALIDATE CONSTRAINT fk_warehouse_inventory_bin;
ALTER TABLE public.warehouse_inventory VALIDATE CONSTRAINT fk_warehouse_inventory_warehouse;
ALTER TABLE public.warehouse_inventory VALIDATE CONSTRAINT fk_warehouse_inventory_zone;
ALTER TABLE public.warehouse_movement_logs VALIDATE CONSTRAINT fk_warehouse_movement_logs_inventory;
ALTER TABLE public.warehouse_movement_logs VALIDATE CONSTRAINT fk_warehouse_movement_logs_warehouse;
ALTER TABLE public.warehouse_pick_lists VALIDATE CONSTRAINT fk_warehouse_pick_lists_inventory;
ALTER TABLE public.warehouse_pick_lists VALIDATE CONSTRAINT fk_warehouse_pick_lists_user;
ALTER TABLE public.trust_signatures VALIDATE CONSTRAINT fk_trust_signatures_subject;
ALTER TABLE public.trust_signatures VALIDATE CONSTRAINT fk_trust_signatures_signer;

COMMIT;
