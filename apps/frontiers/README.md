# Frontiers

A Next.js application for managing fleets, missions, and resonance effects in a space-themed multiplayer environment.

## Overview

Frontiers is a web-based space exploration game where players manage ships, crew, and missions while interacting with other players through a resonance system. The application features real-time updates via Supabase, a sophisticated crew management system, and an interactive map interface.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript (strict mode)
- **Database & Realtime**: [Supabase](https://supabase.com/)
- **Styling**: TailwindCSS (via `@workspace/ui`)
- **State Management**: Zustand (via `@workspace/store`)
- **Testing**: Jest + React Testing Library + Playwright
- **Maps**: Leaflet for interactive map visualization

## Architecture

```mermaid
graph TD
    A[Next.js App] --> B[Supabase]
    A --> C[@workspace/ui]
    A --> D[@workspace/store]
    
    B --> E[PostgreSQL Database]
    B --> F[Realtime Subscriptions]
    
    A --> G[Gate Components]
    A --> H[Sync Agents]
    A --> I[Realtime Components]
    
    G --> G1[AuthModalGate]
    G --> G2[NavbarGate]
    
    H --> H1[ProfileSyncAgent]
    H --> H2[MissionsSyncAgent]
    
    I --> I1[ResonanceRealtime]
    
    style A fill:#0070f3
    style B fill:#3ecf8e
    style C fill:#f0f0f0
    style D fill:#f0f0f0
```

### Key Components

- **Gate Components**: Control UI visibility based on app state
  - `AuthModalGate`: Manages authentication modal display
  - `NavbarGate`: Conditionally renders navigation bar

- **Sync Agents**: Handle background data synchronization
  - `ProfileSyncAgent`: Keeps player profile data in sync
  - `MissionsSyncAgent`: Periodically syncs mission progress

- **Realtime Components**: Manage real-time subscriptions
  - `ResonanceRealtime`: Handles incoming resonance effects from other players

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- Supabase project (for database and realtime features)

### Installation

1. Clone the monorepo and navigate to the frontiers app:
   ```bash
   cd apps/frontiers
   ```

2. Install dependencies (from monorepo root):
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required values (see [Environment Variables](#environment-variables) below).

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

The following environment variables are required:

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key (public) | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_REGION_ID` | Region identifier for this deployment | Internal configuration |
| `INTERNAL_KEY` | Internal API key for server-side operations | Generate a secure random string |
| `FRONTIERS_URL` | Base URL of your deployment | e.g., `https://your-app.vercel.app` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Supabase Dashboard → Project Settings → API |

**Important**: Never commit `.env.local` to version control. The service role key should NEVER be exposed to the client.

## Directory Structure

```
frontiers/
├── app/                    # Next.js app directory (routes)
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── fleet/             # Fleet management pages
│   ├── profile/           # User profile pages
│   └── seasons/           # Seasonal content pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── fleet/            # Fleet-related components
│   ├── map/              # Map components
│   ├── HUD/              # Heads-up display components
│   └── __tests__/        # Component tests
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and helpers
│   ├── map/             # Map-related utilities
│   └── __tests__/       # Unit tests for utilities
├── schemas/              # TypeScript type definitions (Zod schemas)
├── store/                # Zustand state stores
├── tests/                # Test configuration and utilities
├── e2e/                  # Playwright E2E tests
└── supabase/             # Supabase types and migrations

```

For more details on the architecture and component organization, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Development

### Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm typecheck    # Run TypeScript compiler (type checking only)
pnpm test         # Run Jest unit tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Generate test coverage report
pnpm test:e2e     # Run Playwright E2E tests
pnpm test:e2e:ui  # Run Playwright tests with UI
```

### Testing

The project uses a multi-layered testing approach:

- **Unit Tests** (Jest + React Testing Library): Test individual components and utility functions
- **E2E Tests** (Playwright): Test critical user flows end-to-end

Run all tests:
```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
```

### Code Quality

- **TypeScript**: Strict mode enabled for maximum type safety
- **ESLint**: Configured via `@workspace/eslint-config`
- **Type Checking**: Run `pnpm typecheck` before committing

## Deployment

The frontiers app is designed to be deployed on [Vercel](https://vercel.com/):

1. Connect your repository to Vercel
2. Set the root directory to `apps/frontiers`
3. Configure environment variables in Vercel dashboard
4. Deploy

For more details, see the [CI/CD section in ARCHITECTURE.md](./ARCHITECTURE.md#cicd--deployment).

## Contributing

This app is part of a larger monorepo. Please follow the monorepo's contribution guidelines:

1. Follow the established code style (enforced by ESLint)
2. Write tests for new features
3. Ensure `pnpm typecheck` and `pnpm lint` pass before submitting PRs
4. Update documentation as needed

## License

[Add license information here]

## Support

[Add support/contact information here]
