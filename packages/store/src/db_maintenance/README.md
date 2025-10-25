# DB Maintenance — store package

This folder contains schema and RLS policy SQL for region-level store databases used by the apps in this monorepo.

Files
- `init_region.sql` — primary schema: tables for profiles, pods, roster, dispatch, academy, missing_person_records, trust_signatures. Includes idempotent indexes and CHECK constraints aligned with app types.
- `init_rls.sql` — Row Level Security enablement and policies. Assumes a Supabase-style request environment (`auth.uid()` and `request.jwt.claims`).
- `migrations/001_[template].sql` — starting point if you prefer follow-up migrations separate from `init_region.sql`.
- `SECURITY.md` — security guidance for these artifacts.

Design notes
- Policies expect the application to provide `auth.uid()` and JSON `request.jwt.claims`. Confirm your auth provider maps those fields correctly (Supabase does this out of the box).
- The schema intentionally keeps some fields flexible (JSONB) for extensibility; where you need strong typing (dates, geo), prefer typed columns and explicit migrations.

Running and testing
- If you're using Supabase CLI or a migration tool, apply `init_region.sql` first, then `init_rls.sql`. You can place incremental changes into files under `migrations/`.

RLS quick test (local session simulation)
1. Simulate dispatcher role in the session:

```sql
SELECT set_config('request.jwt.claims', '{"role":"dispatcher_verified"}', true);
```

2. Run a query that should be allowed by the policies (e.g., read pods or manage dispatch entries).

3. To simulate a regular user, set claims with the user's sub (UID):

```sql
SELECT set_config('request.jwt.claims', '{"sub":"user-uid-123","role":"user"}', true);
```

Notes
- The `DO $$ ... $$;` blocks in `init_rls.sql` and migration files perform dynamic checks/creation and may require elevated privileges in some hosting environments. If your DB host disallows `DO` blocks, split those statements into explicit ALTER/CREATE statements and run them with a privileged session.
- Never store or commit real PII or production secrets in SQL files. Use `SECURITY.md` for more details.

If you want, I can:
- convert `init_region.sql` typed-dates where appropriate (proposal + migration), or
- add a sample PostGIS/geometry migration to support geo queries, or
- create an automated SQL lint/CI check to detect fenced SQL blocks.
