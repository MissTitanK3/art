## Copilot instructions for this repo (ART monorepo)

Use these guardrails to be productive fast and avoid breaking cross-app contracts.

### Big picture
- Monorepo managed by pnpm + Turborepo. Apps live in `apps/*` (Next.js 15), shared libs in `packages/*` (`ui`, `store`, configs).
- Regions are independent Next.js apps (e.g., `apps/region-pnw`) that talk to their own Supabase/Postgres. No cross-region PII.
- Data layer lives in SQL under `packages/store/src/db_maintenance/**`. RLS enforces per-user/role access; apps must respect it.

### Build, run, and lint
- Node >= 20, pnpm 10.x.
- Root scripts (run from repo root):
  - `pnpm dev` → `turbo dev` (starts one or more Next apps)
  - `pnpm build` → `turbo build` (uses `.env*` and injects NEXT_PUBLIC_* vars; see `turbo.json` env list)
  - `pnpm lint` → `turbo lint`; app-level `typecheck` via `tsc --noEmit`
- Prebuild step auto-generates course details: `scripts/generate-academy-course-details.mjs` writes `packages/ui/src/data/academy/course-details.generated.ts` (do not edit manually).

### Path aliases and shared code
- Region apps use TS paths (see `apps/region-*/tsconfig.json`):
  - `@/*` → app root; `@/types/*`, `@/utils/*`, etc.
  - `@workspace/ui/*` → `packages/ui/src/*` (design system + feature components)
  - `@workspace/store/*` → `packages/store/src/*` (Zustand stores, shared types, helpers)
- Prefer using shared types (e.g., `packages/store/src/types/*`) rather than re-declaring shapes.

### Supabase auth/data patterns
- Client/SSR helpers live per app. Example (region apps):
  - `apps/region-pnw/lib/auth/supabase/utils.ts` → `ensureSupabaseEnv(target)` resolves env sets for `server|client|admin`.
  - `apps/region-pnw/lib/auth/supabase/server.ts` → `createSupabaseServerClient(target)` for SSR/API; `createSupabaseAdminServiceClient()` for service-role ops.
- Watch app uses `@supabase/ssr` on the server and `@supabase/supabase-js` on the client (see `apps/watch/utils/supabase/*`).
- When adding API routes, import the server client and call tables through RLS; only use the service client for privileged, server-only tasks.

### Environment variables (per app)
- Required at build/runtime (see `turbo.json` env): `NEXT_PUBLIC_AUTH_PROVIDER`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`; optional `SUPABASE_SERVICE_ROLE_KEY` for server actions.
- Admin-targeted ops may use `NEXT_PUBLIC_SUPABASE_URL_ADMIN`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_ADMIN`, `SUPABASE_SERVICE_ROLE_KEY_ADMIN` (see region `utils.ts`).
- Do not commit real secrets. Provide `.env.example` updates when adding new required vars.

### Database schema and migrations
- Canonical schema: `packages/store/src/db_maintenance/init_region.sql`; RLS: `init_rls.sql`.
- Incremental changes live in `packages/store/src/db_maintenance/migrations/*.sql`. Use the existing files in `migrations_complete/` as examples.
- If you add/modify tables used by UI, also update shared types in `packages/store/src/types/*` and ensure RLS rows match the app’s access patterns.
- Local policy testing: see instructions in `packages/store/src/db_maintenance/README.md` (simulate `request.jwt.claims`).

### Creating a new region app
- Use `scripts/create-region.mjs` to copy `apps/region-template` (or `--supa` to copy from `region-pnw`). It will rename, update package metadata, and replace template references.
- After creation, wire env vars and branding (nav, layout, `public/site.webmanifest`) as hinted in the script.

### UI and patterns to follow
- Reuse components from `packages/ui/src/components/**` (maps, forms, academy, dispatch, status badges, etc.).
- For state, prefer existing Zustand stores in `packages/store/src/*` (e.g., `useDispatchStore`, `useProfileStore`) before introducing new ones.
- HTTP/fetch helpers in `packages/ui/src/lib/http.ts` and feature-specific helpers (e.g., maps and QR code libs) should be reused.

### Coding conventions
- ESLint config from `packages/eslint-config/*`; run `pnpm lint` and `pnpm -w format` before committing.
- Next.js App Router throughout; server actions and API routes must use the SSR Supabase client and never leak PII across regions.
- Keep generated files and `.next/**` out of source edits; avoid touching `.turbo/` and app `.next/` folders.

### Concrete examples
- Server route pattern (region): `apps/region-pnw/app/api/bug-reports/route.ts` → uses `createSupabaseServerClient()` and checks `auth.getUser()`.
- Env health check: `apps/region-pnw/app/api/debug/env/route.ts` shows minimal presence checks for required vars.
- Map components and data: `packages/ui/src/components/maps/*` consume shared types from `packages/store/src/types/maps.ts`.

If anything here seems ambiguous (e.g., missing test workflow, a new env var, or a pattern you can’t find in `ui`/`store`), flag it and propose a minimal, repo-consistent addition.