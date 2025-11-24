# PK/UUID Audit (Always Ready Tools Supabase)

Scope: highlights tables without UUID primary keys or missing explicit PKs based on current migration definitions. Use this to prioritize future key standardization.

- `pods` — PK TEXT (not UUID)
- `roster_entries` — PK TEXT (not UUID)
- `pod_shifts` — PK TEXT (not UUID)
- `pod_shift_signups` — PK TEXT (not UUID)
- `dispatch_submissions` — PK TEXT (not UUID)
- `dispatch_updates` — PK TEXT (not UUID)
- `dispatch_logistics` — PK TEXT (not UUID)
- `dispatch_shifts` — PK TEXT (not UUID)
- `com_logs` — PK TEXT (not UUID)
- `com_briefings` — PK TEXT (not UUID)
- `academy_instructors` — PK TEXT (not UUID)
- `academy_classes` — PK TEXT (not UUID)
- `academy_sessions` — PK TEXT (not UUID)
- `academy_participants` — PK TEXT (not UUID)
- `organizations` — PK TEXT (not UUID)
- `organization_pods` — PK TEXT (not UUID)
- `warehouse_zones` — PK TEXT (not UUID)
- `warehouse_bins` — PK TEXT (not UUID)
- `warehouse_inventory` — PK TEXT (not UUID)
- `warehouse_movement_logs` — PK TEXT (not UUID)
- `warehouse_pick_lists` — PK TEXT (not UUID)
- `missing_person_records` — PK TEXT (not UUID)
- `trust_signatures` — composite PK (no UUID key)

Notable tables already on UUIDs: `notification_recipients`, `notifications`, `meet_a_need`, `wizard`, `bug_reports`, `advocacy_groups`, `advocacy_delivery_logs`, `organization_roles`.
