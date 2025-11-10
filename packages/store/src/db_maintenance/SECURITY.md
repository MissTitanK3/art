# Always Ready Tools — Monorepo Security Policy

**Version:** 2025-10-23

---

## 1. 🔐 Purpose

This repository contains open-source code and SQL definitions for region-level dispatch databases.  
The schema and policy SQL files (init_region.sql, policies_region.sql) are safe to publish publicly.  
They define structure and access control, not secrets or private data.

---

## 2. ✅ Safe to Publish

These files may be committed and shared:

- packages/store/src/db_maintenance/init_region.sql
- packages/store/src/db_maintenance/init-rls.sql
- Any schema-only or migration scripts without credentials
- Example seed files with dummy data (not production records)

These files only describe tables, constraints, and Row Level Security (RLS) logic.  
They cannot be used to access any database directly.

---

## 3. ⚠️ Never Commit

Do not commit or share the following:

| Type            | Examples                                                          | Reason                                    |
| --------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| Secrets         | .env, Supabase anon or service_role keys, API tokens              | Direct access to live data                |
| Private data    | Real missing_person_records, dispatch logs, or legal aid contacts | Personally identifiable information (PII) |
| Supabase config | supabase/config.toml, supabase/.env, credentials in scripts       | Exposes project connection settings       |
| Local dumps     | .sql exports from running databases                               | Contain production data                   |

Add these to .gitignore if not already:

supabase/.env  
supabase/config.toml  
_.dump.sql  
.env  
.env._

---

## 4. 🧱 RLS and Auth Safety

- All tables in this schema must enable Row Level Security.
- Only authenticated users with verified JWT claims can write or manage records.
- service_role keys bypass RLS, use only in backend or serverless functions.
- Verify RLS behavior before each deployment with:  
  supabase db test --file packages/store/src/db_init/policies_region.sql

---

## 5. 🔄 Version Control Hygiene

- Keep schema evolution atomic: one migration per commit.
- Squash old migrations occasionally to reduce attack surface.
- If you must discuss security-sensitive reasoning in commit messages, use private issue tracking.

---

## 6. 🧠 Developer Guidelines

- Use development keys only when testing locally.
- Keep region databases isolated per deployment (region_west, region_pnw, etc.).
- Never test RLS bypass attempts in production.
- Prefer JSONB with whitelisted keys for variable payloads. Avoid raw SQL string interpolation.

---

# Always Ready Tools — Monorepo Security Policy

**Version:** 2025-10-23

This folder holds schema and policy SQL for region-level dispatch databases. The files here describe structure and Row Level Security (RLS) rules only — they must not contain production secrets or real PII.

1. Paths and filenames

- The canonical SQL files for this repo live under `packages/store/src/db_maintenance/`.
  - Schema: `packages/store/src/db_maintenance/init_region.sql`
  - RLS / policies: `packages/store/src/db_maintenance/init_rls.sql`
- Older documentation referenced `packages/store/src/db_init` and a dashed `init-rls.sql`; those are outdated. Use the `db_maintenance` paths above.

2. Safe to publish

The following are safe to commit and share publicly if they contain no credentials or real data:

- `init_region.sql`, `init_rls.sql` (schema + RLS definitions)
- Schema-only migration scripts (no connection strings)
- Example seed files containing dummy/test data only

3. Never commit

Do NOT commit or share:

- Secrets and API keys (.env, supabase/.env, supabase/config.toml, service_role keys)
- Real production data (missing_person_records, dispatch logs, legal aid contacts, exports)
- Local DB dumps (.dump.sql) that may include PII

Add these to .gitignore where appropriate (common patterns):

```
supabase/.env
supabase/config.toml
*.dump.sql
.env
.env.*
```

4. RLS and auth safety — practical notes

- All tables in this schema should have Row Level Security enabled (the `init_rls.sql` file explicitly enables RLS for the public tables in this directory).
- Policies assume a Supabase-style environment: `auth.uid()` provides the request user id, and `current_setting('request.jwt.claims', true)::json->>'role'` contains role claims. Ensure your application sets these consistently.
- The `init_rls.sql` file includes a `DO $$ ... $$;` block that enables RLS across `public` tables. This block runs dynamic SQL and may require elevated privileges in some hosts. If your migration runner can't execute DO blocks, run the explicit ALTER statements at the top of the file instead.
- To test RLS locally you can simulate JWT claims in a session (example below).

5. Data hygiene and structure guidance (short)

- Use typed date/time columns where you need to query or sort (avoid storing structured timestamps as TEXT if you plan to filter or aggregate by date).
- Prefer CHECK constraints or PostgreSQL enums for frequently-used status fields (e.g. `dispatch_submissions.status`) to avoid inconsistent free-text values.
- Add indexes for common lookup columns (examples: `profiles.user_id`, `roster_entries.pod_id`, `dispatch_submissions.status`), and GIN indexes for JSONB fields that are filtered frequently.

6. Quick RLS testing snippets

-- simulate a session with dispatcher role
SELECT set_config('request.jwt.claims', '{"role":"dispatcher_verified"}', true);

-- simulate the current user id (your environment must map auth.uid() from your auth layer).
-- In Supabase the `auth.uid()` value is provided by the platform; for local DB-only testing, you can set and use a helper session variable or test queries as the authenticated user.

7. Migration hygiene

- Keep migrations small and idempotent. Prefer explicit ALTER/CREATE statements over wide dynamic DO blocks when possible.
- This repo now includes a small additive migration `001_add_indexes_and_constraints.sql` (in the same folder) that adds recommended indexes and a sample CHECK constraint for dispatch status — run it after applying your schema.

8. Reporting security issues

If you discover a vulnerability or misconfiguration:

- Do not open a public GitHub issue.
- Email the maintainers privately at: security@alwaysready.tools with steps to reproduce and environment details.

9. Reference and links

- Supabase Security Guide
- PostgreSQL Row Level Security
- CWE-200: Information Exposure
