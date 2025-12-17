# Per-Dispatch Member Permissions - Quick Reference

## What Changed

✅ **Database**: Added `member_permissions` JSONB column to `dispatch_submissions`
✅ **Types**: Added `DispatchPermissionLayer` type and `member_permissions` field
✅ **Component**: New `MemberPermissionsManager` for UI control
✅ **Logic**: Updated `resolveVisibility()` to check member overrides first
✅ **UI**: Added "Manage Member Access" button in Visibility & Sharing card

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  User Views Dispatch                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
          ┌──────────────────────┐
          │  Is user creator?    │
          └─────┬───────────┬────┘
                │ Yes       │ No
                ▼           ▼
          ┌─────────┐  ┌───────────────────────────────┐
          │  Full   │  │  Check member_permissions     │
          │ Access  │  │  for viewer's profile_id      │
          └─────────┘  └─────┬─────────────────────┬───┘
                             │ Found custom perms   │ None
                             ▼                      ▼
                    ┌──────────────────┐    ┌─────────────┐
                    │ Apply custom     │    │ Apply role- │
                    │ permissions      │    │ based perms │
                    └──────────────────┘    └─────────────┘
```

## UI Flow

### For Coordinators (Assigning Permissions)

1. **Navigate**: Dispatch → Details tab
2. **Locate**: "Visibility & Sharing" card (near top)
3. **Click**: "Manage Member Access" button
4. **Configure**: Check/uncheck permission layers for each member
5. **Save**: Click "Save Permissions"

### For Members (Receiving Permissions)

1. **Assigned**: Member is assigned to dispatch via Roles tab
2. **Default**: Sees tabs based on platform role (e.g., team_member = limited)
3. **Custom**: If granted custom permissions, sees additional tabs
4. **Visual**: Tabs appear/disappear based on permission layers

## Permission Mapping

| Layer         | Grants Access To              | UI Elements                    |
|---------------|------------------------------|--------------------------------|
| Awareness     | Basic details                | Always visible to all          |
| Planning      | Operational info             | Planning tab, intended actions |
| Coordination  | Sensitive data               | Roles tab, notes, Signal links |
| Outcomes      | Impact metrics               | Impact metrics section         |

## Example Scenarios

### Scenario 1: Field Medic Needs Updates

**Problem**: Medic (team_member role) can't see dispatch updates
**Solution**: Grant "awareness" + "planning" permissions
**Result**: Medic can now see Planning tab with updates

### Scenario 2: Trusted Volunteer Coordination

**Problem**: Experienced volunteer needs to coordinate but isn't dispatcher
**Solution**: Grant "awareness" + "planning" + "coordination"
**Result**: Can see Roles tab, Signal links, volunteer attribution

### Scenario 3: Remove Custom Access

**Problem**: Member no longer needs elevated access
**Solution**: Uncheck all custom permissions or remove from dialog
**Result**: Reverts to default role-based access

## Testing Checklist

- [ ] Run migration: `20241217_add_dispatch_member_permissions.sql`
- [ ] Create dispatch as coordinator
- [ ] Assign team_member to a role
- [ ] Verify limited default access (Overview + Public Engagement only)
- [ ] Open "Manage Member Access"
- [ ] Grant "planning" permission
- [ ] Verify Planning tab now visible to member
- [ ] Remove custom permission
- [ ] Verify member reverts to limited access

## Technical Notes

- Custom permissions stored as: `{ "profile_id": ["awareness", "planning"] }`
- Empty array or missing key = use default role permissions
- Creator always has full access regardless of settings
- RLS policies remain unchanged - this is UI-level control
- Changes persist to database immediately via `onUpdateSubmission`
