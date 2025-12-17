# DB Maintenance — store package

This folder contains the canonical SQL for region-level “store” databases used by the apps in this monorepo.

The init scripts are intentionally numbered to make the apply order unambiguous and to keep each concern (schema, functions, RLS, indexes, notifications, push, views) in its own file.

Update the Authentication -> Sign In/ Providers to turn off confirm email.

## Files

- `1_init_region.sql` — primary schema (tables, enums, constraints) for region databases.
- `2_init_functions.sql` — helper functions and triggers (run after tables exist).
- `3_init_rls.sql` — Row Level Security enablement + policies (assumes a Supabase-style request environment via `auth.uid()` and `request.jwt.claims`).
- `4_init_idx.sql` — indexes and other performance helpers.
- `5_init_notifications.sql` — durable in-app notifications (tables + policies + helper RPCs).
- `6_init_push.sql` — web push subscription storage + policies (pairs with the `supabase/functions/push-worker` edge function).
- `7_init_views.sql` — reporting views/materialized views (run after base tables exist).
- `migrations/` — additive follow-up migrations. Prefer this for incremental changes after a DB is live.
- `SECURITY.md` — security guidance for these artifacts.

## Recommended Flow

### Fresh install (new region DB)

Apply scripts in this order:

1. `1_init_region.sql`
2. `2_init_functions.sql`
3. `3_init_rls.sql`
4. `4_init_idx.sql`
5. Optional: `5_init_notifications.sql` (in-app notifications)
6. Optional: `6_init_push.sql` (web push subscriptions + worker integration)
7. `7_init_views.sql`

### Existing deployment

- Put additive changes in `migrations/` and apply them like normal migrations.
- If you change tables/functions that RLS policies depend on, re-run `3_init_rls.sql` to ensure policies are present and up to date.
- If you change query patterns, add/adjust indexes in `4_init_idx.sql` (or via a migration), then re-run/refresh as needed.
- If you change view definitions, re-run `7_init_views.sql` (and `REFRESH MATERIALIZED VIEW ...` where applicable).

## Notifications + Push Notes

- `5_init_notifications.sql` creates:
  - `public.notifications` (the message)
  - `public.notification_recipients` (per-user state: read/dismissed)
  - `public.user_notifications` view (current-user join convenience)
  - helper RPCs like `public.mark_notification_read(...)`
- `5_init_notifications.sql` also enables extensions used by the optional worker scheduling pattern (`pgcrypto`, `pg_net`, `pg_cron`). If your host restricts extensions, comment those out or enable them via your provider dashboard first.
- The `public.user_notifications` view is created with invoker rights when supported (Postgres 15+). On older Postgres versions the view is still filtered to `auth.uid()` so it remains “current user only”.
- `6_init_push.sql` adds `public.notification_subscriptions` for storing Web Push subscriptions (endpoint + keys). Pair this with a trusted worker (e.g. `supabase/functions/push-worker`) that fans out unread notifications.

## Design notes

- Policies expect the application to provide `auth.uid()` and JSON `request.jwt.claims`. Confirm your auth provider maps those fields correctly (Supabase does this out of the box).
- The schema intentionally keeps some fields flexible (JSONB) for extensibility; where you need strong typing (dates, geo), prefer typed columns and explicit migrations.

## Running and testing

If you're using Supabase CLI or any migration runner, apply the scripts in the order listed under “Fresh install”.

### RLS quick test (local session simulation)

- Simulate dispatcher role in the session:

```sql
SELECT set_config('request.jwt.claims', '{"role":"dispatcher_verified"}', true);
```

- Run a query that should be allowed by the policies (e.g., read pods or manage dispatch entries).
- To simulate a regular user, set claims with the user's sub (UID):

```sql
SELECT set_config('request.jwt.claims', '{"sub":"user-uid-123","role":"user"}', true);
```

## Notes

- Some scripts use `DO $$ ... $$;` blocks for idempotency and conditional creation. If your DB host disallows `DO` blocks, split those statements into explicit `CREATE ... IF NOT EXISTS`/`DROP ... IF EXISTS` statements and run them with a privileged session.
- Never store or commit real PII or production secrets in SQL files. Use `SECURITY.md` for more details.

If you want, I can:

- convert `1_init_region.sql` typed-dates where appropriate (proposal + migration), or
- add a sample PostGIS/geometry migration to support geo queries, or
- create an automated SQL lint/CI check to detect fenced SQL blocks.
