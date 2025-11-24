# Unified Permissions System

This directory contains the Unified Permissions System, a centralized engine for managing access control across the application. It replaces scattered `if` checks with a structured, rule-based approach.

## Core Concepts

### 1. Roles (`NavRole`)
Defined in `types.ts`. Represents the user's role in the application (e.g., `team_member`, `pod_leader`, `admin`).

### 2. Scopes (`VisibilityScope`)
Defined in `types.ts`. Represents the *level* of access being requested.
- `private`: Own data only.
- `pod_specific`: Access to a specific pod's data.
- `regional`: Access to data within the user's region.
- etc.

### 3. Context (`PermissionsContext`)
Data required to evaluate permissions.
```typescript
interface PermissionsContext {
    userId?: string;
    navRole?: NavRole;
    userPods?: string[]; // IDs of pods the user belongs to
    targetPodId?: string; // ID of the pod being accessed
    // ... other context fields
}
```

## How It Works

The `evaluateAccess` function (in `unifiedEngine.ts`) follows a 3-step pipeline:

1.  **Temporary Overrides**: Checks `tempResolvers.ts`. Used for special cases like `admin_override` or time-bound events.
2.  **Role Gating**: Checks `roleRules.ts`. Does the user's role *allow* them to potentially access this scope? (e.g., a `team_member` can never access `regional` scope).
3.  **Scope Resolution**: Checks `scopeResolvers.ts`. Does the user have the specific relationship required? (e.g., for `pod_specific`, is the user actually a member of `targetPodId`?).

## Usage

Use the `useUnifiedAccess` hook (or call `evaluateAccess` directly).

```typescript
import { useUnifiedAccess } from './utils/permissions/useUnifiedAccess';

const context = {
    userId: 'user-123',
    navRole: 'pod_leader',
    userPods: ['pod-a'],
    targetPodId: 'pod-a'
};

const result = useUnifiedAccess('pod_specific', context);

if (result.access) {
    console.log("Access granted!");
} else {
    console.log("Access denied:", result.reason);
}
```

## Extending the System

### Adding a New Role
1.  Add the role to `NavRole` in `types.ts`.
2.  Update `roleRules.ts` to specify which scopes this role can access.

### Adding a New Scope
1.  Add the scope to `VisibilityScope` in `types.ts`.
2.  Add a resolver in `scopeResolvers.ts` to define the logic (e.g., checking IDs).
3.  Update `roleRules.ts` to define which roles are allowed to use this scope.

### Debugging
The `VisibilityResult` object contains a `debug` array that traces the evaluation steps.
## Migration from Legacy Systems

### `hasRole`
The `hasRole` function in `utils/access.ts` is **deprecated**.
- **Old:** `if (hasRole(role, ['admin'])) ...`
- **New:** `if (evaluateAccess('admin_override', ctx).access) ...`

Use `evaluateAccess` (server) or `useUnifiedAccess` (client) for all new access control logic.
