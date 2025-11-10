UI permission helpers

This folder contains small UI-facing helpers for role/permission checks that wrap the canonical resolver in `@workspace/store`.

canManageInstructorsFromRoles
- Import: `import { canManageInstructorsFromRoles } from '@workspace/ui/lib/permissions'`
- Purpose: Return a boolean indicating whether the provided roles (or the currently-active profile's role) should be allowed to manage instructors in UI components.
- Behavior: Delegates to `resolvePermissionsFromRoles` (store-level canonical resolver), and additionally permits `dispatcher_basic` at the UI layer per product requirement.

Recommended usage
- Prefer reading roles from the shared profile store in client components, e.g.:
  ```ts
  import { useProfileStore } from '@workspace/store/useProfileStore'
  import { canManageInstructorsFromRoles } from '@workspace/ui/lib/permissions'

  const profileRoles = useProfileStore((s) => s.profile?.access_role ? [String(s.profile.access_role)] : [])
  const canManage = canManageInstructorsFromRoles(profileRoles)
  ```

- The helper intentionally keeps UI-layer allowances separate from server-side authorization. Always enforce permissions on the server for sensitive operations.
