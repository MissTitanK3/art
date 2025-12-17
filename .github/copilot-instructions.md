# ART Monorepo Copilot Instructions

## Project Context
- **Architecture**: Monorepo (Turborepo) with decentralized Next.js 15 apps (`apps/region-*`) and shared packages (`packages/*`).
- **Core Principle**: **Decentralization & Privacy**. Each region runs its own Supabase instance. PII never leaves the region.
- **Tech Stack**: Next.js 15 (App Router), React 19, TypeScript, Supabase (Auth/DB/Realtime), TailwindCSS, Zustand.

## Critical Workflows
- **Dev Server**: `pnpm dev` (starts all apps via Turbo).
- **Build**: `pnpm build` (requires `.env` files).
- **Lint/Typecheck**: `pnpm lint` (runs ESLint and `tsc --noEmit`).
- **Region Alignment**: Run `node scripts/check-align-regions.mjs` to ensure all region apps stay in sync.
- **Academy Content**: `pnpm run generate:academy-course-details` regenerates course data.

## Architecture & Patterns

### 1. Database & Schema
- **Source of Truth**: `packages/store/src/db_maintenance/init_region.sql` and `init_rls.sql`.
- **RLS**: Row Level Security is **mandatory**. Policies rely on `auth.uid()` and `request.jwt.claims`.
- **Migrations**: Add incremental SQL files to `packages/store/src/db_maintenance/migrations/`.
- **Types**: DB types are shared in `packages/store/src/types/*`. **Do not** manually redefine DB shapes in apps.

### 2. Authentication & Supabase
- **Environment**: Use `ensureSupabaseEnv(target)` from `@/lib/auth/supabase/utils` to resolve credentials for `server`, `client`, or `admin`.
- **Server-Side**: Use `createSupabaseServerClient()` in Server Components/Actions/API routes.
- **Client-Side**: Use `createSupabaseClient()` (or app-specific wrapper).
- **Service Role**: Use **only** for admin tasks (e.g., system notifications) where RLS must be bypassed. See `apps/region-pnw/app/api/bug-reports/route.ts` for a safe pattern.

### 3. Shared Code & Imports
- **UI Components**: Import from `@workspace/ui/components/*`.
- **Store/State**: Import Zustand stores from `@workspace/store/*`.
- **Utils**: Use `@workspace/ui/lib/utils` for `cn` (Tailwind merge) and formatting helpers.
- **Path Aliases**:
  - `@/*` -> App root (e.g., `apps/region-pnw/*`)
  - `@workspace/ui/*` -> `packages/ui/src/*`
  - `@workspace/store/*` -> `packages/store/src/*`

### 4. API Route Pattern
- **Validation**: Always validate inputs (Zod or manual checks).
- **Auth Check**: explicitly check `supabase.auth.getUser()` before sensitive operations.
- **Error Handling**: Return structured JSON errors.

```typescript
// Example: apps/region-pnw/app/api/example/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // ... logic ...
}
```

### 5. Date & Time
- Use `luxon` or `date-fns` for manipulation.
- Use `combineLocalDateTime` and `isoToLocalDateTimeInput` from `@workspace/ui/lib/utils` for form inputs.

## Do Not
- **Do not** introduce cross-region data fetching in client code.
- **Do not** commit secrets or `.env` files.
- **Do not** modify generated files (e.g., `course-details.generated.ts`) manually.

