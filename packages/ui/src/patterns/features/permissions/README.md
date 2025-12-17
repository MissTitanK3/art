# Per-Dispatch Member Permissions

## Overview

This feature allows dispatch coordinators to grant specific visibility layers to individual dispatch members, overriding their default role-based permissions. This is useful for:

- Granting field volunteers access to operational details without changing their platform role
- Allowing specific members to see sensitive coordination info
- Controlling access to outcome metrics on a per-dispatch basis

## Architecture

### Database Schema

**Table**: `public.dispatch_submissions`
**New Column**: `member_permissions` (JSONB)

```typescript
{
  "profile_id_1": ["awareness", "planning"],
  "profile_id_2": ["awareness", "planning", "coordination", "outcomes"]
}
```

### Permission Layers

1. **Awareness** - Basic details visible to org + region coordinators
   - Location, event date, urgency, status
   
2. **Planning** - Operational details for coordinators
   - Intended actions, logistics, updates
   
3. **Coordination** - Sensitive information
   - Notes, Signal links, roster management, volunteer attribution
   
4. **Outcomes** - Impact metrics (post-completion)
   - People served, resources distributed, risk assessment

### TypeScript Types

```typescript
export type DispatchPermissionLayer = 'awareness' | 'planning' | 'coordination' | 'outcomes';

interface DispatchSubmission {
  // ... existing fields
  member_permissions?: Record<string, DispatchPermissionLayer[]>;
}
```

## Usage

### For Coordinators

1. Navigate to a dispatch in the **Details** tab
2. Find the **Visibility & Sharing** card
3. Click **Manage Member Access**
4. For each assigned member:
   - Check the permission layers you want to grant
   - Uncheck to remove access
5. Click **Save Permissions**

### Visibility Logic

The system resolves visibility in this order:

1. **Creator**: Full access to all layers
2. **Custom Member Permissions**: Check `member_permissions` for viewer's profile_id
3. **Role-Based Access**: Fall back to default role permissions

```typescript
const resolveVisibility = () => {
  if (isCreator) return fullAccess;
  
  // Check custom permissions first
  const customPerms = member_permissions[viewerProfileId];
  if (customPerms?.length > 0) {
    return mapCustomPermissions(customPerms);
  }
  
  // Fall back to role-based
  return mapRolePermissions(viewerRole);
}
```

## Migration

To apply this feature to an existing region:

```bash
psql $DATABASE_URL -f packages/store/src/db_maintenance/migrations/20241217_add_dispatch_member_permissions.sql
```

## UI Components

### MemberPermissionsManager

Location: `packages/ui/src/patterns/features/permissions/member-permissions-manager.tsx`

**Props**:
- `submission`: DispatchSubmission - The dispatch data
- `roster`: RosterEntry[] - Available members
- `onUpdate`: Function to save changes
- `canManage`: Boolean - Whether user can manage permissions

**Features**:
- Lists all assigned dispatch members
- Checkbox interface for each permission layer
- Visual indicators for custom vs default access
- Persists to `dispatch_submissions.member_permissions`

## Security Considerations

- Only creators and coordinators (dispatcher_verified+, admins) can manage member permissions
- RLS policies still apply - custom permissions only affect UI visibility
- Member permissions are dispatch-specific and don't affect platform-wide access
- Empty array or missing profile_id means default role-based access

## Examples

### Grant Planning Access to Field Volunteer

```typescript
// A team_member assigned as "medic" needs to see updates
onUpdateSubmission({
  member_permissions: {
    "profile-123": ["awareness", "planning"]
  }
});
```

### Full Coordination Access for Trusted Member

```typescript
// A volunteer needs full coordination access for this specific dispatch
onUpdateSubmission({
  member_permissions: {
    "profile-456": ["awareness", "planning", "coordination"]
  }
});
```

### Remove Custom Permissions

```typescript
// Revert to role-based permissions
onUpdateSubmission({
  member_permissions: {
    // Remove the profile_id key or set to []
  }
});
```

## Testing

1. Create a dispatch as a dispatcher/admin
2. Assign a team_member to a role
3. Note they only see Overview and Public Engagement tabs
4. Grant them "planning" permission via Manage Member Access
5. Verify they now see the Planning tab
6. Remove custom permissions
7. Verify they revert to default access

## Future Enhancements

- Bulk permission assignment for multiple members
- Permission templates for common scenarios
- Audit log for permission changes
- Time-based permission expiration
- Auto-grant permissions based on field role
