# region-stg (ART Region STG)

This is a region app in the ART monorepo.

## Getting started
- Copy .env.example to .env.local and fill in the values
- Start dev server: pnpm --filter region-stg dev

## Environment
- NEXT_PUBLIC_SITE_URL: Public site URL
- NEXT_PUBLIC_AUTH_PROVIDER: Auth provider for this region
- REVERSE_GEOCODE_CONTACT: Email used as contact when reverse geocoding services require it
- NEXT_PUBLIC_CONTACT_EMAIL: Public contact email displayed in the UI
- NEXT_PUBLIC_SUPABASE_URL: Supabase URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key
- SUPABASE_SERVICE_ROLE_KEY: Service role (server-only)

## Shared packages
- @workspace/ui: packages/ui
- @workspace/store: packages/store

See root README for monorepo scripts and conventions.

