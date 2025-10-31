# Navigation Roles and Access Guide

This guide documents the role taxonomy used across the app and how it maps to navigation access. It complements `packages/store/src/utils/nav.ts`, which exports role groupings and helpers used by nav configuration.

## Roles (lowest → highest)

- team_member — onboarded volunteer; core features only
- pod_leader — leads a pod; manages local coordination
- trainer — facilitates training and classes
- dispatcher_basic — dispatcher with limited duties or in training
- dispatcher_verified — verified dispatcher with broader permissions
- dispatcher_admin — admin dispatcher; manages sessions and instructors
- admin — region admin (alias used in some contexts)
- regional_admin — explicit region‑level admin
- national_admin — cross‑region oversight

These are string literals in code; see `NavRole` in `nav.ts`.

## Access Groupings

Use these arrays from `nav.ts` when authoring the global nav to keep intent clear and consistent.

- completeOnboarding
  - Who: anyone considered “onboarded” (all roles above)
  - Example routes: `/watch`, `/academy`, `/intents`, `/roles`, `/impact`, `/pods`, `/pods/new`, `/missing-persons`

- elevatedRoles
  - Who: trusted to coordinate dispatch work
  - Example routes: `/dispatches`, `/schedules`, `/team-req`

- podAdmins (aka localAdmins)
  - Who: trusted to manage people/pods and view admin console
  - Example routes: `/admin` and its sections

- regionAdmins
  - Who: full administrative powers at the region
  - Use for highly sensitive admin surfaces

- nationalAdmins
  - Who: cross‑region oversight
  - Use for cross‑region or global ops surfaces

## Helpers

- isActive(href, pathname)
  - Returns true when `pathname` matches `href` or is a subpath of it. Accepts absolute or relative hrefs.
- canSee(item, role)
  - If `item.roles` is empty/undefined → public (visible to all)
  - If `item.roles` is set → requires an explicit match of `role`

## Authoring Nav Config

Nav items are specified using `NavItemInput` (string icon id; roles are optional).

```ts
import { completeOnboarding, elevatedRoles, podAdmins } from '@workspace/store/utils/nav';

export const nav = {
  brand: { name: 'ART Dispatch', href: '/', logoSrc: '/logo.svg' },
  primary: [
    { label: 'Watch', href: '/watch', icon: 'watch', roles: completeOnboarding },
    { label: 'Dispatches', href: '/dispatches', icon: 'dispatch', roles: elevatedRoles },
    { label: 'Admin', href: '/admin', icon: 'admin', roles: podAdmins },
  ],
} as const;
```

At runtime, the UI transforms `NavItemInput` into `NavItem` (resolving the `icon` id to a component) and uses `canSee` to filter items for the current user’s role.

## Tips

- Prefer the exported groupings (e.g., `elevatedRoles`) to hard‑coding role lists.
- Treat “no `roles` on an item” as intentionally public.
- When adding a new role, update the groupings in `nav.ts` and this doc accordingly.

